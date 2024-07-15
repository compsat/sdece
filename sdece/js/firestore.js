// FIRESTORE DATABASE

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
	SDECE_RULES,
	SDECE_RULES_TEST,
	getDocIdByPartnerName,
	validateData,
} from '/firestore_UNIV.js';
import { addListeners, map, getDivContent } from '/index_UNIV.js';
import { showMainModal, showAddModal } from './index.js';
import { addEntry } from '../../firestore_UNIV.js';
import { editEntry } from '../../firestore_UNIV.js';
// Your Firestore code here

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
		console.log('main modal called from popup');
		addForm_geopoint = new GeoPoint(lat, lng);
		console.log('currently adding coords: ', addForm_geopoint);
		showMainModal();
	});
}

map.on('click', onMapClick);

// add activity from the main modal
const mainModalDocument =
	document.getElementById('mainModalIframe').contentDocument;
console.log(document.getElementById('mainModalIframe'));
const newButton = mainModalDocument.getElementById('addModalButton');
newButton.addEventListener('click', () => {
	has_existing_partner = false;
	//reset the values and format of addLoc.html
	for (let field of SDECE_RULES[2]){
		if (field != "partner_coordinates"){
			if (field == "partner_name" || field == "partner_address"){
				addFormiframeDocument.getElementById(field).value = null;
				addFormiframeDocument.getElementById(field).readOnly = true;
			} else {
				addFormiframeDocument.getElementById(field).value = null;
				addFormiframeDocument.getElementById(field).readOnly = false;
				//palagay dito yung default format ty. Yung style.color
			}
		} else {
		}
	}
	showAddModal();
});

getDocs(col_ref)
	.then((querySnapshot) => {
		// Populate activities
		querySnapshot.forEach((doc) => {
			if (
				doc.data().name !== 'Test 2' ||
				doc.data().name !== 'Test2'
			) {
				let activity = doc.data();
				activity["identifier"] = doc.id;
				activities[doc.id] = activity;
			}
		});

		//  Populate with partners
		Object.keys(activities).forEach((activity) => {
			let partner = activities[activity][SDECE_RULES[1]];
			console.log(activities[activity]["partner_name"]);
			if (partners[partner] == null) {
				partners[partner] = [];
				partners[partner].push(activities[activity]);
			} else {
				partners[partner].push(activities[activity]);
			}
		});

		console.log("Activities: ", activities);
		console.log("Partners: ", partners);

		// Populate side navigation <ul> with partners
		Object.keys(partners).forEach((partner) => {
			// Trying to add the pins here instead
			var marker;

			// Some coordinated are null, protective check
			//console.log(partners[partner][0]['partner_coordinates']);
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

					console.log(
						'Clicked on ' +
							partners[partner][0]['partner_name'] +
							' pin!'
					);

					var test = document.getElementById(
						partners[partner][0]['partner_name']
					);
					test.addEventListener('click', function () {
						console.log(
							'Clicked on the pop-up content of ' +
								partners[partner][0]['partner_name']
						);
						showModal(partners[partner]);
					});
				});
			}
			
			const containerDiv = document.createElement('div');
			const img = document.createElement('svg');
			const listItem = document.createElement('li');
			const anchor = document.createElement('a');
			const nameDiv = document.createElement('div');
			const addressDiv = document.createElement('div');
			const activityDiv = document.createElement('div');

			containerDiv.addEventListener('click', function () {
				marker.openPopup();
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
				showModal(partners[partner]);
			});

			// Adding classes and setting text content

			containerDiv.classList.add('partnerDiv');

			//   var activities = getDocIdByPartnerName(partner.partner_name);
			if (Object.keys(activities).length > 0) {
				// check if list of activities is present, otherwise is skipped to avoid errors
				Object.keys(activities).forEach((activity) => {
					activityDiv.innerHTML +=
						activities[activity].activity_name + '<br/>'; // there might be a better way to display multiple activities
				});
			} else {
				console.log('No activities found');
			}

			nameDiv.classList.add('name');
			addressDiv.classList.add('address');
			activityDiv.classList.add('activity');

			nameDiv.textContent = partner;
			addressDiv.textContent = partners[partner][0]['partner_address'];

			let activities_string = '';

			for (let activity of partners[partner]) {
				activities_string += activity['activity_nature'] + '<br>';
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

// Display partner modal by clicking partner entry (WIP: and on pin pop up click)
export function showModal(partner) {
	document.querySelector('.edit-button').style.display = 'none';
	document.querySelector('.edit-button').style.padding = '0px';

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

	backarrowDiv.classList.add('close-btn');
	backarrowDiv.addEventListener('click', () => {
		current_viewed_activity = null;
		document.querySelector('.edit-button').style.display = 'none';
		document.querySelector('.edit-button').style.padding = '0px';

		modalHeader.innerHTML = '';
		modalContent.innerHTML = '';

		// Append the div elements to the modal content
		modalHeader.appendChild(nameDiv);
		modalHeader.appendChild(closeDiv);

		//modalContent.appendChild(addressDiv);
		modalContent.appendChild(activityHeaderDiv);
		modalContent.appendChild(activityDiv);
	});

	closeDiv.innerHTML =
		'<svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#currentColor"><path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="currentColor"></path></svg>';
	closeDiv.classList.add('close-btn');
	// Close the modal when the close button is clicked
	closeDiv.addEventListener('click', () => {
		current_viewed_activity = null;
		console.log('modal closed');

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
		console.log('Clicked add activity in the partner modal');
		has_existing_partner = true;
		addForm_geopoint = new GeoPoint(partner[0].partner_coordinates._lat, partner[0].partner_coordinates._long);
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
		window.onclick = function (event) {
			if (event.target == modal) {
				modal.style.display = 'none';
			}
		};
	});

	activityHeaderDiv.appendChild(addActivity);
	activityHeaderDiv.classList.add('modal-activities-header');

	// Add each activity to the modal content

	console.log(partner.length);
	if (partner.length > 0) {
		// check if list of activities is present, otherwise is skipped to avoid errors
		partner.forEach((activity) => {
			console.log(activity);
			// View activity details button
			const activityButton = document.createElement('div');
			const activityTitle = document.createElement('button');

			activityTitle.classList.add('modal-activity-title');
			activityButton.classList.add('modal-activity-button');

			const activityName = document.createElement('div');
			const arrow = document.createElement('div');
			arrow.classList.add('arrow');
			const office = document.createElement('div');
			office.classList.add('modal-address');

			activityName.textContent = activity.activity_nature + '';
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

			activityNameDiv.innerHTML = activity.activity_nature + '';
			activityNameDiv.classList.add('modal-activities-header');
			activityAddressDiv.innerHTML = activity.partner_address;
			activityAddressDiv.classList.add('modal-address');

			activityContactDiv.innerHTML =
				'<b>Contact</b> <br> ' +
				activity.partner_contact_name +
				'<br>' +
				activity.partner_email +
				'<br>';
			activityOrganizationDiv.innerHTML =
				'<b>Organization/Unit</b> <br>' +
				activity.organization_unit;
			activityDatesDiv.innerHTML =
				'<b>Date/s of Partnership</b> <br>' +
				activity.activity_date; //this field might become an array in the future

			activityOfficeDiv.innerHTML =
				"<hr> <br> <b class='modal-name' >Ateneo Office Oversight</b>" +
				"<p class='modal-activities-header'>" +
				activity.ADMU_office +
				'</p>' +
				'<p>' +
				activity.ADMU_contact_name +
				'</p>' +
				'<p>' +
				activity.ADMU_email +
				'</p>';

			// View activity details in modal after clicking activity
			activityButton.addEventListener('click', () => {
				current_viewed_activity = activity;
				console.log("currently looking at activity with ID: ", activity["identifier"]);
				document.querySelector('.edit-button').style.display =
					'flex';
				modalHeader.innerHTML = '';
				modalContent.innerHTML = '';

				modalHeader.appendChild(backarrowDiv);
				modalHeader.appendChild(nameDiv);
				modalHeader.appendChild(closeDiv);

				modalContent.appendChild(activityNameDiv);
				modalContent.appendChild(activityAddressDiv);
				modalContent.appendChild(activityContactDiv);
				modalContent.appendChild(activityOrganizationDiv);
				modalContent.appendChild(activityDatesDiv);
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
	modal.style.display = 'block';
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
			if(current_viewed_activity != null){
				console.log('Clicked edit currently editing activity with ID: ', current_viewed_activity["identifier"], current_viewed_activity);

				//Close activity details modal
	
				// Select the modal and partnerName elements
				var modal = document.getElementById('editModal');
	
				var partnerModal = document.getElementById('partnerModal');
	
				// Display the modal
				modal.style.display = 'flex';
				// partnerModal.classList.add('hidden'); // Not sure if this should be hidden nalang, or should be kept open with the editModal on top nalang

				//autofill existing values inside the modal
				SDECE_RULES[2].forEach((field) => {
					//console.log(field);
					let current_inp = document.getElementById("editModal_iframe").contentWindow.document.getElementById(field);
					if (current_inp != null){
						//console.log(current_inp);
						current_inp.value = current_viewed_activity[field];
					}
					
				});
				// Close the modal when the user clicks anywhere outside of it
				window.onclick = function (event) {
					if (event.target == modal) {
						modal.style.display = 'none';
					}
				};
			} else {
				console.log("Not looking at an activity");
			}
			
		});
	}
}

let edit_modal = document.getElementById("editModal_iframe").contentWindow.document;
edit_modal.getElementById("submit_form").addEventListener('click', handleEdit);

export function handleEdit(){
	var collated_inp = {};
	for( let field of SDECE_RULES[2]){
		if (field != "partner_coordinates"){
			let inp_field = edit_modal.getElementById(field);
			if(inp_field != null){
				if(inp_field.value == ""){
					collated_inp[field] = null;
				} else {
					collated_inp[field] = inp_field.value;
				}
			}
		} else {
			collated_inp[field] = current_viewed_activity["partner_coordinates"];
		} 
	}

	//validate the collated input here
	setCollection('sdece-official-TEST');

	console.log("EDITING VALIDATION IS HAPPENING?");
	for (let i = 0; i < SDECE_RULES_TEST[2].length; i++) {
		//SDECE_RULES_TEST[2] are just the field names of each document
		console.log(SDECE_RULES_TEST[2][i]);

		let fieldName = SDECE_RULES_TEST[2][i];

		if (fieldName == 'partner_coordinates') {
			collated_inp[fieldName] = current_viewed_activity["partner_coordinates"];
		} else {
			let inputValue = edit_modal.getElementById(fieldName).value;
			collated_inp[fieldName] = inputValue;
		}
	}
	console.log(collated_inp);
	console.log("Hello World");

	const errors = validateData('sdece-official-TEST', collated_inp);

	if (errors.length > 0) {
		displayErrors(errors);
		event.preventDefault();
	} else {
		editEntry(collated_inp, current_viewed_activity["identifier"]);
		console.log('Entry EDITED!');
	}

	function displayErrors(errors) {
		let errorDiv =
			edit_modal.getElementById('error_messages');

		if (errorDiv) {
			errorDiv.innerHTML = '';

			if (errors.length > 0) {
				for (let error of errors) {
					let errorParagraph =
						edit_modal.createElement('p');
					errorParagraph.textContent = error;
					errorDiv.appendChild(errorParagraph);
				}
			} else {
				console.error(
					"Error: Couldn't find element with ID 'error_messages'."
				);
			}
		}

	}
	console.log(collated_inp);

	

	console.log("Edits made to file with ID: ",current_viewed_activity);
	console.log("Here's the edited file: ", collated_inp);

	editEntry(collated_inp, current_viewed_activity["identifier"]);
}