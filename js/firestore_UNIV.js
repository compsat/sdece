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

import { FILTER_RULES } from '/js/ruleEngines.js'
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
	// Handle both comma and plus-separated formats
	var arr = coordinates.includes(',') ? coordinates.split(',') : coordinates.split('+');
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

const SECRETS_PATH = "/js/secrets.json";
const SECRETS_REQ = new Request(SECRETS_PATH);
const SECRETS_RES = await fetch(SECRETS_REQ);
const SECRETS = await SECRETS_RES.json();

export const firebaseConfig = SECRETS.firebaseConfig;

var app = initializeApp(firebaseConfig);
export const DB = getFirestore(app);

var collection_reference = null;
var rule_reference = null;

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
			'landslide_risk_description',
			'earthquake_risk',
			'earthquake_risk_description',
			'fire_risk',
			'fire_risk_description',
			'flood_risk',
			'flood_risk_description',
			'storm_risk',
			'storm_risk_description',
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
			'landslide_risk_description',
			'earthquake_risk',
			'earthquake_risk_description',
			'fire_risk',
			'fire_risk_description',
			'flood_risk',
			'flood_risk_description',
			'storm_risk',
			'storm_risk_description',
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
    household_name: { label: "Household Name", type: 'string', required: true, maxLength: 127 },
	contact_number: {
		label: "Contact Number",
		type: 'string',
		required: true,
		minLength: 11,
		maxLength: 11,
		regex: /^09[0-9]{9}$/,
		},
    number_residents: { label: "Number of Residents", type: 'number', required: true , 'minimum': 1},
		number_minors: { label: "Number of Minor Residents", type: 'number', 'minimum': 0 },
		number_seniors: { label: "Number of Senior Residents", type: 'number' , 'minimum': 0 },
		number_pregnant: { label: "Number of Pregnant Residents", type: 'number' , 'minimum': 0 },
		number_pwd: { label: "Number of Persons with Disabilities", type: 'number' , 'minimum': 0 },
		number_sick: { label: "Number of Sick Residents", type: 'number' , 'minimum': 0 },
		sickness_present: { label: "Sicknesses Present", type: 'string' },
		residency_status: {
      label: "Residency Status",
			type: 'string',
			required: true,
			enum: ['May-Ari', 'Umuupa'],
		},
		is_hoa_noa: {
      label: "HOA Status",
			type: 'string',
			required: true,
			minLength: 3,
			maxLength: 3,
			enum: ['HOA', 'NOA', 'N/A'],
		},
    location_coordinates: {label: "Location Coordinates", type: 'object', required: true },
		location_link: { label: "Location Link", type: 'string', required: true, regex: /^https:\/\/www\.openstreetmap\.org\/.+/ }, // data validation for link
		household_address: { label: "Household Address", type: 'string', required: true, maxLength: 100 },
		household_material: {
      label: "Household Material",
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
		
    landslide_risk: { label: 'Landslide Risk', type: 'string', required: true },
		landslide_risk_description:{ label: 'Landslide Risk Description', type: 'string', required: false},
		earthquake_risk: { label: 'Earthquake Risk', type: 'string', required: true },
		earthquake_risk_description:{ label: 'Earthquake Risk Description', type: 'string', required: false},
		fire_risk: { label: 'Fire Risk', type: 'string', required: true },
		fire_risk_description:{ label: 'Fire Risk Description', type: 'string', required: false},
		flood_risk: { label: 'Flood Risk', type: 'string', required: true },
		flood_risk_description:{ label: 'Flood Risk Description', type: 'string', required: false},
		storm_risk: { label: 'Storm Risk', type: 'string', required: true },
		storm_risk_description: { label: 'Storm Risk Description', type: 'string', required: false},

		nearest_evac: { label: 'Nearest Evacuation Area', type: 'string', required: true, maxLength: 255 },
	},
	'buklod-official': {
    household_name: { label: "Household Name", type: 'string', required: true, maxLength: 127 },
		contact_number: {
      label: "Contact Number",
			type: 'string',
			required: true,
			minLength: 11,
			maxLength: 11,
			regex: /^09[0-9]{9}$/,
		},
    number_residents: { label: "Number of Residents", type: 'number', required: true , 'minimum': 1},
		number_minors: { label: "Number of Minor Residents", type: 'number', 'minimum': 0 },
		number_seniors: { label: "Number of Senior Residents", type: 'number' , 'minimum': 0 },
		number_pregnant: { label: "Number of Pregnant Residents", type: 'number' , 'minimum': 0 },
		number_pwd: { label: "Number of Persons with Disabilities", type: 'number' , 'minimum': 0 },
		number_sick: { label: "Number of Sick Residents", type: 'number' , 'minimum': 0 },
		sickness_present: { label: "Sicknesses Present", type: 'string' },
		residency_status: {
      label: "Residency Status",
			type: 'string',
			required: true,
			enum: ['May-Ari', 'Umuupa'],
		},
		is_hoa_noa: {
      label: "HOA Status",
			type: 'string',
			required: true,
			minLength: 3,
			maxLength: 3,
			enum: ['HOA', 'NOA', 'N/A'],
		},
    location_coordinates: { label: "Location Coordinates", type: 'object', required: true },
		location_link: { label: "Location Link", type: 'string', required: true, regex: /^https:\/\/www\.openstreetmap\.org\/.+/  },
		household_address: { label: "Household Address", type: 'string', required: true, maxLength: 100 },
		household_material: {
      label: "Household Material",
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
		household_phase: { type: 'string', required: true },

    landslide_risk: { label: 'Landslide Risk', type: 'string', required: true },
		landslide_risk_description:{ label: 'Landslide Risk Description', type: 'string', required: false},
		earthquake_risk: { label: 'Earthquake Risk', type: 'string', required: true },
		earthquake_risk_description:{ label: 'Earthquake Risk Description', type: 'string', required: false},
		fire_risk: { label: 'Fire Risk', type: 'string', required: true },
		fire_risk_description:{ label: 'Fire Risk Description', type: 'string', required: false},
		flood_risk: { label: 'Flood Risk', type: 'string', required: true },
		flood_risk_description:{ label: 'Flood Risk Description', type: 'string', required: false},
		storm_risk: { label: 'Storm Risk', type: 'string', required: true },
		storm_risk_description: { label: 'Storm Risk Description', type: 'string', required: false},

		nearest_evac: { type: 'string', required: true, maxLength: 255 },
	},
	'sdece-official-TEST': {
    partner_name: { label: "Name of Host Partner", type: 'string', required: true, maxLength: 255 },
		partner_address: { label: "Address of Host Partner", type: 'string', required: true, maxLength: 255 },
		partner_coordinates: { label: "Partner Coordinates", required: true },
		partner_contact_name: {
      label: "Name of Contact Person",
			type: 'string',
			required: true,
			maxLength: 255,
		},
		partner_contact_number: {
      label: "Number of Contact Person",
			type: 'string',
			required: true,
			minLength: 11,
			maxLength: 11,
			regex: /^09\d{9}$/
		},
    partner_email: { label: 'Email of Contact Person/Partner', type: 'string', required: true, maxLength: 127, regex: /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/ },
		activity_name: { label: 'Activity Name', type: 'string', required: true },
		activity_nature: { label: 'Nature of Activity', type: 'string', required: true, maxLength: 255 },
		activity_date: { label: 'Date of Partnership', type: 'string', required: true, regex: /^\d{4}-\d{2}-\d{2}$/ },
		additional_partnership: { label: 'Additional Partnership', type: 'string', maxLength: 255 },
		organization_unit: { label: 'Organization Unit', type: 'string', maxLength: 127 },
		ADMU_office: { label: 'Name of Office', type: 'string', required: true, maxLength: 127 },
		ADMU_contact_name: { label: 'Name of Ateneo Contact Person', type: 'string', required: true, maxLength: 255 },
		ADMU_email: {
      label: "Email of Ateneo Contact Person",
			type: 'string',
			required: true,
			// required: true					redundant declaration
			maxLength: 127,
			regex: /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/
		},
	},
	'sdece-official': {
    partner_name: { label: "Name of Host Partner", type: 'string', required: true, maxLength: 255 },
		partner_address: { label: "Address of Host Partner", type: 'string', required: true, maxLength: 255 },
		partner_coordinates: { label: "Partner Coordinates", required: true },
		partner_contact_name: {
      label: "Name of Contact Person",
			type: 'string',
			required: true,
			maxLength: 255,
		},
		partner_contact_number: {
      label: "Number of Contact Person",
			type: 'string',
			required: true,
			minLength: 11,
			maxLength: 11,
			regex: /^09\d{9}$/,
		},
    partner_email: { label: 'Email of Contact Person/Partner', type: 'string', required: true, maxLength: 127, regex: /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/ },
		activity_name: { label: 'Activity Name', type: 'string', required: true },
		activity_nature: { label: 'Nature of Activity', type: 'string', required: true, maxLength: 255 },
		activity_date: { label: 'Date of Partnership', type: 'string', required: true, regex: /^\d{4}-\d{2}-\d{2}$/ },
		additional_partnership: { label: 'Additional Partnership', type: 'string', maxLength: 255 },
		organization_unit: { label: 'Organization Unit', type: 'string', maxLength: 127 },
		ADMU_office: { label: 'Name of Office', type: 'string', required: true, maxLength: 127 },
		ADMU_contact_name: { label: 'Name of Ateneo Contact Person', type: 'string', required: true, maxLength: 255 },
		ADMU_email: {
      label: "Email of Ateneo Contact Person",
			type: 'string',
			required: true,
			// required: true					redundant declaration
			maxLength: 127,
			regex: /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/
		},
	},
};

export const BUKLOD_RULES = DB_RULES_AND_DATA[0];
export const BUKLOD_RULES_TEST = DB_RULES_AND_DATA[1];
export const SDECE_RULES = DB_RULES_AND_DATA[2];
export const SDECE_RULES_TEST = DB_RULES_AND_DATA[3];

export function setCollection(collection_name) {
	for (let rule of DB_RULES_AND_DATA) {
		if (rule[0] === collection_name) {
			collection_reference = collection(DB, collection_name);
      rule_reference = rule
		}
	}
}

export function getCollection() {
	return collection_reference;
}

export function getDocIdByPartnerName(partner_name) {
	const endName = partner_name.replace(/\s/g, '\uf8ff');

  return getDocs(
    query(
      collection_reference,
      where(rule_reference[1], '>=', partner_name), // let's wait for Luigi's standardization. IF_ELSE nalang muna
      where(rule_reference[1], '<=', partner_name + endName)
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

export function getDocsByPartnerName(partner_name) {
	const endName = partner_name.replace(/\s/g, '\uf8ff');

  return getDocs(
    query(
      collection_reference,
      where(rule_reference[1], '>=', partner_name),
      where(rule_reference[1], '<=', partner_name + endName)
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

export function getDocByID(docId) {
  const DOC_REFERENCE = doc(DB, rule_reference[0], docId);
  return getDoc(DOC_REFERENCE).then((docSnap) => {
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.warn("Document not found for ID:", docId);
      return null;
    }
  });
}



export function addEntry(inp_obj) {
	for (let rule of DB_RULES_AND_DATA) {
		if (rule[0] === collection_reference.id) {
			let input = {}; // contents depend on the rule engine
			for (let i = 0; i < Object.keys(inp_obj).length; i++) {
				input[rule[2][i]] = inp_obj[rule[2][i]];
			}
			
			// Return the Promise so the form can handle success/error
			return addDoc(collection_reference, input)
				.then((docRef) => {
					// console.log(docRef);
					alert("You may now reload the page for the new household to reflect on this page");
					window.parent.location.reload(); 
					return docRef; // Return the document reference for success handling
				})
				.catch((error) => {
					console.error('Error adding document: ', error);
					throw error; // Re-throw the error so the form can catch it
				});
		}
	}
	
	// Return a rejected Promise if no matching collection found
	return Promise.reject(new Error('Collection not found'));
}

export function editEntry(inp_obj,docId) {
	for (let rule of DB_RULES_AND_DATA) {
		if (rule[0] === collection_reference.id) {
			const DOC_REFERENCE = doc(DB, rule[0], docId);
			updateDoc(DOC_REFERENCE, inp_obj)
				.then(() => {
					alert("You may now reload the page for your edit to reflect on this page");
					window.parent.location.reload(); 
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

	for (const field in rules) {
		const rule = rules[field];
		const value = data[field];
		const fieldLabel = rule.label || field;
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

    const MIN_LENGTH_TEST = rule.minLength && typeof value == 'string' && value.length < rule.minLength
    // this will stay here until sdece team implements front-end validation of phone
    // number

    // Map of Validation Tests
    const VALIDATION_TEST = new Map([
      ["date_test", rule.type === "date" && isNaN(new Date(value).getTime())],
      ["type_test", rule.type && typeof value != rule.type],
      ["min_length_test", MIN_LENGTH_TEST],
      ["min_value_test", rule.minimum !== undefined && typeof value === 'number' && value < rule.minimum], 
      ["max_length_test", rule.maxLength && typeof value == 'string' && value.length > rule.maxLength], 
      ["regex_test", rule.regex && !rule.regex.test(value)],
    ]);

    // Map of Error Messages
    const ERROR_MESSAGES = new Map([
      ["date_test", `${fieldLabel} must be a valid date.`],
      ["type_test", `${fieldLabel} must be of type ${rule.type}. type is ${value}`],
      ["min_length_test", `${fieldLabel} must be at least ${rule.minLength} characters long.`],
      ["min_value_test", `${fieldLabel} must be at least ${rule.minimum}.`],
      ["max_length_test", `${fieldLabel} cannot exceed ${rule.maxLength} characters.`],
      ["regex_test",  `${fieldLabel} is invalid.`],
    ])


    // This is holdover code until the sdece team can implement frontend validation
		if (MIN_LENGTH_TEST && field === 'partner_contact_number') {
				errors.push(
					`${fieldLabel} must be at least ${rule.minLength} characters long and in the form 09XXXXXXXXX.`
				);
			continue;
		}

    for (const x of VALIDATION_TEST.keys()) {
      if (VALIDATION_TEST.get(x)) {
        errors.push(ERROR_MESSAGES.get(x));
        break;
      }
    }


		if (rule.enum && !rule.enum.includes(value)) {
			errors.push(`${fieldLabel}' must be one of ${rule.enum.join(', ')}.`);
			continue;
		}

		// Check for regex pattern
		if (rule.regex && typeof value === 'string') {
			if (!rule.regex.test(value)) {
				if (fieldLabel == 'Contact Number') {
					errors.push(`${fieldLabel} is not in the correct format. Number be in the format: 09xxxxxxxxx.`);
					continue;
				}
				if (fieldLabel == 'Location Link') {
					errors.push(`${fieldLabel} is not in the correct format. Link must start with: https://www.openstreetmap.org/ss`);
					continue;
				}
			}
		}

	}
	return errors;
}

export async function filterData(filter_rules, data) {
  const rules = FILTER_RULES[filter_rules];
  const waitingResults = [];
  const finalResults = new Map();

  for (const field in rules) {
		const filterRule = rules[field];
		const value = data[field];
		const fieldLabel = filterRule.label || field;


    const IS_EMPTY = value == undefined || value == null || value == ''

    if (IS_EMPTY) continue;

    switch (filterRule.type) {
      case "string":
        if (value.constructor == Array){
          value.forEach((data) => {
          waitingResults.push(
              getDocs(query(collection_reference, where(fieldLabel, "==", data)))
            );
          });
        } else {
          waitingResults.push(getDocs(query(collection_reference, where(fieldLabel, "==", value))))
        }
        break;
      default:
        break;
    }
  }

  const unmergedResults = await Promise.all(waitingResults);

  unmergedResults.forEach((query) => {
    query.forEach((doc) => {
      let data = doc.data();
      let docID = doc.id;
      finalResults.set(docID, data);
    });
  });

  return finalResults;
}

