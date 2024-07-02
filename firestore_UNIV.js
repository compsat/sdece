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

console.log('UNIVERSAL JS LOADING ');

// export const firebaseConfig = {
//     apiKey: "AIzaSyAeo2wTJFotROMNPa4UHXo2MqPaW8k07us",
//     authDomain: "compsat-sdece.firebaseapp.com",
//     databaseURL:
//       "https://compsat-sdece-default-rtdb.asia-southeast1.firebasedatabase.app",
//     projectId: "compsat-sdece",
//     storageBucket: "compsat-sdece.appspot.com",
//     messagingSenderId: "46954820322",
//     appId: "1:46954820322:web:c19499507632da09a2a4bb",
//     measurementId: "G-RPZYTFB5KC",
//   };

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

//export let partnersArray = [];

// General format of the rule engine
export const DB_RULES_AND_DATA = [
	// ["collection_name", "identifier",
	//     ["field1", ... ,"fieldN"] ];
	[
		'buklod-official',
		'household_name',
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
	],
	[
		'buklod-official-TEST',
		'household_name',
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
	],
	[
		'sdece-official',
		'partner_name',
		[
			'activity_date',
			'activity_name',
			'activity_nature',
			'additional_partnership',
			'ADMU_contact_name',
			'ADMU_email',
			'ADMU_office',
			'organization_unit',
			'partner_address',
			'partner_contact_name',
			'partner_coordinates',
			'partner_email',
			'partner_name',
			'partner_contact_number',
		],
	],
	[
		'sdece-official-TEST',
		'partner_name',
		[
			'activity_date',
			'activity_name',
			'activity_nature',
			'additional_partnership',
			'ADMU_contact_name',
			'ADMU_email',
			'ADMU_office',
			'organization_unit',
			'partner_address',
			'partner_contact_name',
			'partner_coordinates',
			'partner_email',
			'partner_name',
			'partner_contact_number',
		],
	],
];

const VALIDATION_RULES = { //Rules for Validating Data
	'buklod-official-TEST': {
		'contact_number': {type: 'string', required: true, minLength: 11, maxLength: 11, regex: /^[0-9]+$/},
		'earthquake_risk': {type: 'string', required: true},
		'fire_risk': {type: 'string', required: true},
		'flood_risk': {type: 'string', required: true},
		'household_address': {type: 'string', required: true, maxLength: 255},
		'household_material': {type: 'string', required: true, enum: ['Concrete', 'Semi-Concrete', 'Light materials', 'Makeshift', 'Natural'] },
		'household_name': {type: 'string', required: true, maxLength: 127},
		'household_phase': {type: 'string', required: true},
		'is_hoa_noa': {type: 'string', required: true, minLength: 3, maxLength: 3, enum: ['HOA', 'N/A'] },
		'landslide_risk': {type: 'string', required: true},
		'location_coordinates': {type: 'number', required: true},
		'location_link': {type: 'string', required: true},
		'nearest_evac': {type: 'string', required: true, maxLength: 255},
		'number_minors': {type: 'number'},
		'number_pregnant': {type: 'number'},
		'number_pwd': {type: 'number'},
		'number_residents': {type: 'number', required: true},
		'number_sick': {type: 'number'},
		'residency_status': {type: 'string', required: true, enum: ['May-Ari', 'Umuupa']},
		'status': {type: 'string'},
		'storm_risk': {type: 'string', required:true}
	},
	'sdece-official-TEST': {
		'partner_name': {type: 'string', required: true, maxLength: 255},
		'partner_address': {type: 'string', required: true, maxLength: 255},
		'partner_coordinates': {type: 'number', required: true},
		'partner_contact_name': {type: 'string', required: true, maxLength: 255},
		'partner_contact_number': {type: 'string', required: true, minLength: 11, maxLength: 11, regex: /^[0-9]+$/},
		'partner_email': {type: 'string', required: true, maxLength: 127},
		'activity_name': {type: 'string', required: true},
		'activity_nature': {type: 'string', required: true, maxLength:255},
		'activity_date': {type: 'Date', required: true},
		'additional_partnership': {type: 'string', required: true, maxLength: 255},
		'organization_unit': {type: 'string', required: true,  maxLength: 127},
		'ADMU_office': {type: 'string', required: true, maxLength: 127},
		'ADMU_contact_name': {type: 'string', required: true, maxLength: 255},
		'ADMU_email': {type: 'string', required: true, required: true, maxLength: 127},

	}
};

export const BUKLOD_RULES = DB_RULES_AND_DATA[0];
export const BUKLOD_RULES_TEST = DB_RULES_AND_DATA[1];
export const SDECE_RULES = DB_RULES_AND_DATA[2];
export const SDECE_RULES_TEST = DB_RULES_AND_DATA[3];

export function setCollection(collection_name){
    for(let rule of DB_RULES_AND_DATA ){
        console.log("rule[0]: " + rule[0]);
        if (rule[0] === collection_name){
            console.log("IS EQUAL");
            collection_reference = collection( DB, collection_name );
        }
    }
	console.log(collection_reference);
}

export function getCollection() {
	return collection_reference;
}

export function getDocIdByPartnerName(partner_name) {
	console.log(partner_name);
	const endName = partner_name.replace(/\s/g, '\uf8ff');

	//rule loop
	for (let rule of DB_RULES_AND_DATA) {
		if (collection_reference.id === rule[0]) {
			return getDocs(
				query(
					collection_reference,
					where(rule[1], '>=', partner_name), // let's wait for Luigi's standardization. IF_ELSE nalang muna
					where(rule[1], '<=', partner_name + endName)
				)
			)
				.then((querySnapshot) => {
					if (!querySnapshot.empty) {
						console.log("not empty, here the only document");
						// Assuming there is only one document with the given partner name
						const doc = querySnapshot.docs[0];
						console.log(doc.id);
						return doc.id;
					} else {
						console.log('EMPTY: No matching document found.');
						return null;
					}
				})
				.catch((error) => {
					console.error('Error getting documents: ', error);
					return null;
				});
		}
	}
}

export function getDocsByPartnerName(partner_name) {
	const endName = partner_name.replace(/\s/g, '\uf8ff');

	//rule loop
	for (let rule of DB_RULES_AND_DATA) {
		if (collection_reference.id === rule[0]) {
			return getDocs(
				query(
					collection_reference,
					where(rule[1], '>=', partner_name), // let's wait for Luigi's standardization. IF_ELSE nalang muna
					where(rule[1], '<=', partner_name + endName)
				)
			)
				.then((querySnapshot) => {
					console.log(querySnapshot);
					if (!querySnapshot.empty) {
						console.log("not empty, here are the docs");
						const docs = querySnapshot.docs;
						console.log(docs);
						return docs;
					} else {
						console.log('EMPTY: No matching document found.');
						return null;
					}
				})
				.catch((error) => {
					console.error('Error getting documents: ', error);
					return null;
				});
		}
	}
}

export function getDocByID(docId) {
    for (let rule of DB_RULES_AND_DATA){
        if (collection_reference.id === rule[0]){
            const DOC_REFERENCE = doc(DB, rule[0], docId);
            let docObj = {};
            return getDoc(DOC_REFERENCE).then(
                (doc) => {
                    docObj = doc;
                    return docObj;
                }
            );
        }
    }    
}

export function addEntry(inp_obj){
    console.log("add Entry");

    for (let rule of DB_RULES_AND_DATA){
        if(rule[0] === collection_reference.id){
            let input = {}; // contents depend on the rule engine
            for(let i = 0; i < Object.keys(inp_obj).length; i++){
                input[rule[2][i]] = inp_obj[rule[2][i]];
            }
            addDoc(collection_reference, input).then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
              })
              .catch((error) => {
                console.error("Error adding document: ", error);
              });
            break;
        }
    }
}

export function editEntry(inp_array, docId) {
	console.log('edit entry with id ' + docId);

	for (let rule of DB_RULES_AND_DATA) {
		if (rule[0] === collection_reference.id) {
			const DOC_REFERENCE = doc(DB, rule[0], docId);

			let input = {}; // contents depend on the rule engine
			for (let i = 0; i < inp_array.length; i++) {
				input[rule[2][i]] = inp_array[i];
			}
			updateDoc(DOC_REFERENCE, input)
				.then((docRef) => {
					console.log('Document written with ID: ', docRef.id);
				})
				.catch((error) => {
					console.error('Error adding document: ', error);
				});
			break;
		}
	}
}

export function validateData(collectionName, data) {
	const rules = VALIDATION_RULES[collectionName];
	const errors = [];

	for(const field in rules) {
		const rule = rules[field];
		const value = data[field];


		// Check for required field
		if (rule.required && (value == undefined || value == null || value == '')) {
			errors.push(`Field '${field}' is required.`);
			continue;
		}

		// Skip type validation if not required
		if (!rule.required && (value == undefined || value == null || value == '')) {
			continue;
		}

		// Check for type field
		if (rule.type && typeof value !== rule.type) {
			errors.push(`Field '${field}' must be of type ${rule.type}.`);
			continue;
		}


		// Check for minimum length
		if (rule.minLength && typeof value == 'string' && value.length < rule.minLength) {
			errors.push(`Field '${field}' must be at least ${rule.minLength} characters long.`);
			continue;
		}

		// Check for maximum length
		if (rule.maxLength && typeof value == 'string' && value.length >  rule.maxLength) {
			errors.push(`Field '${field}' cannot exceed ${rule.maxLength} characters.`);
			continue;
		}


		// Check for regular expression pattern
		if (rule.regex && !rule.regex.test(value)) {
			errors.push(`Field '${field}' is invalid.`);
			continue;
		}

		// Check for enumerated values
		if (rule.enum && !rule.enum.includes(value)) {
			errors.push(`Field '${field}' must be one of ${rule.enum.join(',')}.`);
			continue;
		}

		//no validation for geolocation, url yet
	}
	
	return errors;

	
}

