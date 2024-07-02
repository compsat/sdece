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
const DB = getFirestore();

var collection_reference = null; 

var document_map = {};

const DB_RULES_AND_DATA = { // can only be changed in hardcode
	"sdece-official": {
		identifier: "identifier",
		fields: 
			[
				"activity_date",
				"activity_name",
				"activity_nature",
				"additional_partnership",
				"ADMU_contact_name",
				"ADMU_email",
				"ADMU_office",
				"identifier",
				"organization_unit",
				"partner_address",
				"partner_contact_name",
				"partner_contact_number",
				"partner_coordinates",
				"partner_email",
				"partner_name",
			],
		// for frontEnd integration. Feel free to change depending on the frontEnd requirements
		sideNav_main: "partner_name",
		sideNav_sub: "activity_nature",
		
		modal_content: { // contains the ids of the elements in the frontEnd
		
		},
	},
	"buklod-official": {
		identifier: "household_name",
		fields: 
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
		// for frontEnd integration. Feel free to change depending on the frontEnd requirements
		sideNav_main: "household_name",
		sideNav_sub: "household_address",
		
		modal_content: { // contains the ids of the elements in the frontEnd
		
		},
	},
};

const DB_RULES_AND_DATA_TEST = {
    "sdece-official-TEST" : DB_RULES_AND_DATA["sdece-official"],
    "buklod-official-TEST" : DB_RULES_AND_DATA["buklod-official"],
}

export const SDECE_RULES = DB_RULES_AND_DATA["sdece-official"];
export const BUKLOD_RULES = DB_RULES_AND_DATA["buklod-official"];
export const SDECE_RULES_TEST = DB_RULES_AND_DATA_TEST["sdece-official-TEST"];
export const BUKLOD_RULES_TEST = DB_RULES_AND_DATA_TEST["buklod-official-TEST"];

export async function setCollection(collection_name, include_doc_id, is_debug_mode = false){
    let currentCollection = null;
    if (is_debug_mode){
        currentCollection = DB_RULES_AND_DATA_TEST[collection_name];
    } else {
        currentCollection = DB_RULES_AND_DATA[collection_name];
    } 
    
    if(currentCollection != null){
        collection_reference = collection(DB, collection_name);
        console.log("collection set to: " + collection_name + " now loading to docs");

        // loadDocs(collection_name); // had to separate because this is async
        let collection_docs = await getDocs(collection_reference);
        collection_docs.forEach((entry) => {
            var doc = entry.data();
            var doc_id = entry.id;
            document_map[doc_id] = doc;
            if (include_doc_id){    document_map[doc_id]["identifier"] = doc_id;    }
        });
        console.log(document_map);
    } else {
        console.log("Collection does not exist");
    }
}

export function getCollection(){
    if(collection_reference != null){
        return collection_reference;
    }
    else {
        console.log("collection not set yet");
    }
}

export function getDocMap(){
    if(document_map != null){
        return document_map;
    }
    else {
        console.log("document_map not set yet");
    }
}

export function groupBy(custom_key_identifier){
    let grouped = {};
    Object.keys(document_map).forEach((key_identifier) => {
        let key_to_group_by = document_map[key_identifier][custom_key_identifier];
        if(grouped[key_to_group_by] == null){
            grouped[key_to_group_by] = [];
        }
        grouped[key_to_group_by].push(document_map[key_identifier]);

    });
    return grouped;
}

export function addEntry(obj_input){
    let needed_fields = DB_RULES_AND_DATA[collection_reference.id][fields];
    let inp_send = {};
    for(let field of needed_fields){ // sets value to null when field not found
        inp_send[field] = obj_input[field];
    }

    addDoc(collection_reference, inp_send).then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        console.log(docRef.data());
    }).catch((error) => {
        console.error("Error adding document: ", error);
    });
}

export function editEntry(obj_input, doc_id){
    let needed_fields = DB_RULES_AND_DATA[collection_reference.id][fields];
    let inp_send = {};
    for(let field of needed_fields){ // sets value to null when field not found
        inp_send[field] = obj_input[field];
    }

    const DOC_REFERENCE = doc(DB, collection_reference.id, doc_id);

    updateDoc(DOC_REFERENCE, inp_send)
        .then((docRef) => {
            console.log("it worked");
            //console.log('Document written with ID: ', docRef.id);
        })
        .catch((error) => {
            console.error('Error adding document: ', error);
        });
}