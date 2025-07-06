// FIRESTORE DATABASE

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
  GeoPoint,
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';
import { 
  getCollection, 
  setCollection, 
  BUKLOD_RULES_TEST, 
  validateData, 
  editEntry,
  addEntry,
  getCoordinates,
  getDocIdByPartnerName,
} from '../../js/firestore_UNIV.js';
// Your Firestore code here
console.log("run2");
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyA8QWgic_hjbDL-EYIkvSRRII_yfTRdtOQ',
  authDomain: 'discs-osci-prj.firebaseapp.com',
  projectId: 'discs-osci-prj',
  storageBucket: 'discs-osci-prj.appspot.com',
  messagingSenderId: '601571823960',
  appId: '1:601571823960:web:1f1278ecb86aa654e6152d',
  measurementId: 'G-9N9ELDEMX9',
};

var collection_value = 'buklod-official'

initializeApp(firebaseConfig);
const db = getFirestore();
setCollection(collection_value);
const colRef = getCollection();
let partnersArray = [];

/*
export function getDocIdByPartnerName(partnerName) {
  const endName = partnerName.replace(/\s/g, '\uf8ff');
  return getDocs(
    query(
      colRef,
      where('household_name', '>=', partnerName),
      where('household_name', '<=', partnerName + endName)
    )
  )
    .then((querySnapshot) => {
      console.log(querySnapshot);
      if (!querySnapshot.empty) {
        // Assuming there is only one document with the given partner name
        const doc = querySnapshot.docs[0];
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
}*/

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
			if (
				doc.data().name !== 'Test 2' ||
				doc.data().name !== 'Test2'
			) {
				partnersArray.push(doc.data());
			}
		});

    // populate ul with partners
    partnersArray.forEach((partner) => {
      // Creating DOM elements
      const containerDiv = document.createElement('div');
      const img = document.createElement('svg');
      const listItem = document.createElement('li');
      const anchor = document.createElement('a');
      const nameDiv = document.createElement('div');
      const addressDiv = document.createElement('div');

			// Set attributes
			anchor.href = '#';
			let marker = L.marker([0, 0]);

			Object.defineProperty(partner, "marker", {value:marker, configurable: true});


			anchor.addEventListener('click', () => {
				partner.marker.fire('click');
			});

      // Adding classes and setting text content
      nameDiv.classList.add('name');
      addressDiv.classList.add('address');

      nameDiv.textContent = partner.household_name;
      addressDiv.textContent =
        partner.household_address + ' ' + partner.household_phase;

      listItem.classList.add('accordion');
      anchor.classList.add('accordion', 'link');
      containerDiv.classList.add('container-entry');

      // Append elements to the DOM
      anchor.appendChild(nameDiv);
      anchor.appendChild(addressDiv);

			listItem.appendChild(anchor);
			containerDiv.appendChild(img);
			containerDiv.appendChild(listItem);
			locationList.appendChild(containerDiv);
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
  console.log("populating form");
  var iframe = editFormModal.getElementsByClassName('formIframe')[0]
  var editForm = iframe.contentWindow.document

  console.log("Original name:", partner.household_name);


  const originalField = editForm.createElement('input');
  originalField.type = 'hidden';
  originalField.id = 'original_household_name';
  originalField.value = partner.household_name;
  editForm.body.appendChild(originalField);


  for (var data in partner) {
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
      // splits ":" in case its still there (test set only curently)
      // splits " " to keep the value (this is due to some values in the test set being formatted as "LEVEL RISK")
      var risk = partner[data].split(':')[0].split(' ')[0].toLowerCase()
      editForm.getElementById(data).value = risk;
      
    }
  }
  // partner.forEach(data => {
  // });
  // console.log(partner.household_name)
  // console.log(document)
  // console.log(editFormModal.getElementsByClassName('formIframe')[0].contentWindow.document.getElementById('household_name'))
}

export function submitEditForm(){
  console.log("Form is submitting!");
  var collated_input = {}; 
  var validate_errors =[];
  for(let i = 0; i < BUKLOD_RULES_TEST[2].length; i++){
    //BUKLOD_RULES_TEST[2] are just the field names of each document
    // console.log(BUKLOD_RULES_TEST[2][i]);
    // let q = document.getElementById(BUKLOD_RULES_TEST[2][i]).value;
    // collated_input[BUKLOD_RULES_TEST[2][i]] = q;
    let field_name = BUKLOD_RULES_TEST[2][i];
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
    
    // this is where data validation will happen
    // add the if-else statements of edge cases here
  }
  //Internal data validation within buklod tao app
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
  function displayErrors(errors) {
    let errorDiv = document.getElementById('error_messages');

    if (errorDiv) {

        errorDiv.innerHTML = '';

        if (validate_errors.length > 0) {
            for (let error of validate_errors) {
                let errorParagraph = document.createElement('p');
                errorParagraph.textContent = error;
                errorDiv.appendChild(errorParagraph);
            }
        }
        } else {
            console.error("Error: Couldn't find element with ID 'error_messages'.");
        }
    }
 }
export function submitAddForm(){
  var collatedInput = {};

  for (let i = 0; i < BUKLOD_RULES_TEST[2].length; i++) {

      let fieldName = BUKLOD_RULES_TEST[2][i];
      let inputValue = document.getElementById(fieldName).value;

      if (fieldName == 'number_residents' || fieldName == 'number_minors' || fieldName == 'number_pregnant' || fieldName == 'number_pwd' || fieldName == 'number_sick' || fieldName == 'number_seniors') {
          collatedInput[fieldName] = Number(inputValue);
      } else if (fieldName == 'location_coordinates') {
          console.log(inputValue)
          console.log(typeof inputValue)
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

  function displayErrors(errors) {
  let errorDiv = document.getElementById('error_messages');

  if (errorDiv) {

      errorDiv.innerHTML = '';

      if (errors.length > 0) {
          for (let error of errors) {
              let errorParagraph = document.createElement('p');
              errorParagraph.textContent = error;
              errorDiv.appendChild(errorParagraph);
          }
      }
      } else {
          console.error("Error: Couldn't find element with ID 'error_messages'.");
      }
  }

}