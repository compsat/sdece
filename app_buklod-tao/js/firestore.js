// FIRESTORE DATABASE

import {
  getDocs,
  GeoPoint,
  doc,
  updateDoc,
  deleteField,
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

var collection_value = 'buklod-official'

setCollection(collection_value);
const colRef = getCollection();
let partnersArray = new Map();

// Normalize legacy field names from CSV-imported documents
const LEGACY_FIELD_MAP = {
  ownership_status:    'residency_status',
  bilang_walang_sakit: 'number_healthy',
  materyales_bahay:    'household_material',
  evacuation_area:     'nearest_evac',
  awareness_readiness: 'knowledge_readiness',
};

// Returns { normalized, legacyKeys, fieldUpdates }
// legacyKeys  — old field names to delete from Firestore
// fieldUpdates — field values that were normalized and need writing back
function normalizeLegacyDoc(data) {
  const normalized = Object.assign({}, data);
  const legacyKeys = [];
  const fieldUpdates = {};

  // Rename legacy fields
  for (const [oldKey, newKey] of Object.entries(LEGACY_FIELD_MAP)) {
    if (oldKey in normalized) {
      legacyKeys.push(oldKey);
      if (!(newKey in normalized)) {
        normalized[newKey] = normalized[oldKey];
      }
      delete normalized[oldKey];
    }
  }

  // Parse house_coordinates → location_coordinates GeoPoint + location_link
  if ('house_coordinates' in normalized) {
    legacyKeys.push('house_coordinates');
    if (!normalized.location_coordinates) {
      const raw = (normalized.house_coordinates || '').toString().trim();
      const parts = raw.split(',').map(s => s.trim());
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const lat = parseFloat(parseFloat(parts[0]).toFixed(5));
        const lng = parseFloat(parseFloat(parts[1]).toFixed(5));
        normalized.location_coordinates = new GeoPoint(lat, lng);
        if (!normalized.location_link) {
          normalized.location_link = `https://www.openstreetmap.org/#map=19/${lat}/${lng}`;
        }
      }
    }
    delete normalized.house_coordinates;
  }

  // Normalize household_material long-form values → canonical short form
  if (normalized.household_material) {
    const mat = normalized.household_material.trim().toLowerCase();
    let canonical = null;
    if (mat.startsWith('natural'))                            canonical = 'Natural';
    else if (mat.startsWith('semi'))                          canonical = 'Semi-Concrete';
    else if (mat.startsWith('concrete'))                      canonical = 'Concrete';
    else if (mat.startsWith('light'))                         canonical = 'Light materials';
    else if (mat.startsWith('makeshift'))                     canonical = 'Makeshift';
    if (canonical && canonical !== normalized.household_material) {
      normalized.household_material = canonical;
      fieldUpdates.household_material = canonical;
    }
  }

  // Normalize residency_status casing
  if (normalized.residency_status) {
    const rs = normalized.residency_status.trim().toLowerCase();
    let canonical = null;
    if (rs === 'may-ari' || rs === 'may ari') canonical = 'May-Ari';
    else if (rs === 'umuupa')                 canonical = 'Umuupa';
    if (canonical && canonical !== normalized.residency_status) {
      normalized.residency_status = canonical;
      fieldUpdates.residency_status = canonical;
    }
  }

  // Derive household_address from house_number + street if missing
  if (!normalized.household_address) {
    const houseNum = (normalized.house_number || '').toString().trim();
    const street   = (normalized.street || '').toString().trim();
    if (houseNum || street) {
      normalized.household_address = [houseNum, street].filter(Boolean).join(', ');
      fieldUpdates.household_address = normalized.household_address;
    }
  }

  return { normalized, legacyKeys, fieldUpdates };
}

// get docs from firestore

export function getPartnersArray() {
  return partnersArray;
}

const loadData = async() => {
	const getRefs = async() => {
		await getDocs(colRef)
	.then(async (querySnapshot) => {
		const writebacks = [];

		querySnapshot.forEach((snapshot) => {
      const { normalized, legacyKeys, fieldUpdates } = normalizeLegacyDoc(snapshot.data());
      const docID = snapshot.id;
			partnersArray.set(docID, normalized);

      const hasLegacyKeys = legacyKeys.length > 0;
      const hasFieldUpdates = Object.keys(fieldUpdates).length > 0;

      if (hasLegacyKeys || hasFieldUpdates) {
        const update = {};
        if (hasLegacyKeys) {
          // Full field-rename: write all normalized values and delete old keys
          for (const key of Object.keys(normalized)) {
            update[key] = normalized[key];
          }
          for (const oldKey of legacyKeys) {
            update[oldKey] = deleteField();
          }
        }
        // Write back any value-only normalizations (material, residency, address)
        Object.assign(update, fieldUpdates);
        writebacks.push({ docID, update });
      }
		});

    // Fire write-backs silently in the background
    for (const { docID, update } of writebacks) {
      const docRef = doc(colRef, docID);
      updateDoc(docRef, update).catch((err) => {
        console.warn(`Failed to normalize doc ${docID}:`, err);
      });
    }
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


  const standardMaterials = ['Concrete', 'Semi-Concrete', 'Light materials', 'Makeshift', 'Natural'];

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

  // If the stored material is not a standard option, select "Other" and show the custom input
  const storedMaterial = partner.household_material;
  if (storedMaterial && !standardMaterials.includes(storedMaterial)) {
    const materialSelect = editForm.getElementById('household_material');
    const materialOther = editForm.getElementById('household_material_other');
    if (materialSelect) materialSelect.value = 'Other';
    if (materialOther) {
      materialOther.value = storedMaterial;
      materialOther.style.display = 'block';
    }
  }

  // Sync evacuation area checkboxes from the stored nearest_evac value
  if (iframe.contentWindow.syncEvacCheckboxes) {
    iframe.contentWindow.syncEvacCheckboxes();
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

    // Show banner popup for validationData() errors
    if (errors.length > 0 && typeof window.showFormBanner === 'function') {
        window.showFormBanner(`Please fix the following: ${errors.join(' | ')}`);
    }
    
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
export async function submitAddForm(){
  var collatedInput = {};

  for (let i = 0; i < BUKLOD_RULES[2].length; i++) {

      let fieldName = BUKLOD_RULES[2][i];
      let inputValue = document.getElementById(fieldName).value;

      if (fieldName == 'number_residents' || fieldName == 'number_minors' || fieldName == 'number_pregnant' || fieldName == 'number_pwd' || fieldName == 'number_sick' || fieldName == 'number_seniors' || fieldName == 'number_families' || fieldName == 'number_healthy' || fieldName == 'exit_points' || fieldName == 'knowledge_readiness') {
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
      // Suppress the reload-prompt alert from addEntry, then auto-reload
      const originalAlert = window.alert;
      window.alert = (msg) => {
          if (msg && msg.toLowerCase().includes('reload')) {
              window.alert = originalAlert;
              window.parent.location.reload();
          } else {
              originalAlert(msg);
          }
      };

      await addEntry(collatedInput);
      window.alert = originalAlert; // restore in case addEntry showed no alert
      window.parent.location.reload();
  };
}
// ------------------------------------------