import { addRxPlugin } from 'https://esm.sh/rxdb@15.18.0';
import { RxDBLeaderElectionPlugin } from 'https://esm.sh/rxdb@15.18.0/plugins/leader-election';

import { addCollection, createDatabase } from '../../js/dexie_UNIV.js'
import { SEEDS_RULES_TEST, SEEDS_RULES } from '../../js/firestore_UNIV.js';
import { startFirestoreSync } from './firestore.js';

addRxPlugin(RxDBLeaderElectionPlugin);

let db = null;
let activeSeedsCollection = null;
let activeSeedsSubscription = null;
let schema = null; // Initialized in initDatabase() based on whether the app is in test mode

export function hasDatabase() { return Boolean(db) }

export function setDatabase(database) { db = database; }

export function getSeedsCollection() { return activeSeedsCollection; }

function setSeedsSubscription(collection) {
  activeSeedsSubscription?.unsubscribe();

  activeSeedsSubscription = collection
    .find({ selector: { _deleted: { $eq: false } } })
    .$.subscribe(docs => {
      // TODO: Implement logic to handle updates to the seeds collection, such as updating the UI or storing the data in a local variable.
  });
}

// Initializes subscriptions for the first time
export function createSubscriptions(window) { setSeedsSubscription(activeSeedsCollection); }

/**
 * Initializes the database and associated collections. Used on app initialization.
 * Also starts synchronization with the Firestore database. 
 * 
 * @param {string} uid - The ID of the user 
 * @param {boolean} inTestMode - Whether to initialize the database in test mode
 */
export async function initDatabase(uid, inTestMode = true) {
  schema = inTestMode ? SEEDS_RULES_TEST['schemas']['seeds'] : SEEDS_RULES['schemas']['seeds'];
  let newDb = await createDatabase('seeds_app', uid);
  let collectionName = inTestMode ? 'seedsTest' : 'seeds';
  activeSeedsCollection = await addCollection(newDb, collectionName, schema);
  setDatabase(newDb);
  startFirestoreSync(newDb, uid, inTestMode, activeSeedsCollection);
}

/**
 * Removes the database and sets relevant fields to null. Primarily used at the end of user interaction (e.g. user logs out)
 * 
 * @example
 * if (hasDatabase()) {
 *  removeDatabase()
 * }
 */
export async function removeDatabase() {
  if (!db) return;

  activeSeedsCollection = null;
  activeSeedsSubscription?.unsubscribe();
  
  try {
    await db.remove();
  } finally {
    db = null;
  }
}