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
	Timestamp
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';
import {
	getCollection,
	setCollection,
	SDECE_RULES,
	SDECE_RULES_TEST,
	getDocIdByPartnerName,
	validateData,
	addEntry,
	editEntry
} from '/js/firestore_UNIV.js';
import { addListeners, map, getDivContent } from '/js/index_UNIV.js';
import { showMainModal, showAddModal } from './index.js';
// Your Firestore code here
const firebaseConfig = {
  apiKey: 'AIzaSyA8QWgic_hjbDL-EYIkvSRRII_yfTRdtOQ',
  authDomain: 'discs-osci-prj.firebaseapp.com',
  projectId: 'discs-osci-prj',
  storageBucket: 'discs-osci-prj.appspot.com',
  messagingSenderId: '601571823960',
  appId: '1:601571823960:web:1f1278ecb86aa654e6152d',
  measurementId: 'G-9N9ELDEMX9',
};
var collection_value = 'sdece-official'

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


// Commented out the loadIndex to place the script to run index.js in the index.html. 
// This makes the previously written code for index.js to be usable
/*
// loadIndex is seperate from the index.html is so that the data (partnersArray) is filled
// Otherwise, the partnersArray is empty when the index.js is run. This leads to nothing showing
const loadIndex = async() => {
	let index = document.createElement("script");
	index.type = "module";
	index.src = "./js/index.js";
	document.body.appendChild(index);
}*/

// Removed from being async as it is required to be run before the index.js so that pins and data are filled
/*
const loadFile = async() => {
  console.log("entered Loadfile");
	await loadData();
	loadIndex();
  console.log("loaded index");
}

loadFile();
*/
await loadData();
//loadIndex();


function showModal(partner) {
  const modal = document.getElementById('partnerModal');
  const modalHeader = document.getElementById('modalHeader');
  const modalContent = document.getElementById('modalContent');

  // Clear previous content
  modalHeader.innerHTML = '';
  modalContent.innerHTML = '';

  // Variables for risk levels
  var earthquake = partner.earthquake_risk;
  var earthquake_split = earthquake.split(' RISK: ');
  var earthquake1 = earthquake_split[0];
  var earthquake2 = earthquake_split[1];
  var fire = partner.fire_risk;
  var fire_split = fire.split(' RISK: ');
  var fire1 = fire_split[0];
  var fire2 = fire_split[1];
  var flood = partner.flood_risk;
  var flood_split = flood.split(' RISK: ');
  var flood1 = flood_split[0];
  var flood2 = flood_split[1];
  var landslide = partner.landslide_risk;
  var landslide_split = landslide.split(' RISK: ');
  var landslide1 = landslide_split[0];
  var landslide2 = landslide_split[1];
  var storm = partner.storm_risk;
  var storm_split = storm.split(' RISK: ');
  var storm1 = storm_split[0];
  var storm2 = storm_split[1];

  // Create div elements for each piece of information
  const nameDiv = document.createElement('div');
  const partnerContentDiv = document.createElement('div');

  let partner_content = `
	<br>
	  <div>
		<p class="modalText" id="entry_contact_number" style="margin-top: -5px;">${partner.contact_number}</p>
		<p class="modalText" id="entry_address">${partner.household_address}</p>
	  </div>
	  <div class="modalLine">
		<label class="modalLabel" style="width: 220px;">Residency Status</label>
		<label class="modalLabel" style="width: 220px;">Part of HOA / NOA</label>
	  </div>
	  <div class="modalLine">
		<p class="modalText" id="entry_residency_status" style="width: 220px;">${partner.residency_status}</p>
		<p class="modalText" id="entry_HOA/NOA" style="width: 220px;">${partner.is_hoa_noa}</label>
	  </div>
	  <div>
		<label class="modalLabel">Nearest Evacuation Area</label>
		<p class="modalText" id="entry_nearest_evacuation_area">${partner.nearest_evac}</p>
	  </div>
	<button type="button" class="collapsible">Risk Levels</button>
	  <div class="colContent" style="display: block;">
		<div class="modalLine">
		  <label class="modalLabel">Earthquake</label>
		  <label class="modalLabel" id="entry_earthquake_risk_level">${earthquake1}</label>
		</div>
		<div>
		  <p class="modalText" id="entry_earthquake_desc">${earthquake2}</p>
		</div>
		<div class="modalLine">
		  <label class="modalLabel">Fire</label>
		  <label class="modalLabel" id="entry_fire_risk_level">${fire1}</label>
		</div>
		<div>
		  <p class="modalText" id="entry_fire_desc">${fire2}</p>
		</div>
		<div class="modalLine">
		  <label class="modalLabel">Flood</label>
		  <label class="modalLabel" id="entry_flood_risk_level">${flood1}</label>
		</div>
		<div>
		  <p class="modalText" id="entry_flood_desc">${flood2}</p>
		</div>
		<div class="modalLine">
		  <label class="modalLabel">Landslide</label>
		  <label class="modalLabel" id="entry_landslide_risk_level">${landslide1}</label>
		</div>
		<div>
		  <p class="modalText" id="entry_landslide_desc">${landslide2}</p>
		</div>
		<div class="modalLine">
		  <label class="modalLabel">Storm</label>
		  <label class="modalLabel" id="entry_storm_risk_level">${storm1}</label>
		</div>
		<div>
		  <p class="modalText" id="entry_storm_desc">${storm2}</p>
		</div>
	  </div>
	<button type="button" class="collapsible">Residents</button>
	  <div class="colContent" style="display: block;">
		<br>
		<div class="modalLine">
		  <label class="modalLabel">Total</label>
		  <label class="modalLabel" id="entry_number_of_residents">${partner.number_residents}</label>
		</div>
		<hr style="border-top: 1px solid #CBD5E0; margin-top:10px;">
		<div class="modalLine" style="margin-top: 10px;">
		  <label class="modalLabel">Minors</label>
		  <label class="modalLabel" id="entry_number_of_minor_residents">${partner.number_minors}</label>
		</div>
		<br>
		<div class="modalLine">
		  <label class="modalLabel">Adults</label>
		  <label class="modalLabel" id="entry_number_of_adult_residents">${partner.number_adult}</label>
		</div>
		<br>
		<div class="modalLine">
		  <label class="modalLabel">Seniors</label>
		  <label class="modalLabel" id="entry_number_of_senior_residents">${partner.number_seniors}</label>
		</div>
		<br>
		<div class="modalLine">
		  <label class="modalLabel">PWD</label>
		  <label class="modalLabel" id="entry_number_of_pwd_residents">${partner.number_pwd}</label>
		</div>
		<br>
		<div class="modalLine">
		  <label class="modalLabel">Sick</label>
		  <label class="modalLabel" id="entry_number_of_sick_residents">${partner.number_sick}</label>
		</div>
		<br>
		<div class="modalLine">
		  <label class="modalLabel" >Pregnant</label>
		  <label class="modalLabel" id="entry_number_of_pregnant_residents">${partner.number_pregnant}</label>
		</div>
		<br>
	  </div>
  `;

  // styling
  nameDiv.classList.add("modal-name");

  // Set the content of each div
  nameDiv.textContent = partner.household_name;
  partnerContentDiv.innerHTML = partner_content;

  // Append the div elements to the modal content
  modalHeader.appendChild(nameDiv);
  modalContent.appendChild(partnerContentDiv);

  var coll = document.getElementsByClassName("collapsible");
	var i;

	for (i = 0; i < coll.length; i++) {
	  coll[i].addEventListener("click", function() {
		this.classList.toggle("active");
		var colContent = this.nextElementSibling;
		if (colContent.style.display === "block") {
		  colContent.style.display = "none";
		  coll.style.transform = "none";
		} else {
		  colContent.style.display = "block";
		  coll.style.transform = "rotate(180deg)";
		}
	  });
	}

  // Show the modal
  modal.style.display = 'block';

  // Close the modal when the close button is clicked
  const closeButton = document.getElementsByClassName('close')[0];
  closeButton.addEventListener('click', () => {
	modal.style.display = 'none';
  });

  // Close the modal when the user clicks outside of it
  window.addEventListener('click', (event) => {
	if (event.target == modal) {
	  modal.style.display = 'none';
	}
  });

  //script for edit household modal

  // modal
  var editFormModal = document.getElementById('editModal');

  // open modal
  var openEditForm = document.getElementById('editHousehold');

  // Get the <span> element that closes the modal
  var closeEditForm = document.getElementById('close-btn');

  // When the user clicks the button, open the modal
  if(openEditForm) {
	openEditForm.onclick = function () {
	  editFormModal.style.display = 'block';
	  modal.style.display = 'none';
	  populateEditForm(partner, editFormModal)
	};
  }

  // When the user clicks on <span> (x), close the modal
  if(closeEditForm) {
	closeEditForm.onclick = function () {
	  editFormModal.style.display = 'none';
	};
  }
}

export function addEntry(data) {
  data.forEach((entry) => {
	addDoc(colRef, entry)
	  .then((docRef) => {
		console.log('Document written with ID: ', docRef.id);
	  })
	  .catch((error) => {
		console.error('Error adding document: ', error);
	  });
  });
}

export function populateEditForm(partner, editFormModal) {
  console.log("populating form");
  var iframe = editFormModal.getElementsByClassName('formIframe')[0]
  var editForm = iframe.contentWindow.document
  for (var data in partner) {
	// console.log(data.toString()+ " '" + partner[data] + "'")
	// console.log(partner[data])``

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

export function submitForm(){
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
  
  validate_errors = validateData(collection_value,collated_input);
  
  if (validate_errors.length > 0){
	console.log("failed vaildation");
	alert("Error in validating values. Check console for errors present");
	for(var i in validate_errors){
	  console.log(validate_errors[i]);
	}
  }
  else{
	console.log("passed validation");
	//var householdID = getDocIdByPartnerName(collated_input['household_name']);
	const waitForPromise = async() => {
	  const householdID = await getDocIdByPartnerName(collated_input['household_name']);
	  editEntry(collated_input,householdID);
	}
	waitForPromise();
  }
 }
  // TODO:
  // get docID via  getDocIdByPartnerName/getDocByID
  // then call editEntry(inp_obj, docId), inp_obj is collated_input, docID is gotten from getDocIdByPartnerName/getDocByID
  // so basically editEntry(collated_input, docID via  getDocIdByPartnerName/getDocByID)
  /*
  const partnerName = document.getElementById("household_name").value;
  getDocIdByPartnerName(partnerName)
  .then((docId) => {
	if (docId) {
	  // If a matching docId is found, proceed with updating the document
	  const name = partnerName;
	  const address = document.getElementById("household_address").value;
	  const phase = document.getElementById("household_phase").value;
	  const contactNum = document.getElementById("contact_number").value;
	  const residencyStatus = document.getElementById("residency_status").value;
	  const membership = document.getElementById("is_hoa_noa").value;
	  const locationLink = document.getElementById("location_link").value;
	  const locationCoordinates = document.getElementById("location_coordinates").value;
	  const householdMat = document.getElementById("household_material").value;
	  const nearestEvac = document.getElementById("nearest_evac").value;
	  const status = document.getElementById("status").value;
	  const residentNum = document.getElementById("number_residents").value;
	  const adultNum = document.getElementById("number_adults").value;
	  const minorNum = document.getElementById("number_minors").value;
	  const seniorNum = document.getElementById("number_seniors").value;
	  const pwdNum = document.getElementById("number_pwd").value;
	  const sickNum = document.getElementById("number_sick").value;
	  const sickType = document.getElementById("sickness_present").value;
	  const pregnantNum = document.getElementById("number_pregnant").value;
	  const earthquake = document.getElementById("earthquake").value;
	  const earthquakeRisk = document.getElementById("earthquake_risk").value;
	  const fire = document.getElementById("fire").value;
	  const fireRisk = document.getElementById("fire_risk").value;
	  const flood = document.getElementById("flood").value;
	  const floodRisk = document.getElementById("flood_risk").value;
	  const landslide = document.getElementById("landslide").value;
	  const landslideRisk = document.getElementById("landslide_risk").value;
	  const storm = document.getElementById("storm").value;
	  const stormRisk = document.getElementById("storm_risk").value;                   
	  
	  
	  
	  const name = partnerName;
	  const activity = document.getElementById("nature_of_act").value;
	  const admuContact = document.getElementById("ateneo_contact-person").value;
	  const admuEmail = document.getElementById("ateneo_contact-email").value;
	  const admuOffice = document.getElementById("ateneo_office").value;
	  const org = document.getElementById("organization").value;
	  const partnerContact = document.getElementById("partner_contact-person").value;
	  const dates = document.getElementById("dates_of_partnership").value;
	  
	  
	  editEntry(collated_input, docId);
	  }
	  else {
		// Handle case when no matching document is found
	  alert("No matching document found for the partner name: " + partnerName);
	  }
	  });*/

// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

var col_ref = null;
col_ref = getCollection();

var partners = {}; // queried
var activities = {};

var addForm_geopoint;
var has_existing_partner = false;

// This pans to the Philippines
map.setView(new L.LatLng(14.651, 121.052), 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution:
		'&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var searchControl = L.esri.Geocoding.geosearch().addTo(map);

var results = L.layerGroup().addTo(map);
var popup = L.popup();

function onMapClick(e) {
	const lat = e.latlng.lat;
	const lng = e.latlng.lng;

	// This is the popup for when the user clicks on a random spot on the map
	var popupContent = `
     <div class="partner-geolocation">
       
           Latitude: ${lat} <br> Longitude: ${lng}
       </div>
   <button class="addButton" data-lat="${lat}" data-lng="${lng}">Add Location</button>
 `;

	popup.setLatLng(e.latlng).setContent(popupContent).openOn(map);

	// This addButton is from the mini popup
	var addButton = document.querySelector('.addButton');
	addButton.addEventListener('click', function () {
		// show mainmodal from pop up "add location"
		addForm_geopoint = new GeoPoint(lat, lng);
		showMainModal();
		populateMainModalList();
	});
}

map.on('click', onMapClick);

// add activity from the main modal
const mainModalDocument =
	document.getElementById('mainModalIframe').contentDocument;
const newButton = mainModalDocument.getElementById('addModalButton');

newButton.addEventListener('click', () => {
	// Get the Add Activity form and the needed input fields for autofill
	var inputtedPartnerName = mainModalDocument.getElementById(
		'inputted_partner_name'
	).value;
	var inputtedPartnrAddress =
		mainModalDocument.getElementById('address-input').value;
	has_existing_partner = false;

	if (inputtedPartnerName == '' || inputtedPartnrAddress == '') {
		alert('Partner Name and Partner Address cannot be blank.');
	} else {
		for (let field of SDECE_RULES[2]) {
			if (field != 'partner_coordinates') {
				if (field == 'partner_name' || field == 'partner_address') {
					if (field == 'partner_name') {
						addFormiframeDocument.getElementById(
							field
						).value = inputtedPartnerName;
					} else if (field == 'partner_address') {
						addFormiframeDocument.getElementById(
							field
						).value = inputtedPartnrAddress;
					}
					addFormiframeDocument.getElementById(
						field
					).readOnly = true;
					addFormiframeDocument.getElementById(
						field
					).style.backgroundColor = 'var(--custom-medium-gray';
					addFormiframeDocument.getElementById(
						field
					).style.color = 'var(--custom-dark-gray';
				} else {
					addFormiframeDocument.getElementById(field).value =
						null;
					addFormiframeDocument.getElementById(
						field
					).readOnly = false;
				}
			} else {
			}
		}
		showAddModal();
	}

	// Set autofill or reset field
});

//If activity name is empty, used activity nature	
function getActivity(activity) {
	const name = activity['activity_name'];
	const nature = activity['activity_nature'];

	if (!name || name.trim() === '') {
		return nature;
	}
	return name;
}

function clearAllHighlights() {
	const sidebarItems = document.querySelectorAll('.partnerDiv');
	sidebarItems.forEach((item) => {
		item.classList.remove('highlight');
	});
}

getDocs(col_ref)
	.then((querySnapshot) => {
		// Populate activities
		querySnapshot.forEach((doc) => {
			if (
				doc.data().name !== 'Test 2' ||
				doc.data().name !== 'Test2'
			) {
				let activity = doc.data();
				activity['identifier'] = doc.id;
				activities[doc.id] = activity;
			}
		});

		//  Populate with partners
		Object.keys(activities).forEach((activity) => {
			let partner = activities[activity][SDECE_RULES[1]];
			if (partners[partner] == null) {
				partners[partner] = [];
				partners[partner].push(activities[activity]);
			} else {
				partners[partner].push(activities[activity]);
			}
		});

		// Populate side navigation <ul> with partners
		Object.keys(partners).forEach((partner) => {
			// Trying to add the pins here instead
			var marker;

			// Some coordinated are null, protective check
			if (partners[partner][0]['partner_coordinates'] != null) {
				marker = L.marker([
					parseFloat(
						partners[partner][0]['partner_coordinates']
							.latitude
					),
					parseFloat(
						partners[partner][0]['partner_coordinates']
							.longitude
					),
				]);

				results.addLayer(marker);
				var popupContent = `
					<div class="partner-popup" id="`;
				popupContent += partners[partner][0]['partner_name'];
				popupContent += `">`;
				popupContent += partners[partner][0]['partner_name'];
				popupContent += `</div>`;

				marker.bindPopup(popupContent);
				results.addLayer(marker);

				marker.on('mouseover', function () {
					marker.openPopup();

					var test = document.getElementById(
						partners[partner][0]['partner_name']
					);
				});

				marker.on('click', function () {
					map.panTo(
					new L.LatLng(
						parseFloat(
							partners[partner][0]['partner_coordinates']
								.latitude
						),
						parseFloat(
							partners[partner][0]['partner_coordinates']
								.longitude
						)
					)
				);

					clearAllHighlights();

					const sidebarItems = document.querySelectorAll('.partnerDiv');
					sidebarItems.forEach((item) => {
						const nameDiv = item.querySelector('.name');
						if (nameDiv && nameDiv.textContent === partner) {
							item.scrollIntoView({ behavior: 'smooth', block: 'center' });
							item.classList.add('highlight');
						}
					});
					showModal(partners[partner]);
				});
			}

			const containerDiv = document.createElement('div');
			const img = document.createElement('svg');
			const listItem = document.createElement('li');
			const anchor = document.createElement('a');
			const nameDiv = document.createElement('div');
			const addressDiv = document.createElement('div');
			const activityDiv = document.createElement('div');
			const sidebarItems = document.querySelectorAll('.partnerDiv');

			containerDiv.addEventListener('click', function () {
				marker.openPopup();
				map.panTo(
					new L.LatLng(
						parseFloat(partners[partner][0]['partner_coordinates'].latitude),
						parseFloat(partners[partner][0]['partner_coordinates'].longitude)
					)
				);

				clearAllHighlights();

				containerDiv.classList.add('highlight');

				showModal(partners[partner]);
			});

			// Adding classes and setting text content

			containerDiv.classList.add('partnerDiv');

			//   var activities = getDocIdByPartnerName(partner.partner_name);
			if (Object.keys(activities).length > 0) {
				// check if list of activities is present, otherwise is skipped to avoid errors
				Object.keys(activities).forEach((activity) => {
					activityDiv.innerHTML +=
						getActivity + '<br/>'; // there might be a better way to display multiple activities
				});
			}

			nameDiv.classList.add('name');
			addressDiv.classList.add('address');
			activityDiv.classList.add('activity');

			nameDiv.textContent = partner;
			addressDiv.textContent = partners[partner][0]['partner_address'];

			let activities_string = '';

			for (let activity of partners[partner]) {
				activities_string += getActivity(activity)+ '<br>';
			}

			activityDiv.innerHTML = activities_string;

			listItem.classList.add('accordion');
			// Append elements to the DOM
			anchor.appendChild(nameDiv);
			anchor.appendChild(addressDiv);
			anchor.appendChild(activityDiv);

			listItem.appendChild(anchor);
			containerDiv.appendChild(img);
			containerDiv.appendChild(listItem);
			locationList.appendChild(containerDiv);
		});
	})
	.catch((error) => {
		console.error('Error getting documents: ', error);
	});

var current_viewed_activity = null; //docId of the currently viewed activity

// Display partner modal by clicking partner entry
export function showModal(partner) {
	document.querySelector('.modal-button').style.display = 'none';
	document.querySelector('.modal-button').style.padding = '0px';

	const modal = document.getElementById('partnerModal');
	const modalHeader = document.getElementById('modalHeader');
	const modalContent = document.getElementById('modalContent');

	modalHeader.style.width = '100%';
	modalHeader.style.display = 'flex';
	modalHeader.style.flexDirection = 'row';
	modalHeader.style.justifyContent = 'space-between';
	modalHeader.style.alignItems = 'center';

	// Clear previous content
	modalHeader.innerHTML = '';
	modalContent.innerHTML = '';

	// Create div elements for each piece of information
	const backarrowDiv = document.createElement('div');
	const closeDiv = document.createElement('div');
	const nameDiv = document.createElement('div');
	const addressDiv = document.createElement('div');
	const activityHeaderDiv = document.createElement('div');
	const activityDiv = document.createElement('div');
	const admuContactDiv = document.createElement('div');
	const admuEmailDiv = document.createElement('div');
	const admuOfficeDiv = document.createElement('div');
	const orgDiv = document.createElement('div');
	// const datesDiv = document.createElement('div');
	// const contactPersonDiv = document.createElement('div');

	nameDiv.classList.add('modal-name');
	addressDiv.classList.add('modal-address');

	// Set the content of each div
	backarrowDiv.innerHTML =
		'<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#currentColor" transform="matrix(-1, 0, 0, -1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="2"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z" fill="currentColor"></path></g></svg>';

	backarrowDiv.classList.add('back-btn');

	backarrowDiv.addEventListener('click', () => {
		current_viewed_activity = null;
		document.querySelector('.modal-button').style.display = 'none';
		document.querySelector('.modal-button').style.padding = '0px';

		modalHeader.innerHTML = '';
		modalContent.innerHTML = '';

		// Append the div elements to the modal content

		modalHeader.appendChild(nameDiv);
		modalHeader.appendChild(closeDiv);

		modalContent.appendChild(addressDiv);
		modalContent.appendChild(activityHeaderDiv);
		modalContent.appendChild(activityDiv);
	});

	closeDiv.innerHTML =
		'<svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#currentColor"><path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="currentColor"></path></svg>';
	closeDiv.classList.add('close-btn');
	// Close the modal when the close button is clicked
	closeDiv.addEventListener('click', () => {
		current_viewed_activity = null;
		clearAllHighlights();
		//might be better to put this in its own function
		modal.style.display = 'none';
		modal.classList.remove('open'); //transition out
	});

	nameDiv.textContent = partner[0].partner_name;
	addressDiv.textContent =
		'Latitude, Longitude: ' +
		partner[0].partner_coordinates._lat +
		', ' +
		partner[0].partner_coordinates._long;

	// Activities header with add activity button
	activityHeaderDiv.innerHTML = 'List of activities: ';
	const addActivity = document.createElement('button');
	addActivity.innerHTML =
		'<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 12H20M12 4V20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
	addActivity.classList.add('plus-btn');

	// Add button for adding activities
	addActivity.addEventListener('click', () => {
		has_existing_partner = true;
		addForm_geopoint = new GeoPoint(
			partner[0].partner_coordinates._lat,
			partner[0].partner_coordinates._long
		);
		// show the addLoc.html with some autofilled values
		var modal = document.getElementById('addModal');

		// Display the modal
		modal.style.display = 'flex';
		// populate the field with current partner values
		document
			.getElementById('addModalHTML')
			.contentWindow.document.getElementById('partner_name').value =
			partner[0].partner_name;

		document
			.getElementById('addModalHTML')
			.contentWindow.document.getElementById(
				'partner_name'
			).readOnly = true;

		document
			.getElementById('addModalHTML')
			.contentWindow.document.getElementById(
				'partner_name'
			).style.backgroundColor = 'var(--custom-medium-gray';

		document
			.getElementById('addModalHTML')
			.contentWindow.document.getElementById('partner_address').value =
			partner[0].partner_address;

		document
			.getElementById('addModalHTML')
			.contentWindow.document.getElementById(
				'partner_address'
			).readOnly = true;

		document
			.getElementById('addModalHTML')
			.contentWindow.document.getElementById(
				'partner_address'
			).style.backgroundColor = 'var(--custom-medium-gray';

		document
			.getElementById('addModalHTML')
			.contentWindow.document.getElementById(
				'partner_address'
			).style.color = 'var(--custom-dark-gray';

		document
			.getElementById('addModalHTML')
			.contentWindow.document.getElementById(
				'partner_name'
			).style.color = 'var(--custom-dark-gray';

		// Close the Add Activity modal when the user clicks anywhere outside of it
		// window.onclick = function (event) {
		// 	if (event.target == modal) {
		// 		modal.style.display = 'none';
		// 	}
		// };
	});

	activityHeaderDiv.appendChild(addActivity);
	activityHeaderDiv.classList.add('modal-activities-header');

	// Add each activity to the modal content
	if (partner.length > 0) {
		// check if list of activities is present, otherwise is skipped to avoid errors
		partner.forEach((activity) => {
			// View activity details button
			const activityButton = document.createElement('div');
			const activityTitle = document.createElement('button');

			activityTitle.classList.add('modal-activity-title');
			activityButton.classList.add('modal-activity-button');

			const activityName = document.createElement('div');
			const arrow = document.createElement('div');
			arrow.classList.add('arrow');
			const office = document.createElement('div');
			office.classList.add('modal-office');

			activityName.textContent = getActivity(activity) + '';
			arrow.innerHTML =
				'<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#currentColor"><g id="SVGRepo_bgCarrier" stroke-width="2"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z" fill="currentColor"></path></g></svg>';
			office.innerHTML = activity.ADMU_office;

			activityTitle.appendChild(activityName);
			activityTitle.appendChild(arrow);
			activityButton.appendChild(activityTitle);
			activityButton.appendChild(office);

			// Set div content for activity details

			const activityNameDiv = document.createElement('div');
			const activityAddressDiv = document.createElement('div');
			const activityContactDiv = document.createElement('div');
			const activityOrganizationDiv = document.createElement('div');
			const activityDatesDiv = document.createElement('div');
			const activityOfficeDiv = document.createElement('div');

			activityNameDiv.innerHTML = getActivity(activity) + '';
			activityNameDiv.classList.add('modal-activities-header');
			activityAddressDiv.innerHTML = activity.partner_address;
			activityAddressDiv.classList.add('modal-address');

			activityContactDiv.innerHTML =
				'<b>Contact</b>' +
				'<p class="pm-detailed-info">' +
				activity.partner_contact_name +
				'</p>' +
				'<p class="pm-detailed-info">' +
				activity.partner_email +
				'</p>';
			activityOrganizationDiv.innerHTML =
				'<b>Organization/Unit</b>' +
				'<p class="pm-detailed-info">' +
				activity.organization_unit +
				'</p>';
			activityDatesDiv.innerHTML =
				'<b>Date/s of Partnership</b>' +
				'<p class="pm-detailed-info">' +
				activity.activity_date +
				'</p>'; //this field might become an array in the future

			activityOfficeDiv.innerHTML =
				'<b class="ao-header">Ateneo Office Oversight</b>' +
				'<p class="ao-office">' +
				activity.ADMU_office +
				'</p>' +
				'<p class="ao-details">' +
				activity.ADMU_contact_name +
				'</p>' +
				'<p class="ao-details">' +
				activity.ADMU_email +
				'</p>';

			// Executed when the user clicks on an activity listed in the Partner Modal
			activityButton.addEventListener('click', () => {
				current_viewed_activity = activity;
				document.querySelector('.modal-button').style.display =
					'flex';
				modalHeader.innerHTML = '';
				modalContent.innerHTML = '';

				// Header
				modalHeader.appendChild(backarrowDiv);
				modalHeader.appendChild(nameDiv);
				modalHeader.appendChild(closeDiv);

				// Content

				// Resetting class list to override styles
				activityNameDiv.classList = '';
				activityAddressDiv.classList = '';

				activityNameDiv.classList.add('pm-activity-name');
				modalContent.appendChild(activityNameDiv);

				activityAddressDiv.classList.add('pm-activity-address');
				modalContent.appendChild(activityAddressDiv);

				activityContactDiv.classList.add('pm-details');
				modalContent.appendChild(activityContactDiv);

				activityOrganizationDiv.classList.add('pm-details');
				modalContent.appendChild(activityOrganizationDiv);

				activityDatesDiv.classList.add('pm-details');
				modalContent.appendChild(activityDatesDiv);

				activityOfficeDiv.classList.add('pm-activity-office');
				modalContent.appendChild(activityOfficeDiv);
			});

			activityDiv.appendChild(activityButton);
		});
	}

	activityDiv.classList.add('modal-activities-list');

	admuContactDiv.innerHTML = '<b>AdMU Contact: </b>' + partner.ADMU_contact;
	admuEmailDiv.innerHTML = '<b>AdMU Email: </b>' + partner.ADMU_email;
	admuOfficeDiv.innerHTML = '<b>AdMU Office: </b>' + partner.ADMU_office;
	orgDiv.innerHTML = '<b>Organization: </b>' + partner.organization_unit;

	// Append the div elements to the modal content

	// NOTE: This is where every partner modal content is added
	modalHeader.appendChild(nameDiv);
	modalHeader.appendChild(closeDiv);
	// TODO: Implement the close button in index.html lang.

	modalContent.appendChild(addressDiv);
	modalContent.appendChild(activityHeaderDiv);
	modalContent.appendChild(activityDiv);

	// Show the partner modal
	modal.style.display = 'flex';
	modal.classList.add('open'); //transition in

	// Close the modal when the user clicks outside of it
	window.addEventListener('click', (event) => {
		if (event.target == modal) {
			modal.classList.remove('open'); //transition out
			modal.style.display = 'none';
			current_viewed_activity = null;
		}
	});

	var editButtons = document.getElementsByClassName('edit-button');

	for (var i = 0; i < editButtons.length; i++) {
		editButtons[i].addEventListener('click', function () {
			if (current_viewed_activity != null) {
				// Select the modal and partnerName elements
				var modal = document.getElementById('editModal');

				var partnerModal = document.getElementById('partnerModal');

				// Display the modal
				modal.style.display = 'flex';
				// partnerModal.classList.add('hidden'); // Not sure if this should be hidden nalang, or should be kept open with the editModal on top nalang

				//autofill existing values inside the modal
				SDECE_RULES[2].forEach((field) => {
					let current_inp = document
						.getElementById('editModal_iframe')
						.contentWindow.document.getElementById(field);
					if (current_inp != null) {
						current_inp.value =
							current_viewed_activity[field];
					}
				});
				// Close the modal when the user clicks anywhere outside of it
				// window.onclick = function (event) {
				// 	if (event.target == modal) {
				// 		modal.style.display = 'none';
				// 	}
				// };
			}
		});
	}
}

// This is unreliable but will probably be useful in the future
// export async function getCoordsFromAddress(address = '161 Daan Tubo, Diliman, Quezon City') {

// 	var parsed_loc = encodeURIComponent(
// 		address.toLowerCase().replace(/[^a-z0-9 _-]+/gi, '-')
// 	);
// 	var api_search = 'https://nominatim.openstreetmap.org/search?q=';
// 	var link = api_search.concat(parsed_loc).concat('&format=json');

// 	var response = await fetch(link);
// 	var jsonified = await response.json();

// 	if (addForm_geopoint == null) {
// 		addForm_geopoint = new GeoPoint(
// 			jsonified[0]['lat'],
// 			jsonified[0]['lon']
// 		);
// 	} else {
// 	}

//values stored in local before uploading them in batches
var temp_activities = {};
var temp_activities_id = 0;

// Addloc.html Save button click listener
var addFormiframe = document.getElementById('addModalHTML');
var addFormiframeDocument = addFormiframe.contentWindow.document;
var addFormSubmitButton = addFormiframeDocument.getElementById('submit_form');
addFormSubmitButton.addEventListener('click', function () {
	//handleAdd
	//get data from addloc.html
	var info_from_forms = {};
	for (let field of SDECE_RULES[2]) {
		if (field != 'partner_coordinates') {
			let inp_field = addFormiframeDocument.getElementById(field);
			if (inp_field != null) {
				if (inp_field.value == '') {
					info_from_forms[field] = null;
				} else {
					info_from_forms[field] = inp_field.value;
				}
			}
		} else {
			info_from_forms[field] = addForm_geopoint;
		}
	}

	//validate the collated input here
	let errors = validateData('sdece-official-TEST', info_from_forms);

	if (errors.length > 0) {
		displayErrors(errors);
		event.preventDefault();
	} else {
		if (has_existing_partner) {
			//upload it straight to the firebase db
			if (
				typeof info_from_forms.activity_date === 'string' &&
				!isNaN(Date.parse(info_from_forms.activity_date))
			) {
				const parsedDate = new Date(info_from_forms.activity_date);
				parsedDate.setHours(0, 0, 0, 0);
				info_from_forms.activity_date = Timestamp.fromDate(new Date(info_from_forms.activity_date));
			}
			addEntry(info_from_forms);
			// alert(
			// 	'Reload the page for the new additions to reflect on your browser'
			// );
		} else {
			//locally store it
			temp_activities[temp_activities_id + ''] = info_from_forms;
			temp_activities_id += 1;

			populateMainModalList();

			// add it to the ul
			// mainModalDocument.getElementById(
			// 	'mainModalActivityList'
			// ).innerHTML +=
			// 	'<li class="main-modal-temporary-activity">' +
			// 	info_from_forms['activity_nature'] +
			// 	'</li>';
		}

		// close the save modal
		addFormiframeDocument.style.display = 'none';
	}

	function displayErrors(errors) {
		let errorDiv = addFormiframeDocument.getElementById('error_messages');

		if (errorDiv) {
			errorDiv.innerHTML = '';

			if (errors.length > 0) {
				for (let error of errors) {
					let errorParagraph =
						addFormiframeDocument.createElement('p');
					errorParagraph.textContent = error;
					errorDiv.appendChild(errorParagraph);
				}

				// Scroll the document back to the top
				errorDiv.ownerDocument.defaultView.scrollTo(0, 0);
			} else {
				console.error(
					"Error: Couldn't find element with ID 'error_messages'."
				);
			}
		}
	}
});

// Editloc.html Save button click listener
let edit_modal =
	document.getElementById('editModal_iframe').contentWindow.document;
edit_modal.getElementById('submit_form').addEventListener('click', handleEdit);

export function handleEdit() {
	var collated_inp = {};
	for (let field of SDECE_RULES[2]) {
		if (field != 'partner_coordinates') {
			let inp_field = edit_modal.getElementById(field);
			if (inp_field != null) {
				if (inp_field.value == '') {
					collated_inp[field] = null;
				} else {
					collated_inp[field] = inp_field.value;
				}
			}
		} else {
			collated_inp[field] =
				current_viewed_activity['partner_coordinates'];
		}
	}

	//validate the collated input here
	let errors = validateData('sdece-official-TEST', collated_inp);

	if (errors.length > 0) {
		displayErrors(errors);
		event.preventDefault();
	} else {
		if (
			typeof collated_inp.activity_date === 'string' &&
			!isNaN(Date.parse(collated_inp.activity_date))
		) {
			const dateOnly = new Date(collated_inp.activity_date);
			dateOnly.setHours(0, 0, 0, 0);
			collated_inp.activity_date = Timestamp.fromDate(dateOnly);
		}
		editEntry(collated_inp, current_viewed_activity['identifier']);
		document.getElementById('editModal').style = "display: 'none'";
		//alert('Reload the page for the new edits to reflect on your browser');
	}

	function displayErrors(errors) {
		let errorDiv = edit_modal.getElementById('error_messages');

		if (errorDiv) {
			errorDiv.innerHTML = '';

			if (errors.length > 0) {
				for (let error of errors) {
					let errorParagraph = edit_modal.createElement('p');
					errorParagraph.textContent = error;
					errorDiv.appendChild(errorParagraph);
				}
				errorDiv.ownerDocument.defaultView.scrollTo(0, 0);
			} else {
				console.error(
					"Error: Couldn't find element with ID 'error_messages'."
				);
			}
		}
	}
}

// mainmodal save button for batch uploading
const MAIN_MODAL_SAVE_BUTTON =
	mainModalDocument.getElementsByClassName('main-modal-save')[0];

MAIN_MODAL_SAVE_BUTTON.addEventListener('click', function () {

	let temp_keys = Object.keys(temp_activities).length;

	if (temp_keys > 0) {
		Object.keys(temp_activities).forEach((temp_id) => {
			let current_temp_activity = temp_activities[temp_id];
			let new_partner_name = mainModalDocument.getElementsByClassName(
				'main-modal-partner-name'
			)[0].value;
			let new_partner_address =
				mainModalDocument.getElementById('address-input').value;
			current_temp_activity['partner_name'] = new_partner_name;
			current_temp_activity['partner_address'] = new_partner_address;
			if (
				typeof current_temp_activity.activity_date === 'string' &&
				!isNaN(Date.parse(current_temp_activity.activity_date))
			) {
				const dateOnly = new Date(current_temp_activity.activity_date);
				dateOnly.setHours(0, 0, 0, 0);
				current_temp_activity.activity_date = Timestamp.fromDate(dateOnly);
			}
			addEntry(current_temp_activity);
		});

		// Notify parent window (where the iframe is embedded)
		window.parent.postMessage({ type: 'mainModalFormSuccess' }, '*');

		//Auto close modal
		window.parent.postMessage('closeMainModal', '*');

		//Clear input partner name and address
		mainModalDocument.getElementById('inputted_partner_name').value = '';
		mainModalDocument.getElementById('address-input').value = '';

		//clear temp_activities
		temp_activities = {};

		// alert(
		// 	'Reload the page for the new additions to reflect on your browser'
		// );
	} else {
		alert("Can't submit a partner with an empty list of activities ");
	}
});

// Handling main modal close on clicking close button

const mainModalCloseButton = mainModalDocument.getElementById('close-btn');

mainModalCloseButton.addEventListener('click', function (event) {
	if (confirm('Closing may lead to unsaved data being deleted, proceed?')) {
		event.preventDefault();

		// Clear temp_activities
		temp_activities = {};

		// Call the resetForm method in the document's script tag
		if (typeof mainModalDocument.defaultView.resetForm === 'function') {
			mainModalDocument.defaultView.resetForm();
		} else {
			console.error(
				"resetForm function is not defined in the document's script tag."
			);
		}

		window.parent.postMessage('closeMainModal', '*');
	} else {
		event.preventDefault();
	}
});

export function populateMainModalList() {
	// display temporarily saved activities to main modal

	const mainModalActivityList = mainModalDocument.getElementById(
		'mainModalActivityList'
	);
	mainModalActivityList.innerHTML = '';

	if (Object.keys(temp_activities).length == 0) {
		mainModalActivityList.innerHTML = '<p> No activities to show </p>';
	} else {
		for (let i = 0; i < Object.keys(temp_activities).length; i++) {
			var activity = temp_activities[Object.keys(temp_activities)[i]];

			// View activity details button
			const activityButton = document.createElement('li');
			const activityName = document.createElement('div');
			const arrow = document.createElement('div');

			activityName.textContent = getActivity(activity) + '';

			arrow.innerHTML =
				'<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#currentColor"><g id="SVGRepo_bgCarrier" stroke-width="2"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z" fill="currentColor"></path></g></svg>';
			arrow.classList.add('arrow');

			activityButton.appendChild(activityName);
			activityButton.classList.add('main-modal-temporary-activity');
			mainModalActivityList.appendChild(activityButton);
		}
	}
}
