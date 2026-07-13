import { addRxPlugin } from 'https://esm.sh/rxdb@17.3.0';
import { RxDBLeaderElectionPlugin } from 'https://esm.sh/rxdb@17.3.0/plugins/leader-election';
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs";

import { createMarkersAndSidebar } from '../js/index.js'
import { 
  addCollection, 
  createDatabase,
  getDatabase,
  hasDatabase,
  normalizeActivityDate,
  setDatabase
} from '../../js/dexie_UNIV.js'
import { clearMarkers } from '../../js/index_UNIV.js'
import { SEEDS_RULES_TEST, SEEDS_RULES, validateData } from '../../js/firestore_UNIV.js';
import { startFirestoreSync } from './firestore.js';

addRxPlugin(RxDBLeaderElectionPlugin);

let activeSeedsCollection = null;
let activeSeedsSubscription = null;
let schema = null; // Initialized in initDatabase() based on whether the app is in test mode

export function getSeedsCollection() { return activeSeedsCollection; }
function setSeedsCollection(collection) { activeSeedsCollection = collection; }

/**
 * Gets all activities from the seeds collection.
 * @throws {Error} Seeds collection must be initialized.
 * @returns An object with docId as keys and activity data as values.
 */
export async function getActivities() {
  if (!activeSeedsCollection) {
    throw new Error("Seeds collection is not initialized.");
  }

  let activitiesSet = await activeSeedsCollection.find({ selector: { _deleted: { $eq: false } } }).exec();
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
 * @returns An object where each key is a partner name and the value is an array of activities associated with that partner.
 */
export async function getPartners() {
  return groupActivities(await getActivities());
}

/**
 * Unsubscribes from the previous collection and subscribes to the new collection.
 * This allows the app to update immediately as soon as something changes in the subscribed collection.
 * @param {RxCollection} collection - The collection to subscribe to.
 */
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

/**
 * Switches the current collection and subscription to use the import collection instead.
 * 
 * @example
 * await importData(docs);
 * setAsOffline();
 */
export function setAsOffline() {
  setSeedsCollection(getDatabase().seedsImport);
  setSeedsSubscription(getDatabase().seedsImport);
}

/**
 * Clears the import collection's leftover documents and inserts new data into it. 
 * 
 * @param {Array} - An array of documents that adhere to the schema.
 * @example
 * await importData(docs);
 * setAsOffline();
 */
export async function importData(docs) {
  if (!getDatabase()) throw new Error('Database not initialized. Call setDatabase() first.')
  
    // Since collection data is persistent in RxDB, we need to create a reference and call remove() to completely delete docs
  const oldCollection = await addCollection(getDatabase(), 'seedsImport', schema); 
  await oldCollection.remove();

  const newCollection = await addCollection(getDatabase(), 'seedsImport', schema);
  await newCollection.bulkUpsert(docs);
}

/**
 * Parses an Excel file and converts each row into a document object.
 * Reads the "Master Sheet" tab and maps each row through {@link parseRow}.
 *
 * @param {File} file - The Excel file to parse (.xlsx, .xls).
 * @returns {{validRows: Object[], invalidRows: Object[]}} An object of parsed document objects.
 * @throws {Error} If the file cannot be parsed or the "Master Sheet" tab is missing.
 */
export async function parseData(file) {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const masterSheet = workbook.Sheets["Master Sheet"];
    if (!masterSheet) {
      throw new Error("Spreadsheet is missing a 'Master Sheet' tab.");
    }
    const jsonData = XLSX.utils.sheet_to_json(masterSheet);
    const result = {
      validRows: [],
      invalidRows: []
    }
    console.dir(jsonData)
    for (const raw of jsonData) {
      if (String(raw["Partner"] ?? "").trim() === "")  continue;

      const row = parseRow(raw);
      const errors = validateData('seeds-official-TEST', row);
      console.log(errors);
      if (errors.length === 0) {
        result.validRows.push(row);
      } else {
        result.invalidRows.push(row);
      }
    }
    return result;
  } catch (err) {
    console.error("Import failed:", err);
    throw new Error(`Could not parse file: ${err.message}`, {cause: err});
  }
}

/**
 * Parses a row of Excel JSON data into a document that matches a typical activity document
 *
 * @param {object} row - A JSON object that represents a row of exported activity data. Must have keys that map to their designated fields
 * @returns {object} An object that matches the fields present in an activity schema
 *
 * @example
 * const jsonData = XLSX.utils.sheet_to_json(masterSheet);
 * const docs = jsonData.map(parseRow);
 */
function parseRow(row) {
  const get = (header, default_val = "") => {
    return row[header] == null ? default_val : String(row[header]).trim();
  }
  const date = (header) => {
    return normalizeActivityDate(get(header), false)
  }
  const coord = (header) => {
    const [lat, long] = get(header).split(",").map(Number); 
    if (lat === 0 && long === 0) { return null; }
    else { return {_lat: lat, _long: long}; }
  }
	const ruleset = SEEDS_RULES['validations']
  let ret = {id: `local_${generateHash(20)}`}
  for (const [field, { label }] of Object.entries(ruleset)) {
    let fieldVal;
    switch(field) {
      case "partner_coordinates": 
        fieldVal = coord(label); 
        break;
      case "activity_date":
        fieldVal = date(label);
        break;
      default:
        fieldVal = get(label);
    }
    ret[field] = fieldVal;
  }
  return ret;
}

/**
 * Generates a hash based on the number of characters. Used for making doc ids without Firestore such as data imports.
 *
 * @param {int} [length] - The number of characters for the hash. 
 * @returns {string} The resulting hash.
 *
 * @example
 * let id = generateHash(20);
 */
function generateHash(length = 8) {
    const requiredBytes = Math.ceil(length / 2);
    const arr = new Uint8Array(requiredBytes);
    crypto.getRandomValues(arr);
    
    const hex = Array.from(arr, byte => byte.toString(16).padStart(2, '0')).join('');
    
    return hex.substring(0, length);
}
