import { 
  populateNavBar, 
  addEvacCenters,
  updateRiskIcons
} from './index.js';

import { buklodSchema } from '../../js/dexie.js'

// These variables should never be used outside the file. Use the accessors instead.
let db = null;
let activeHouseholdCollection = null;
let activeHouseholdSubscription = null;
let partnersArray = new Map();
let evacCenters = [];

export function hasDatabase() { return Boolean(db) }

export function setDatabase(database) { 
  db = database;
  activeHouseholdCollection = activeHouseholdCollection ?? db.buklod; 
}

export function getDatabase() { return db; }

export function getHouseholdCollection() { return activeHouseholdCollection; }

export function getEvacCentersCollection() { return db?.evacCenters ?? null; }


// For compatibility
export function dbExists() { return hasDatabase() }

// Specifically for partnersArray and compatibility with existing code
export function getHouseholds() { return partnersArray }

// Specifically for evacCenters and compatibility with existing code
export function getEvacCenters() { return evacCenters }

export function setAsOffline() {
  setHouseholdCollection(db.buklodImport);
  setHouseholdSubscription(db.buklodImport);
}

function setHouseholdCollection(collection) {
    activeHouseholdCollection = collection;
}

function setHouseholdSubscription(collection) {
  activeHouseholdSubscription?.unsubscribe();

  activeHouseholdSubscription = collection
    .find({ selector: { _deleted: { $eq: false } } })
    .$.subscribe(docs => {
      partnersArray = new Map(docs.map(d => [d.id, d.toJSON()]));

      // Re-render the UI automatically whenever local data changes
      populateNavBar(partnersArray);
      if (window.reapplySort) window.reapplySort();
      if (window.reapplySearch) window.reapplySearch();
      updateRiskIcons();
  });
}

export async function parseData(file) {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const masterSheet = workbook.Sheets["Master Sheet"];
    if (!masterSheet) {
      throw new Error("Spreadsheet is missing a 'Master Sheet' tab.");
    }
    const jsonData = XLSX.utils.sheet_to_json(masterSheet);

    return jsonData
      .filter((r) => String(r["Household Name"] ?? "").trim() !== "")
      .map(parseRow);
  } catch (err) {
    console.error("Import failed:", err);
    throw new Error(`Could not parse file: ${err.message}`);
  }
}

// Initializes subscriptions for the first time
export function createSubscriptions(window) {
  db.evacCenters
    .find({ selector: { _deleted: { $eq: false } } })
    .$.subscribe(centers => {
      evacCenters = centers.map(c => c.toJSON());
      addEvacCenters(); 
  });

  setHouseholdSubscription(db.buklod);
}

export async function importData(docs) {
  if (!db) throw new Error('Database not initialized. Call setDatabase() first.')
  await db.buklodImport.remove(); 
  await db.addCollections({
    buklodImport: { schema: buklodSchema }
  });
  await db.buklodImport.bulkUpsert(docs);
}

export async function removeDatabase() {
  if (!db) return;

  activeHouseholdCollection = null;
  activeHouseholdSubscription?.unsubscribe();
  partnersArray = new Map();
  evacCenters = [];
  
  try {
    await db.remove();
  } finally {
    db = null;
  }
}

// helper function for parseData
function parseRow(row) {
  const get = (header, default_val = "") => {
    return row[header] == null ? default_val : String(row[header]).trim();
  }
  const num = (header) => {
    const raw = get(header).replace(/,/g,'');
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }
  const coord = () => {
    const lat = num("Latitude");
    const lng = num("Longitude");
    if (lat === 0 && lng === 0) { return null }
    else { return {_lat: lat, _lng: lng}; }
  }

  return {
    id: String(generateHash(get("Household Name"))),
    household_name: get("Household Name"),
    household_phase: get("Phase"),
    street: get("Street"),
    household_address: get("Address"),
    contact_number: get("Contact Number"),
    residency_status: get("Residency Status"),
    is_hoa_noa: get("HOA/NOA/Others"),
    household_material: get("House Material"),
    nearest_evac: get("Nearest Evacuation Center"),
    location_link: get("Location Link"),
    location_coordinates: coord(),
    
    number_residents: num("Number of Residents"),
    number_minors: num("Minors"),
    number_seniors: num("Seniors"),
    number_pwd: num("PWD"),
    number_sick: num("Sick"),
    number_pregnant: num("Pregnant"),
    sickness_present: get("Sickness Present"),
    number_families: num("Number of Families"),
    number_healthy: num("Healthy"),
    
    earthquake_risk: get("Earthquake Risk"),
    earthquake_risk_description: get("Earthquake Description"),
    fire_risk: get("Fire Risk"),
    fire_risk_description: get("Fire Description"),
    flood_risk: get("Flood Risk"),
    flood_risk_description: get("Flood Description"),
    landslide_risk: get("Landslide Risk"),
    landslide_risk_description: get("Landslide Description"),
    storm_risk: get("Storm Risk"),
    storm_risk_description: get("Storm Description"),
    
    exit_points: num("Exit Points"),
    disaster_response_plan: get("Disaster Response Plan"),
    knowledge_readiness: num("Knowledge Readiness"),
    before_disaster_actions: get("Before Disaster Actions"),
    during_disaster_actions: get("During Disaster Actions"),
    after_disaster_actions: get("After Disaster Actions"),
    important_notes: get("Important Notes"),
    notes: get("Notes"),
    
    source_dataset: get("Source Dataset"),
    
    updatedAt: Date.now(),
    _deleted: false
  }
}

// Source - https://stackoverflow.com/a/7616484
// Posted by esmiralha, modified by community. See post 'Timeline' for change history
// Retrieved 2026-06-17, License - CC BY-SA 4.0
function generateHash(string) {
  let hash = 0;
  for (const char of string) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0; // Constrain to 32bit integer
  }
  return hash;
};