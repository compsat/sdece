import { createRxDatabase, addRxPlugin } from 'https://esm.sh/rxdb@15.18.0';
import { getRxStorageDexie } from 'https://esm.sh/rxdb@15.18.0/plugins/storage-dexie';

import * as ReplicationModule from 'https://esm.sh/rxdb@15.18.0/plugins/replication';

import { interval } from 'https://esm.sh/rxjs@7.8.1';
import { getFirestore, collection, getDocs, setDoc, updateDoc, doc, query, where, Timestamp, GeoPoint } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';
import { getApps } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js';

const RxDBReplicationPlugin = ReplicationModule.RxDBReplicationPlugin 
                          || ReplicationModule.default?.RxDBReplicationPlugin 
                          || ReplicationModule.default;

const replicateRxCollection = ReplicationModule.replicateRxCollection 
                          || ReplicationModule.default?.replicateRxCollection;

if (RxDBReplicationPlugin) {
  addRxPlugin(RxDBReplicationPlugin);
  console.log("RxDB Replication Plugin loaded successfully!");
} else {
  console.warn("Failed to find RxDBReplicationPlugin in module:", ReplicationModule);
}

const buklodSchema = {
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 100 },
    household_name: { type: 'string' },
    household_address: { type: 'string' },
    contact_number: { type: 'string' },
    number_residents: { type: 'number' },
    number_minors: { type: 'number' },
    number_seniors: { type: 'number' },
    location_coordinates: { 
      type: 'object',
      properties: {
        _lat: { type: 'number' },
        _lng: { type: 'number' }
      }
    },
    location_link: { type: 'string' },
    residency_status: { type: 'string' },
    is_hoa_noa: { type: 'string' },
    household_material: { type: 'string' },
    landslide_risk: { type: 'string' },
    fire_risk: { type: 'string' },
    flood_risk: { type: 'string' },
    earthquake_risk: { type: 'string' },
    storm_risk: { type: 'string' },
    _deleted: { type: 'boolean', default: false },
    updatedAt: { type: 'number', default: 0 }
  },
  required: ['id', 'household_name', 'updatedAt', '_deleted']
};

const evacCentersSchema = {
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    latitude: { type: 'number' },
    longitude: { type: 'number' },
    type: { type: 'string' },
    _deleted: { type: 'boolean', default: false },
    updatedAt: { type: 'number', default: 0 }
  },
  required: ['id', 'name', 'updatedAt', '_deleted']
};

let dbPromise = null;

export async function initDb(uid) {
  if (dbPromise) return dbPromise;

  dbPromise = await createRxDatabase({
    name: `buklod_app_${uid}`,
    storage: getRxStorageDexie(), 
    multiInstance: true,
    eventReduce: true
  });

  await dbPromise.addCollections({
    buklod: { schema: buklodSchema },
    evacCenters: { schema: evacCentersSchema }
  });

  return dbPromise;
}

export function startFirestoreSync(db, uid) {
  const firestore = getFirestore(getApps()[0]);

  // --- 1. SYNC BUKLOD (Households) TO TEST COLLECTION ---
  db.buklodSyncState = replicateRxCollection({ 
    collection: db.buklod,
    replicationIdentifier: 'buklod-test-sync-v3',
    live: true, 
    retryTime: 5 * 1000, 
    
    pull: {
      async handler(lastPulledDocument) {
        let q;
        if (lastPulledDocument?.updatedAt) {
          // INCREMENTAL PULL: Uses automatic single-field index on 'updatedAt'
          const lastPulledTime = Timestamp.fromMillis(lastPulledDocument.updatedAt);
          q = query(
            collection(firestore, 'buklod-official'),
            where('updatedAt', '>', lastPulledTime)
          );
        } else {
          // FIRST SYNC: Grabs everything (No index required, catches legacy data)
          q = query(collection(firestore, 'buklod-official'));
        }
        const snapshot = await getDocs(q);
        
        const documents = snapshot.docs.map(d => {
          const data = d.data();
          
          // Convert Firestore GeoPoint to local {_lat, _lng}
          let localCoordinates = null;
          if (data.location_coordinates instanceof GeoPoint) {
            localCoordinates = {
              _lat: data.location_coordinates.latitude,
              _lng: data.location_coordinates.longitude
            };
          } else if (data.location_coordinates?._lat != null) {
            localCoordinates = data.location_coordinates;
          }

          return {
            id: d.id,
            ...data,
            location_coordinates: localCoordinates, 
            // Ensure every doc has an updatedAt for the checkpoint
            updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now()
          };
        });

        return { documents, checkpoint: documents.length > 0 ? documents[documents.length - 1] : lastPulledDocument };
      },
      stream$: interval(10000) 
    },

    push: {
      async handler(rows) {
        const pushedDocs = [];
        for (const row of rows) {
          const docData = row.newDocumentState;
          
          const { id, _meta, location_coordinates, ...rest } = docData; 

          const cleanRest = JSON.parse(JSON.stringify(rest));

          let geoPoint = null;
          if (location_coordinates?._lat != null && location_coordinates?._lng != null) {
            geoPoint = new GeoPoint(location_coordinates._lat, location_coordinates._lng);
          }

          const ref = doc(firestore, 'buklod-official', id);
          
          await setDoc(ref, {
            ...cleanRest,
            location_coordinates: geoPoint, 
            _deleted: docData._deleted,
            userId: uid, 
            updatedAt: Timestamp.fromMillis(docData.updatedAt)
          }, { merge: true });
          
          pushedDocs.push(docData);
        }
        return pushedDocs;
      }
    }
  });

  // --- 2. SYNC EVAC CENTERS TO TEST COLLECTION ---
  db.evacSyncState = replicateRxCollection({
    collection: db.evacCenters,
    replicationIdentifier: 'evac-test-sync-v3',
    live: true, 
    retryTime: 5 * 1000, 
    
    pull: {
      async handler(lastPulledDocument) {
         let q;
        if (lastPulledDocument?.updatedAt) {
          const lastPulledTime = Timestamp.fromMillis(lastPulledDocument.updatedAt);
          q = query(
            collection(firestore, 'buklod-evac-centers'),
            where('updatedAt', '>', lastPulledTime)
          );
        } else {
          q = query(collection(firestore, 'buklod-evac-centers'));
        }
        const snapshot = await getDocs(q);
        
        const documents = snapshot.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now()
          };
        });

        return { documents, checkpoint: documents.length > 0 ? documents[documents.length - 1] : lastPulledDocument };
      },
      stream$: interval(10000) 
    },

    push: {
      async handler(rows) {
        const pushedDocs = []; 
        for (const row of rows) {
          const docData = row.newDocumentState;
          const { id, _meta, ...rest } = docData;
          
          // Deep clone to strip RxDB proxies
          const cleanRest = JSON.parse(JSON.stringify(rest));

          const ref = doc(firestore, 'buklod-evac-centers', id); 
          await setDoc(ref, {
            ...cleanRest, // Use cleanRest
            _deleted: docData._deleted,
            userId: uid, 
            updatedAt: Timestamp.fromMillis(docData.updatedAt)
          }, { merge: true });
          
          pushedDocs.push(docData); 
        }
        return pushedDocs;
      }
    }
  });

  db.buklodSyncState.error$.subscribe(err => {
    console.error("Buklod Sync Error:", err);
  });

  db.evacSyncState.error$.subscribe(err => {
    console.error("Evac Centers Sync Error:", err);
  });
}