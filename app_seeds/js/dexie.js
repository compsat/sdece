import { addRxPlugin } from 'https://esm.sh/rxdb@17.3.0';
import { RxDBLeaderElectionPlugin } from 'https://esm.sh/rxdb@17.3.0/plugins/leader-election';

import { createMarkersAndSidebar } from '../js/index.js'
import { 
  addCollection, 
  createDatabase,
  getDatabase,
  hasDatabase,
  setDatabase
} from '../../js/dexie_UNIV.js'
import { clearMarkers } from '../../js/index_UNIV.js'
import { SEEDS_RULES_TEST, SEEDS_RULES } from '../../js/firestore_UNIV.js';
import { startFirestoreSync } from './firestore.js';

addRxPlugin(RxDBLeaderElectionPlugin);

let activeSeedsCollection = null;
let activeSeedsSubscription = null;
let schema = null; // Initialized in initDatabase() based on whether the app is in test mode
let filterSelector = null;

export function getSeedsCollection() { return activeSeedsCollection; }

/**
 * Gets all activities from the seeds collection.
 * @param {boolean} ignoreFilter - Decides whether or not to return documents using the currently set filters.
 * @throws {Error} Seeds collection must be initialized.
 * @returns An object with docId as keys and activity data as values.
 */
export async function getActivities(ignoreFilter = false) {
  if (!activeSeedsCollection) {
    throw new Error("Seeds collection is not initialized.");
  }
  let selector = (!ignoreFilter && filterSelector) ?? { _deleted: { $eq: false }};
  let activitiesSet = await activeSeedsCollection.find({ selector }).exec();
  let activities = {};
  for (const activity of activitiesSet) {
    activity['identifier'] = activity.id;
    activities[activity.id] = activity;
  }
  return activities;
}

/**
 * Groups activities by their partner name.
 * @param {Object} activities - Object with docId as keys and activity data as values
 * @returns An object where each key is a partner name and the value is an array of activities associated with that partner.
 */
function groupActivities(activities) {
    const grouping = SEEDS_RULES['identifier'];
    return Object.groupBy(Object.values(activities), activity => activity[grouping]);
}

/**
 * Gets all unique partners and their associated activities in a (partnerName, activity[]) object.
 * @param {boolean} ignoreFilter - Decides whether or not to return documents using the currently set filters.
 * @returns An object where each key is a partner name and the value is an array of activities associated with that partner.
 */
export async function getPartners(ignoreFilter = false) {
  return groupActivities(await getActivities(ignoreFilter));
}

/**
 * Sets a filter on the getActivities() function. Pass in null if you want to return all documents.
 * @param {*} filter 
 */
export async function setFilter(filter) { filterSelector = filter }

function setSeedsSubscription(collection) {
  activeSeedsSubscription?.unsubscribe();

  activeSeedsSubscription = collection
    .find({ selector: { _deleted: { $eq: false } } })
    .$.subscribe(docs => {
      document.getElementById('locationList').innerHTML = '';
      clearMarkers();
      createMarkersAndSidebar(groupActivities(docs));
  });
}

/**
 * Creates subscriptions for the seeds collection. Intended to be called on app initialization.
 */
export function createSubscriptions() { setSeedsSubscription(activeSeedsCollection); }

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
  startFirestoreSync(newDb, uid, inTestMode, activeSeedsCollection);
}

/**
 * Removes the database and sets relevant fields to null. Primarily used at the end of user interaction (e.g. user logs out)
 * 
 * @example
 * import { hasDatabase } from './dexie_UNIV.js';
 * createDatabase('seeds_app', uid);
 * if (hasDatabase()) {
 *  removeDatabase()
 * }
 */
export async function removeDatabase() {
  if (!hasDatabase()) return;

  activeSeedsCollection = null;
  activeSeedsSubscription?.unsubscribe();
  
  try {
    await getDatabase().remove();
  } finally {
    setDatabase(null);
  }
}