import { createRxDatabase } from 'https://esm.sh/rxdb@17.3.0';
import { getRxStorageDexie } from 'https://esm.sh/rxdb@17.3.0/plugins/storage-dexie';
import { requireParameters } from '../../js/index_UNIV.js';
import { FILTER_RULES } from './ruleEngines.js';
import { buildQueryArray } from '../app_seeds/js/index.js';
import { setFilter } from '../app_seeds/js/dexie.js';

let database = null;

/**
 * Initializes a database given a prefix and uid. This also stores the database instance in an internal database variable.
 * Assumes only one database can exist in a page.
 * 
 * @param {string} prefix - The prefix of the database. (e.g. buklod_app, seeds)
 * @param {string} uid - The ID of the user. 
 * @param {Object} [collections] - The collections that the database will be instantiated with. 
 * @returns {Promise<RxDatabase>} The instantiated database. Returns the database if the database already exists.
 */
export async function createDatabase(prefix, uid, collections) {
  if (!prefix) throw new Error('A database prefix is required');
  if (!uid) throw new Error('A user ID is required');

  let dbName = `${prefix}_${uid}`
  console.log(`Initializing ${dbName}...`)

  if (database) {
    console.log(`Database ${dbName} is already initialized. Returning its instance...`)
    return database;
  }

  try {
    database = await createRxDatabase({
      name: dbName,
      storage: getRxStorageDexie(),
      multiInstance: true,
      eventReduce: true
    })
    if (collections) await database.addCollections(collections);
    console.log(`${dbName} initialized successfully.`)
  } catch (e) {
    console.error(e);
  }
  return database
}

/**
 * Checks if a database instance exists. Returns true if it does, false otherwise.
 * 
 * @returns a boolean representation of the internal database instance
 */
export function hasDatabase() { return Boolean(database) }

/**
 * Used if you want to set the internal database instance to a specific RxDatabase outside of the one you created with createDatabase().
 * 
 * @param {RxDatabase} db - The RxDatabase instance to set as the internal database. 
 */
export function setDatabase(db) { database = db; }

/**
 * Returns the internal database instance. If no database has been initialized, returns null.
 * 
 * @returns the RxDatabase instance
 */
export function getDatabase() { return database; }

/**
 * Adds a collection to a given RxDatabase given a RxSchema.
 * For creating multiple collections, use addCollections() in the RxDB API.
 * For more information about RxSchema, review the {@link https://rxdb.info/rx-schema.html|documentation}
 *
 * @param {RxDatabase} database - The RxDB database to add a collection to
 * @param {string} collectionName - The name of the collection
 * @param {RxSchema} schema - The schema of the collection
 * @param {*} [conflictHandler] - The conflict handler that the replication will use
 * @returns {Promise<RxCollection>} The collection that was instantiated
 * @throws {Error} If any argument is missing or invalid
 *
 * @example
 * const buklod = await addCollection(db, 'buklod', buklodSchema);
 * await buklod.insert({ id: '1', household_name: 'Reyes' });
 */
export async function addCollection(database, collectionName, schema, conflictHandler = coordinateConflictHandler) {
  const checks = [
    [!database, 'Database is null or undefined'],
    [!collectionName, 'Collection Name is null or undefined'],
    [!schema, 'Schema is null or undefined']
  ]
  if (!requireParameters(checks)) {
    return null;
  }
  if (database[collectionName]) {
    console.warn(`Collection ${collectionName} already exists in database.`);
    return database[collectionName]
  }
  await database.addCollections({ [collectionName]: { schema, conflictHandler } });
  return database[collectionName];
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
  await doc.remove();
  return true;
}

/**
 * Debug function to retrieve all partner coordinates from a specified RxCollection.
 * Primarily used to verify that the coordinates are being stored correctly in RxDB.
 * If you're looking for the Firestore version of this function, check {@link getAllPartnerCoordinates| in firestore_UNIV.js}.
 * 
 * @param {RxCollection} rxCollection - The RxCollection to retrieve all partner coordinates from.
 * @returns an array of objects containing id and their corresponding coordinates.
 */
export async function getAllPartnerCoordinatesInRxDB(rxCollection) {
  if (!rxCollection) {
    console.error("Missing parameters for getting partner coordinates.");
    return [];
  }
  const allDocs = await rxCollection.find({
    selector: { _deleted: { $eq: false } },
  }).exec();

  return allDocs.map(doc => {
    return {
      id: doc.id,
      partner_coordinates: doc.partner_coordinates
    }
  })
}

/**
 * Debug function to retrieve all values of a field from a specified RxCollection.
 * Primarily used to verify that a specific field is being stored correctly in RxDB.
 * 
 * @param {RxCollection} rxCollection - The RxCollection to retrieve all partner coordinates from.
 * @param {string} keyName - The key of the field that is collected.
 * @returns {Array} an array of objects containing id and the field requested.
 */
export async function getFieldInRxDB(rxCollection, keyName) {
  const checks = [
    [!rxCollection, "rxCollection is null or undefined."],
    [!keyName, "keyName is undefined."]
  ]
  if (!requireParameters(checks)) {
    return [];
  }

  const allDocs = await rxCollection.find({
    selector: { _deleted: { $eq: false } },
  }).exec();

  return allDocs.map(doc => {
    return {
      id: doc.id,
      [keyName]: doc[keyName]
    }
  })
}

/**
 * Extracts the raw seconds value from any date format, including nested Timestamps, because for some horrendous reason there are nested Timestamps.
 * @param {any} date
 * @returns {number}
 */
function extractSeconds(date) {
  if (date?.seconds !== undefined) {
    return extractSeconds(date.seconds); // handles nested Timestamps
  }
  return date;
}

/**
 * Normalizes an activity date from various formats into a Unix timestamp in seconds.
 *
 * @param {number|string|Object|null|undefined} date
 * @returns {number}
 */
export function normalizeActivityDate(date, log = true) {
  const original = date;
  let result = 0;

  if (date && date !== '') {
    if (typeof date === 'number') {
      result = date;
    } else if (date?.seconds !== undefined) {
      result = extractSeconds(date);
    } else if (typeof date === 'string') {
      const parsed = Date.parse(date);
      if (!isNaN(parsed)) result = Math.floor(parsed / 1000);
    }
  }

  if (result !== original && log) {
    console.log(`[normalizeActivityDate] "${original}" → ${result}`);
  }

  return result > 0 ? result : 0;
}

/**
 * One-time migration that normalizes all existing `activity_date` values in the
 * local RxDB collection to Unix timestamps in seconds.
 *
 * Iterates over all documents (including soft-deleted), compares each
 * `activity_date` against its normalized value, and bulk-upserts any that differ.
 *
 * @param {RxCollection} rxCollection - The RxCollection to migrate.
 * @returns {Promise<void>}
 *
 * @example
 * await migrateActivityDates(db.seeds);
 * // "Migrated 42 activity_date values"
 */
export async function migrateActivityDates(rxCollection) {
  const allDocs = await rxCollection.find().exec();
  let modifiedDocs = 0;
  for (const doc of allDocs) {
    await doc.modify((oldData) => {
      const normalized = normalizeActivityDate(oldData.activity_date)
      if (normalized !== oldData.activity_date) {
        oldData.activity_date = normalized;
        modifiedDocs += 1;
      }
      return oldData;
    })
    console.dir(doc);
  }
  if (modifiedDocs) {
    console.log(`Migrated ${modifiedDocs} activity_date values`);
  }
}

/**
 * A custom conflict handler to make sure that the local coordinates are compatible against GeoPoints
 * @constant
 */
export const coordinateConflictHandler = {
    isEqual(a, b) {
        // This is needed because the local coordinate object against GeoPoint will always output false.
        const norm = (doc) => {
            const copy = { ...doc };
            if (copy.partner_coordinates) {
                const c = copy.partner_coordinates;
                copy.partner_coordinates = {
                    _lat: c._lat ?? c.latitude,
                    _long: c._long ?? c.longitude
                };
            }
            return copy;
        };
        return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
    },
    resolve(i) {
        return i.newDocumentState;
    }
};

/**
 * 
 * @param {*} collectionRef - The RxCollection that will be filtered. 
 * @param {*} filterRules - The set of rules that will dictate filtering. See {@link FILTER_RULES}.
 * @param {*} queryArray - The object that maps field names to an array of active filters. An output of {@link buildQueryArray}.
 * @returns {RxDocument[]} the filtered data on the given collection.
 */
export async function filterData(collectionRef, filterRules, queryArray) {
  const selector = buildSelector(filterRules, queryArray);
  const finalQuery = await collectionRef.find({ selector }).exec();
  return finalQuery;
}

/**
 * Builds an RxDB selector object from filter rules and active query values.
 *
 * @param {Object<string, {type: string, label?: string}>} filterRules - Rule engine's field properties of a given collection.
 * @param {Object<string, string[]>} queryArray - Maps field names to arrays of active filter values. Output of {@link buildQueryArray}.
 * @returns {Object} An RxDB-compatible selector object for use with {@link setFilter}.
 *
 * @example
 * const selector = buildSelector(FILTER_RULES["seeds-official"], queryArray);
 * // => { partner_name: { $in: ["Partner A", "Partner B"] }, activity_date: { $gte: 1710000000 } }
 */
export function buildSelector(filterRules, queryArray, log=true) {
  const selector = {};
  for (const [fieldName, filterProps] of Object.entries(filterRules)) {
    const filters = queryArray[fieldName]; 

    const IS_EMPTY = (
      filters == null
      || filters == '' 
      || (Array.isArray(filters) && filters.length === 0));

    if (IS_EMPTY) {
      console.log("[buildSelector] Filter is empty, skipping...", filters);
      continue;
    } 

    switch (filterProps.type) {
      case "string":
        selector[fieldName] = Array.isArray(filters) ? {$in: filters} : {$eq: filters}
        break;
      case "number":
        selector[fieldName] = {$gte: Number(filters)};
        break;
      default:
        break;
    }
    if (log) {
      console.log(`[buildSelector] Building filter for ${fieldName} with props:`, filterProps);
      console.log(`[buildSelector] Current status of selector: `, selector);
    }
  }
  if (log) console.log("[buildSelector] Query selector:", selector);
  return selector;
}