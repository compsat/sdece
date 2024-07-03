import {
	getDocs,
	addDoc,
	updateDoc,
	doc,
	query,
	where,
	getDoc,
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js';

import {
	getFirestore,
	collection,
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';



console.log('UNIVERSAL JS v2 LOADING ');

export const firebaseConfig = {
	apiKey: 'AIzaSyA8QWgic_hjbDL-EYIkvSRRII_yfTRdtOQ',
	authDomain: 'discs-osci-prj.firebaseapp.com',
	projectId: 'discs-osci-prj',
	storageBucket: 'discs-osci-prj.appspot.com',
	messagingSenderId: '601571823960',
	appId: '1:601571823960:web:1f1278ecb86aa654e6152d',
	measurementId: 'G-9N9ELDEMX9',
};

initializeApp(firebaseConfig);
export const DB = getFirestore();

var collection_reference = null; 

var document_map = new Map();
var document_values = [];

export const DB_RULES_ENGINE = new Map();
export var rules = [];

DB_RULES_ENGINE
  .set
('buklod-official', 
  [
    'contact_number',
    'earthquake_risk',
    'fire_risk',
    'flood_risk',
    'household_address',
    'household_material',
    'household_name',
    'household_phase',
    'is_hoa_noa',
    'landslide_risk',
    'location_coordinates',
    'location_link',
    'nearest_evac',
    'number_minors',
    'number_pregnant',
    'number_pwd',
    'number_residents',
    'number_seniors',
    'number_sick',
    'residency_status',
    'sickness_present',
    'status',
    'storm_risk',
  ],
)


DB_RULES_ENGINE
  .set
('sdece-official',
  [
    'activity_date',
    'activity_name',
    'activity_nature',
    'additional_partnership',
    'admu_contact',
    'admu_email',
    'admu_office',
    'organization_unit',
    'partner_city',
    'partner_contact',
    'partner_coordinates',
    'partner_email',
    'partner_name',
    'partner_number',
  ]
)

export function setCollection(collection_name){
  console.log(DB_RULES_ENGINE)
  if(DB_RULES_ENGINE.has(collection_name)){
    // Gets the rules from the branch
    rules = DB_RULES_ENGINE.get(collection_name);
    collection_reference = collection( DB, collection_name );
  }
  else{
    console.error("pass a valid collection_name");
  }
}

export function getCollection() {
	return collection_reference;
}

export function loadDocs() {
  getDocs(getCollection())
    .then((query_snapshot) => {
      query_snapshot.forEach((doc) => {
        document_map.set(doc.id, doc.data());
    })
    testing();
  })
}

function testing(){
  console.log(document_map);
  document_values = getValuesFromMap('fire_risk');
  console.log(document_values);
}

function getValuesFromMap(desired_keys){
  let array = [];
  document_map.forEach((values, keys) => {
    Object.entries(values).forEach((val) =>{
      if(val[0] == desired_keys){
        array.push([val[0], val[1]]);
      }
    })
  });
  return array;
}

export function addEntry() {
  if(collection_reference == null){
    return "collection_reference must not be null";
  }
}

export function editEntry() {
  if(collection_reference == null){
    return "collection_reference must not be null";
  }
}

Array.prototype.query_filter = function(queryfn) {
  var result_array = [];
  
  for(var i = 0; i < this.length; i++) {
    if(queryfn(this[i], i)) {
      result_array.push(this[i]);
    }
  }

  return result_array;
}