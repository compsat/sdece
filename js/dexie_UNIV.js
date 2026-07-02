import { createRxDatabase } from 'https://esm.sh/rxdb@15.18.0';
import { getRxStorageDexie } from 'https://esm.sh/rxdb@15.18.0/plugins/storage-dexie';

let databases = new Map();

/**
 * Initializes a database given a prefix and uid. 
 * 
 * @param {string} prefix - The prefix of the database. (e.g. buklod_app, seeds)
 * @param {string} uid - The ID of the user. 
 * @param {Object} [collections] - The collections that the database will be instantiated with. 
 * @returns {Promise<RxDatabase> | null} The instantiated database. Returns null if the database already exists.
 */
export async function createDatabase(prefix, uid, collections) {
  if (!prefix) throw new Error('A database prefix is required');
  if (!uid) throw new Error('A user ID is required');

  let dbName = `${prefix}_${uid}`
  console.log(`Initializing ${dbName}...`)
  let database;

  if (databases.has(dbName)) {
    console.log(`Database ${dbName} exists in cache. Returning its instance...`)
    return databases.get(dbName);
  } 

  try {
    database = await createRxDatabase({
      name: dbName,
      storage: getRxStorageDexie(),
      multiInstance: true,
      eventReduce: true
    })
    if (collections) await database.addCollections(collections);
    databases.set(dbName, database); 
    console.log(`${dbName} initialized successfully.`)
  } catch (e) {
    console.error(e);
  }
  return database
}

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