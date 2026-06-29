import { createRxDatabase, addRxPlugin } from 'https://esm.sh/rxdb@15.18.0';
import { getRxStorageDexie } from 'https://esm.sh/rxdb@15.18.0/plugins/storage-dexie';

import * as ReplicationModule from 'https://esm.sh/rxdb@15.18.0/plugins/replication';

import { interval } from 'https://esm.sh/rxjs@7.8.1';
import { getFirestore, collection, getDocs, setDoc, updateDoc, doc, query, where, Timestamp, GeoPoint } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';
import { getApps } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js';

import { BUKLOD_RULES } from './firestore_UNIV';

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

let databases = []

export async function initDb(uid) {
  if (dbPromise && dbUid === uid) return dbPromise;
  if (dbPromise) {
    throw new Error(`initDb already initialized for uid=${dbUid}. Call resetDatabase() first.`)
  }

  dbPromise = await createRxDatabase({
    name: `buklod_app_${uid}`,
    storage: getRxStorageDexie(), 
    multiInstance: true,
    eventReduce: true
  });

  await dbPromise.addCollections({
    buklod: { schema: BUKLOD_RULES['schemas']['buklod']},
    buklodImport: {schema: BUKLOD_RULES['schemas']['buklod']}, // Collection exclusively used for data imports
    evacCenters: { schema: BUKLOD_RULES['schemas']['evacCenters']}
  });

  return dbPromise;
}


/**
 * Initializes a database given a prefix and uid. 
 * 
 * @param {string} prefix - The prefix of the database. (e.g. buklod_app, seeds)
 * @param {string} uid - The uid of the user. 
 * @returns the instantiated database. Returns null if the database already exists.
 */
export function createDatabase(prefix, uid) {
  const dbName = `${prefix}_${uid}`
  let database;
  try {
    database = await createRxDatabase({
      name: dbName,
      storage: getRxStorageDexie(),
      multiInstance: true,
      eventReduce: true
    })
  } catch (e) {
    console.error(`Database ${dbName} is already instantiated. Call resetDatabase() first.`)
    database = null;
  }
  return database
}

/**
 * Adds a collection to a given RxDatabase given a RxSchema.
 * For more information about RxSchema, review the {@link https://rxdb.info/rx-schema.html|documentation}
 * 
 * @param {RxDatabase} database - The RxDB database to add a collection to 
 * @param {string} collectionName - The name of the collection
 * @param {RxSchema} schema - The schema of the collection
 * @returns {RxCollection} - The collection that was instantiated
 */
export function addCollection(database, collectionName, schema) {
  await database.addCollection({collectionName: schema})
  return database[collectionName]
}

export function startFirestoreSync(db, uid) {
  console.log("Syncing local database with firestore...")
  const firestore = getFirestore(getApps()[0]);
  // --- 1. SYNC BUKLOD (Households) TO TEST COLLECTION ---
  console.log(`Syncing ${collections["buklod-tao"].households} with firestore...`)
  db.buklodSyncState = replicateRxCollection({ 
    collection: db.buklod,
    replicationIdentifier: 'buklod-test-sync-v9',
    live: true, 
    retryTime: 5 * 1000, 
    
    pull: {
      async handler(lastPulledDocument) {
        let q;
        if (lastPulledDocument?.updatedAt) {
          // INCREMENTAL PULL: Uses automatic single-field index on 'updatedAt'
          const lastPulledTime = Timestamp.fromMillis(lastPulledDocument.updatedAt);
          q = query(
            collection(firestore, collections["buklod-tao"].households),
            where('updatedAt', '>', lastPulledTime)
          );
        } else {
          // FIRST SYNC: Grabs everything (No index required, catches legacy data)
          q = query(collection(firestore, collections["buklod-tao"].households));
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
            _deleted: data._deleted ?? false,
            // Ensure every doc has an updatedAt for the checkpoint
            updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : 0
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

          const ref = doc(firestore, collections["buklod-tao"].households, id);
          
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

  console.log(`Syncing ${collections["buklod-tao"].evacCenters} with firestore...`)
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
            collection(firestore, collections["buklod-tao"].evacCenters),
            where('updatedAt', '>', lastPulledTime)
          );
        } else {
          q = query(collection(firestore, collections["buklod-tao"].evacCenters));
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

          const ref = doc(firestore, collections["buklod-tao"].evacCenters, id); 
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

/**
 * Generic function that deletes a document from an RxDB collection by its primary key.
 *
 * @param {RxCollection} collection - The RxDB collection to delete from.
 * @param {string} id - The primary key of the document to delete.
 * @returns {Promise<boolean>} `true` if deleted, `false` if not found.
 * @throws {Error} If `collection` is null or `id` is empty.
 *
 * @example
 * await deleteDoc(getEvacCentersCollection(), 'evac_123');
 */
export async function deleteDoc(collection, id) {
  const doc = await collection.findOne(id).exec();
  if (!doc) {
    console.warn(`Document not found: ${id}`);
    return false;
  }
  doc.remove();
  return true;
}