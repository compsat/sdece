import {
	getDocs,
	addDoc,
	updateDoc,
	doc,
	query,
	where,
	getDoc,
	GeoPoint,
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js';

import {
	getFirestore,
	collection,
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';

function getUrlParameter(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	var results = regex.exec(location.search);
	return results === null
		? ''
		: decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Get lat and lng from URL parameters
const lat = getUrlParameter('lat');
const lng = getUrlParameter('lng');

// Display the values on the page or use them as needed
// document.addEventListener('DOMContentLoaded', function () {
// 	document.getElementById(
// 		'location-info'
// 	).innerText = `Latitude: ${lat}, Longitude: ${lng}`;
// });


export function getCoordinates(coordinates) {
	var arr = coordinates.split('+');
	var lat = arr[0], lng = arr[1];
	// Ensure lat and lng are numbers
	const latNum = parseFloat(lat);
	const lngNum = parseFloat(lng);
	

	// Round the numbers to 5 decimal places
	var roundLat = parseFloat(latNum.toFixed(5));
	var roundLon = parseFloat(lngNum.toFixed(5));

	const GEOPOINT = new GeoPoint(roundLat, roundLon);

	// Create the coordinates string
	var PARTNER_COORDINATES = GEOPOINT;
	console.log(typeof GEOPOINT)
	console.log( GEOPOINT)

	return PARTNER_COORDINATES;
}

const SECRETS_PATH = "/secrets.json";
const SECRETS_REQ = new Request(SECRETS_PATH);
const SECRETS_RES = await fetch(SECRETS_REQ);
const SECRETS = await SECRETS_RES.json();

export const firebaseConfig = SECRETS.firebaseConfig;

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
			'household_name',
			'contact_number',
			'number_residents',
			'number_minors',
			'number_seniors',
			'number_pregnant',
			'number_pwd',
			'number_sick',
			'sickness_present',
			'residency_status',
			'is_hoa_noa',
			'location_coordinates',
			'location_link',
			'household_address',
			'household_material',
			'household_phase',
			'landslide_risk',
			'earthquake_risk',
			'fire_risk',
			'flood_risk',
			'storm_risk',
			'nearest_evac',
		],
	],
	[
		'buklod-official-TEST',
		'household_name',
		[
			'household_name',
			'contact_number',
			'number_residents',
			'number_minors',
			'number_seniors',
			'number_pregnant',
			'number_pwd',
			'number_sick',
			'sickness_present',
			'residency_status',
			'is_hoa_noa',
			'location_coordinates',
			'location_link',
			'household_address',
			'household_material',
			'household_phase',
			'landslide_risk',
			'earthquake_risk',
			'fire_risk',
			'flood_risk',
			'storm_risk',
			'nearest_evac',
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

//validation here
const VALIDATION_RULES = {
	//Rules for Validating Data
	'buklod-official-TEST': {
		household_name: { type: 'string', required: true, maxLength: 127 },
		contact_number: {
			type: 'string',
			required: true,
			minLength: 11,
			maxLength: 11,
			regex: /^09\d*/,
		},
		number_residents: { type: 'number', required: true , 'minimum': 1},
		number_minors: { type: 'number', 'minimum': 0 },
		number_seniors: { type: 'number' , 'minimum': 0 },
		number_pregnant: { type: 'number' , 'minimum': 0 },
		number_pwd: { type: 'number' , 'minimum': 0 },
		number_sick: { type: 'number' , 'minimum': 0 },
		sickness_present: { type: 'string' },
		residency_status: {
			type: 'string',
			required: true,
			enum: ['May-Ari', 'Umuupa'],
		},
		is_hoa_noa: {
			type: 'string',
			required: true,
			minLength: 3,
			maxLength: 3,
			enum: ['HOA', 'NOA', 'N/A'],
		},
		location_coordinates: { type: 'object', required: true },
		location_link: { type: 'string', required: true, regex: /^https:\/\/www\.openstreetmap\.org\/.+/ }, // data validation for link
		household_address: { type: 'string', required: true, maxLength: 100 },
		household_material: {
			type: 'string',
			required: true,
			enum: [
				'Concrete',
				'Semi-Concrete',
				'Light materials',
				'Makeshift',
				'Natural',
			],
		},
		landslide_risk: { type: 'string', required: true },
		household_phase: { type: 'string', required: true },
		earthquake_risk: { type: 'string', required: true },
		fire_risk: { type: 'string', required: true },
		flood_risk: { type: 'string', required: true },
		storm_risk: { type: 'string', required: true },
		nearest_evac: { type: 'string', required: true, maxLength: 255 },
	},
	'buklod-official': {
		household_name: { type: 'string', required: true, maxLength: 127 },
		contact_number: {
			type: 'string',
			required: true,
			minLength: 11,
			maxLength: 11,
			regex: /^09\d*/,
		},
		number_residents: { type: 'number', required: true , 'minimum': 1},
		number_minors: { type: 'number', 'minimum': 0 },
		number_seniors: { type: 'number' , 'minimum': 0 },
		number_pregnant: { type: 'number' , 'minimum': 0 },
		number_pwd: { type: 'number' , 'minimum': 0 },
		number_sick: { type: 'number' , 'minimum': 0 },
		sickness_present: { type: 'string' },
		residency_status: {
			type: 'string',
			required: true,
			enum: ['May-Ari', 'Umuupa'],
		},
		is_hoa_noa: {
			type: 'string',
			required: true,
			minLength: 3,
			maxLength: 3,
			enum: ['HOA', 'NOA', 'N/A'],
		},
		location_coordinates: { type: 'object', required: true },
		location_link: { type: 'string', required: true },
		household_address: { type: 'string', required: true, maxLength: 100 },
		household_material: {
			type: 'string',
			required: true,
			enum: [
				'Concrete',
				'Semi-Concrete',
				'Light materials',
				'Makeshift',
				'Natural',
			],
		},
		landslide_risk: { type: 'string', required: true },
		household_phase: { type: 'string', required: true },
		earthquake_risk: { type: 'string', required: true },
		fire_risk: { type: 'string', required: true },
		flood_risk: { type: 'string', required: true },
		storm_risk: { type: 'string', required: true },
		nearest_evac: { type: 'string', required: true, maxLength: 255 },
	},
	'sdece-official-TEST': {
		partner_name: { type: 'string', required: true, maxLength: 255 },
		partner_address: { type: 'string', required: true, maxLength: 255 },
		partner_coordinates: { required: true },
		partner_contact_name: {
			type: 'string',
			required: true,
			maxLength: 255,
		},
		partner_contact_number: {
			type: 'string',
			required: true,
			minLength: 13,
			maxLength: 13,
			regex: /^[0-9]+$/,
		},
		partner_email: { type: 'string', required: true, maxLength: 127 },
		activity_name: { type: 'string', required: true },
		activity_nature: { type: 'string', required: true, maxLength: 255 },
		activity_date: { type: 'date', required: true, regex: /^\d{4}-\d{2}-\d{2}$/, },
		additional_partnership: { type: 'string', maxLength: 255 },
		organization_unit: { type: 'string', maxLength: 127 },
		ADMU_office: { type: 'string', required: true, maxLength: 127 },
		ADMU_contact_name: { type: 'string', required: true, maxLength: 255 },
		ADMU_email: {
			type: 'string',
			required: true,
			required: true,
			maxLength: 127,
		},
	},
	'sdece-official': {
		partner_name: { type: 'string', required: true, maxLength: 255 },
		partner_address: { type: 'string', required: true, maxLength: 255 },
		partner_coordinates: { required: true },
		partner_contact_name: {
			type: 'string',
			required: true,
			maxLength: 255,
		},
		partner_contact_number: {
			type: 'string',
			required: true,
			minLength: 13,
			maxLength: 13,
			regex: /^[0-9 ]+$/,
		},
		partner_email: { type: 'string', required: true, maxLength: 127 },
		activity_name: { type: 'string', required: true },
		activity_nature: { type: 'string', required: true, maxLength: 255 },
		activity_date: { type: 'date', required: true, regex: /^\d{4}-\d{2}-\d{2}$/, },
		additional_partnership: { type: 'string', maxLength: 255 },
		organization_unit: { type: 'string', maxLength: 127 },
		ADMU_office: { type: 'string', required: true, maxLength: 127 },
		ADMU_contact_name: { type: 'string', required: true, maxLength: 255 },
		ADMU_email: {
			type: 'string',
			required: true,
			required: true,
			maxLength: 127,
		},
	},
};

export const BUKLOD_RULES = DB_RULES_AND_DATA[0];
export const BUKLOD_RULES_TEST = DB_RULES_AND_DATA[1];
export const SDECE_RULES = DB_RULES_AND_DATA[2];
export const SDECE_RULES_TEST = DB_RULES_AND_DATA[3];

// export function setCollection(collection_name){
//     for(let rule of DB_RULES_AND_DATA ){
//         if (rule[0] === collection_name){
//             collection_reference = collection( DB, collection_name );
//         }
//     }
// }

export function setCollection(collection_name) {
	for (let rule of DB_RULES_AND_DATA) {
		if (rule[0] === collection_name) {
			collection_reference = collection(DB, collection_name);
		}
	}
}

export function getCollection() {
	return collection_reference;
}

export function getDocIdByPartnerName(partner_name) {
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
						// Assuming there is only one document with the given partner name
						const doc = querySnapshot.docs[0];
						return doc.id;
					} else {
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
					where(rule[1], '>=', partner_name),
					where(rule[1], '<=', partner_name + endName)
				)
			)
				.then((querySnapshot) => {
					if (!querySnapshot.empty) {
						const docs = querySnapshot.docs;
						return docs;
					} else {
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
	for (let rule of DB_RULES_AND_DATA) {
		if (collection_reference.id === rule[0]) {
			const DOC_REFERENCE = doc(DB, rule[0], docId);
			let docObj = {};
			return getDoc(DOC_REFERENCE).then((doc) => {
				docObj = doc;
				return docObj;
			});
		}
	}
}

export function addEntry(inp_obj) {

	for (let rule of DB_RULES_AND_DATA) {
		if (rule[0] === collection_reference.id) {
			let input = {}; // contents depend on the rule engine
			for (let i = 0; i < Object.keys(inp_obj).length; i++) {
				input[rule[2][i]] = inp_obj[rule[2][i]];
				console.log(input);
			}
			addDoc(collection_reference, input)
				.then((docRef) => {
					console.log(docRef);
					alert("You may now reload the page for your addition to reflect on this page");

				})
				.catch((error) => {
					console.error('Error adding document: ', error);
					alert("Error uploading new activity. Please try again");
				});
			break;
		}
	}
}

export function editEntry(inp_obj, docId) {
	for (let rule of DB_RULES_AND_DATA) {
		if (rule[0] === collection_reference.id) {
			const DOC_REFERENCE = doc(DB, rule[0], docId);
			updateDoc(DOC_REFERENCE, inp_obj)
				.then(() => {
					alert("You may now reload the page for your edit to reflect on this page");
				})
				.catch((error) => {
					console.error('Error adding document: ', error);
					alert("Error uploading the edited activity. Please try again");
				});
			break;
		}
	}
}

export function validateData(collectionName, data) {
	const rules = VALIDATION_RULES[collectionName];
	var errors = [];
	const fieldLabels = {
		'activity_name': 'Activity Name',
		'activity_nature': 'Nature of Activity',
		'activity_date': 'Date of Partnership',
		'additional_partnership': 'Additional Partnership',
		'organization_unit': 'Organization Unit',
		'partner_name': 'Name of Host Partner',
		'partner_address': 'Address of Host Partner',
		'partner_contact_name': 'Name of Contact Person',
		'partner_contact_number': 'Number of Contact Person',
		'partner_email': 'Email of Contact Person / Partner',
		'partner_coordinates': 'Partner Coordinates',
		'ADMU_office': 'Name of Office',
		'ADMU_contact_name': 'Name of Ateneo Contact Person',
		'ADMU_email': 'Email of Ateneo Contact Person'
	};

	for (const field in rules) {
		const rule = rules[field];
		const value = data[field];
		const fieldLabel = fieldLabels[field] || field;
    console.log(fieldLabel);

    // Required Test
    const IS_EMPTY = value == undefined || value == null || value == ''
    if ( 
      (rule.required && IS_EMPTY)|| 
      (!rule.required && IS_EMPTY)
    ) {
      if (rule.required) {
        errors.push(`${fieldLabel} is required.`);
      }
      continue;
    } 

    // this is at the beginning so that if it's not required, it doesn't check the rest of
    // the rules. 

    // Defining Test Conditions
    const DATE_TEST = rule.type === "date" && isNaN(new Date(value).getTime())
    const TYPE_TEST = rule.type && typeof value != rule.type 
    const MIN_LENGTH_TEST = rule.minLength && typeof value == 'string' && value.length < rule.minLength
    const MIN_VALUE_TEST = rule.minimum !== undefined && typeof value === 'number' && value < rule.minimum
    const MAX_LENGTH_TEST = rule.maxLength && typeof value == 'string' && value.length > rule.maxLength
    const REGEX_TEST = rule.regex && !rule.regex.test(value)
    const ENUM_TEST = rule.enum && !rule.enum.includes(value)


    // Map of Error Messages
    const ERROR_MESSAGES = new Map([
      ["date_test", `${fieldLabel} must be a valid date.`],
      ["type_test", `${fieldLabel} must be of type ${rule.type}. type is ${value}`],
      ["min_length_test", `${fieldLabel} must be at least ${rule.minLength} characters long.`],
      ["min_value_test", `${fieldLabel} must be at least ${rule.minimum}.`],
      ["max_length_test", `${fieldLabel} cannot exceed ${rule.maxLength} characters.`],
      ["regex_test",  `${fieldLabel} is invalid.`],
    ])

    // Map of Validation Tests
    const VALIDATION_TEST = new Map([
      ["date_test", DATE_TEST],
      ["type_test", TYPE_TEST],
      ["min_length_test", MIN_LENGTH_TEST],
      ["min_value_test", MIN_VALUE_TEST], 
      ["max_length_test", MAX_LENGTH_TEST], 
      ["regex_test", REGEX_TEST],
    ]);


    for (const x of VALIDATION_TEST.keys()) {
      if (VALIDATION_TEST.get(x)) {
        errors.push(ERROR_MESSAGES.get(x));
        break;
      }
    }

    // This is holdover code until the sdece team can implement frontend validation
		if (MIN_LENGTH_TEST && field === 'partner_contact_number') {
				errors.push(
					`${fieldLabel} must be at least ${rule.minLength} characters long and in the form 09XXXXXXXXX.`
				);
			continue;
		}

		if (ENUM_TEST) {
			errors.push(`${fieldLabel}' must be one of ${rule.enum.join(', ')}.`);
			continue;
		}

		//no validation for geolocation yet
	}

	return errors;
}
