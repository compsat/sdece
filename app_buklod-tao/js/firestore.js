// FIRESTORE DATABASE

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js';
import {
  getFirestore,
  getDocs,
  doc,
  getDoc,
  GeoPoint,
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';
import { 
  getCollection, 
  setCollection, 
  BUKLOD_RULES, 
  validateData, 
  editEntry,
  addEntry,
  getCoordinates,
  getDocIdByPartnerName,
} from '/js/firestore_UNIV.js';
// Your Firestore code here
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyA8QWgic_hjbDL-EYIkvSRRII_yfTRdtOQ',
  authDomain: 'discs-osci-prj.firebaseapp.com',
  projectId: 'discs-osci-prj',
  storageBucket: 'discs-osci-prj.appspot.com',
  messagingSenderId: '601571823960',
  appId: '1:601571823960:web:1f1278ecb86aa654e6152d',
  measurementId: 'G-9N9ELDEMX9',
};

var collection_value = 'buklod-official'

initializeApp(FIREBASE_CONFIG);
const db = getFirestore();
setCollection(collection_value);
const colRef = getCollection();
let partnersArray = new Map();

export function getDocByID(docId) {
  const docReference = doc(db, 'nstp-3', docId);
  let docObj = {};
  return getDoc(docReference).then((doc) => {
    docObj = doc.data();
    return docObj;
  });
}

// get docs from firestore

export function getPartnersArray() {
  return partnersArray;
}

const loadData = async() => {
	const getRefs = async() => {
		await getDocs(colRef)
	.then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
      let docData = doc.data();
      let docID = doc.id;
			partnersArray.set(docID,docData);
    
		});
	})
	.catch((error) => {
		console.error('Error getting documents: ', error);
	});
	}

	await getRefs();
}


await loadData();

export function populateEditForm(partner, editFormModal) {
  var iframe = editFormModal.getElementsByClassName('form-modal')[0]
  var editForm = iframe.contentWindow.document

  const originalField = editForm.createElement('input');
  originalField.type = 'hidden';
  originalField.id = 'original_household_name';
  originalField.value = partner.household_name;
  editForm.body.appendChild(originalField);


  for (var data in partner) {
    // some households have a 'marker' or 'status' attribute. Check database for status fields. 
    // Not sure yet where the marker came from 
    // this skips over them so no errors are logged
    if (!editForm.getElementById(data.toString())) { 
      // console.warn(`Element with ID "${data}" not found`); 
      continue;
    }

    if (partner[data] instanceof Object){
      editForm.getElementById(data.toString()).value = partner[data]._lat + " " + partner[data]._long
    } 
    
    else {
      if (partner[data] != null) {
        editForm.getElementById(data.toString()).value = partner[data].toString();
      } else {
        console.log(data +" blank")
        editForm.getElementById(data.toString()).value = '';
      }
    }
        
    if (data.includes('risk') && !data.includes('description')) {
      // Get the level text: remove description part
      var riskLevel = partner[data].split(':')[0].trim().toUpperCase();

      // Normalize: if it’s just 'HIGH', append ' RISK'
      if (!riskLevel.includes('RISK')) {
        riskLevel = `${riskLevel} RISK`;
      }

      editForm.getElementById(data).value = riskLevel;
    }

  }
}

// CODE LOGIC FOR SUBMIT FORMS
// ------------------------------------------
// Function for submission of Edit Household form
export function submitEditForm(){
  var collated_input = {}; 
  var validate_errors =[];
  for(let i = 0; i < BUKLOD_RULES[2].length; i++){
    //BUKLOD_RULES[2] are just the field names of each document
    // let q = document.getElementById(BUKLOD_RULES[2][i]).value;
    // collated_input[BUKLOD_RULES[2][i]] = q;
    let field_name = BUKLOD_RULES[2][i];
    let input_value = document.getElementById(field_name).value;

    if (document.getElementById(field_name).type == "number"){
      input_value = Number(input_value);
    }

    // checks if the input is location coord and adjusts it to the proper input
    if (field_name === 'location_coordinates'){
      input_value = input_value.split(' ');
      input_value = new GeoPoint(input_value[0],input_value[1]);
    }

    if (field_name.includes("risk") && !field_name.includes("description")){
      input_value = input_value.toUpperCase();
    }

    collated_input[field_name] = input_value;
    
    // add the if-else statements of edge cases here
  }
  // Internal data validation within buklod tao app
  validate_errors = validateData(collection_value,collated_input);

  
  if (validate_errors.length > 0){
    console.log("failed vaildation");
    displayErrors(validate_errors);
    alert("Error in validating values. Check console for errors present");
    for(var i in validate_errors){
      console.log(validate_errors[i]);
    }
  }
  else {
    console.log("passed validation");

    const original_household_name = document.getElementById('original_household_name').value;

    const waitForPromise = async() => {
      const householdID = await getDocIdByPartnerName(original_household_name);
      console.log("Resolved householdID to editEntry:", householdID);

      if (householdID) {
        editEntry(collated_input, householdID);
      } else {
        console.error("No householdID found for the given household_name!");
        alert("Error: Unable to find household ID for original name.");
      }
    }

    waitForPromise();
  }
  //Data Validation Error message display within modal
  
}

// Display errors inline
function displayInlineErrors(errors) {
    // Clear all previous errors
    clearAllErrors();
    
    // Create a mapping of field names to error containers
    const fieldMappings = {
        'Household Name': 'household_name',
        'Household Phase': 'household_phase',
        'Contact Number': 'contact_number', 
        'Number of Residents': 'number_residents',
        'Residency Status': 'residency_status',
        'HOA Status': 'is_hoa_noa',
        'Location Link': 'location_link',
        'Household Address': 'household_address',
        'Household Material': 'household_material',
        'Landslide Risk': 'landslide_risk',
        'Earthquake Risk': 'earthquake_risk',
        'Fire Risk': 'fire_risk',
        'Flood Risk': 'flood_risk',
        'Storm Risk': 'storm_risk',
        'Nearest Evacuation Area': 'nearest_evac'
    };
    
    // Process each error
    for (let error of errors) {
        // Find the field name from the error message
        for (let [errorKey, fieldName] of Object.entries(fieldMappings)) {
            if (error.includes(errorKey)) {
                // Find the field element
                const field = document.getElementById(fieldName);
                const label = document.querySelector(`label[for="${fieldName}"]`);
                const errorContainer = document.getElementById(`${fieldName}_error`);
                
                if (field) {
                    // Add error styling to field
                    field.classList.add('error');
                    
                    // Add error styling to label
                    if (label) {
                        label.classList.add('error');
                    }
                    
                    // Show error message below field
                    if (errorContainer) {
                        errorContainer.textContent = error;
                        errorContainer.classList.add('show');
                    }
                }
                break;
            }
        }
    }
}

// Clear all error states
function clearAllErrors() {
    // Remove error classes from all fields
    const fields = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    fields.forEach(field => {
        field.classList.remove('error');
        
        // Clear error message
        const errorContainer = document.getElementById(`${field.id}_error`);
        if (errorContainer) {
            errorContainer.textContent = '';
            errorContainer.classList.remove('show');
        }
    });
    
    // Remove error classes from all labels
    const labels = document.querySelectorAll('.form-label');
    labels.forEach(label => {
        label.classList.remove('error');
    });
}

// Updated displayErrors function to use inline errors
function displayErrors(errors) {
    displayInlineErrors(errors);
}

// Function for submission of Add Household form
export function submitAddForm(){
  var collatedInput = {};

  for (let i = 0; i < BUKLOD_RULES[2].length; i++) {

      let fieldName = BUKLOD_RULES[2][i];
      let inputValue = document.getElementById(fieldName).value;

      if (fieldName == 'number_residents' || fieldName == 'number_minors' || fieldName == 'number_pregnant' || fieldName == 'number_pwd' || fieldName == 'number_sick' || fieldName == 'number_seniors') {
          collatedInput[fieldName] = Number(inputValue);
      } else if (fieldName == 'location_coordinates') {
          const geoPoint = getCoordinates(inputValue);
          collatedInput['location_coordinates'] = geoPoint;
      } else {
          collatedInput[fieldName] = inputValue;
      }
  }

  const errors = validateData("buklod-official", collatedInput);

  if (errors.length > 0) {
      displayErrors(errors);
  } else {
      addEntry(collatedInput);
      window.parent.document.getElementById('addModal').style.display = 'none';
  };
}
// ------------------------------------------