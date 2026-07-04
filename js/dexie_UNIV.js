import { createRxDatabase } from 'https://esm.sh/rxdb@15.18.0';
import { getRxStorageDexie } from 'https://esm.sh/rxdb@15.18.0/plugins/storage-dexie';

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
 * @returns {Promise<RxCollection>} The collection that was instantiated
 * @throws {Error} If any argument is missing or invalid
 *
 * @example
 * const buklod = await addCollection(db, 'buklod', buklodSchema);
 * await buklod.insert({ id: '1', household_name: 'Reyes' });
 */
export async function addCollection(database, collectionName, schema) {
  if (!database) throw new Error('Database is required');
  if (!collectionName) throw new Error('Collection name is required');
  if (!schema) throw new Error('Schema is required');

  await database.addCollections({ [collectionName]: { schema } });
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
  doc.remove();
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
  console.dir(allDocs);
  if (allDocs.empty) { return []; }
  return allDocs.map(doc => {
    return {
      id: doc.id,
      partner_coordinates: doc.partner_coordinates
    }
  })
}