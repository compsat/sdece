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
	getDocIdByPartnerName,
} from '/firestore_UNIV.js';
import { addListeners, map, getDivContent } from '/index_UNIV.js';
import { showMainModal } from './index.js';

//import { showAddModal } from './index.js';
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
var partners = {};
var activities = [];

var addForm_geopoint;

// This pans to the Philippines
map.panTo(new L.LatLng(14.651, 121.052));

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution:
		'&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var results = L.layerGroup().addTo(map);
var popup = L.popup();

function onMapClick(e) {
	const lat = e.latlng.lat;
	const lng = e.latlng.lng;

	// This is the popup for when the user clicks on a random spot on the map
	var popupContent = `
     <div class="partner-geolocation">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
           <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C11.337 11.5 10.7011 11.2366 10.2322 10.7678C9.76339 10.2989 9.5 9.66304 9.5 9C9.5 8.33696 9.76339 7.70107 10.2322 7.23223C10.7011 6.76339 11.337 6.5 12 6.5C12.663 6.5 13.2989 6.76339 13.7678 7.23223C14.2366 7.70107 14.5 8.33696 14.5 9C14.5 9.66304 14.2366 10.2989 13.7678 10.7678C13.2989 11.2366 12.663 11.5 12 11.5Z" fill="#91C9DB"/>
           </svg>
           ${lat} + ${lng}
           <br>
       </div>
   <button class="addButton" data-lat="${lat}" data-lng="${lng}">Add Location</button>
 `;

	popup.setLatLng(e.latlng).setContent(popupContent).openOn(map);

	// This addButton is from the mini popup
	var addButton = document.querySelector('.addButton');
	addButton.addEventListener('click', function () { // show mainmodal from pop up "add location"
		console.log("main modal called from popup");
		addForm_geopoint = new GeoPoint(lat, lng);
		console.log("currently adding coords: ", addForm_geopoint);
		showMainModal();
	});
}

// Show Main modal from the sideNav
const element = document.getElementById('addButton_v2');
element.addEventListener('click', () => {
	console.log("main modal called from sideNav");
	addForm_geopoint = null;
	showMainModal();
});

map.on('click', onMapClick);

getDocs(col_ref)
	.then((querySnapshot) => {
		// Populate activities
		querySnapshot.forEach((doc) => {
			if (
				doc.data().name !== 'Test 2' ||
				doc.data().name !== 'Test2'
			) {
				activities.push(doc.data());
			}
		});

		//  Populate with partners
		activities.forEach((activity) => {
			let partner = activity[SDECE_RULES[1]];
			if (partners[partner] == null) {
				partners[partner] = [];
				partners[partner].push(activity);
			} else {
				partners[partner].push(activity);
			}
		});

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
			}

			results.addLayer(marker);
			var popupContent = `
                   <div class="partner-popup" id="`;
			popupContent += partners[partner][0]['partner_name'];
			popupContent += `">`;
			popupContent += partners[partner][0]['partner_name'];
			popupContent += `</div>`;

			marker.bindPopup(popupContent);
			results.addLayer(marker);

			marker.on('popupopen', function () {
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

			const containerDiv = document.createElement('div');
			const img = document.createElement('svg');
			const listItem = document.createElement('li');
			const anchor = document.createElement('a');
			const nameDiv = document.createElement('div');
			const addressDiv = document.createElement('div');
			const activityDiv = document.createElement('div');

			containerDiv.addEventListener('click', function () {
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
			if (activities.length > 0) {
				// check if list of activities is present, otherwise is skipped to avoid errors
				activities.forEach((activity) => {
					activityDiv.innerHTML +=
						activity.activity_name + '<br/>'; // there might be a better way to display multiple activities
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

			//   if (partner.activities.length > 0)      // check if list of activities is present, otherwise is skipped to avoid errors
			//   {
			//     partner.activities.forEach( (activity) => {
			//       activityDiv.innerHTML += activity.activityName + "<br/>";       // there might be a better way to display multiple activities
			//     });
			//   }
			//   else {
			//     console.log("No activities found");
			//   }

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

// Display partner modal by clicking partner entry (WIP: and on pin pop up click)
export function showModal(partner) {
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
		'<svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 12H20M12 4V20" stroke="#3d97af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';

	// Add button for adding activities
	addActivity.addEventListener('click', () => {
		console.log('Clicked add activity in the partner modal');
		// show the addLoc.html with some autofilled values
		var modal = document.getElementById('addModal');

		// Display the modal
		modal.style.display = 'flex';
		// populate the field with current partner values
		document.getElementById("addModalHTML").contentWindow.document.getElementById("partner_name").value = partner[0].partner_name;
		document.getElementById("addModalHTML").contentWindow.document.getElementById("partner_name").readOnly = true;
		
		document.getElementById("addModalHTML").contentWindow.document.getElementById("partner_address").value = partner[0].partner_address;
		document.getElementById("addModalHTML").contentWindow.document.getElementById("partner_address").readOnly = true;

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
			const activityButton = document.createElement('button');
			activityButton.classList.add('modal-activities');

			const activityName = document.createElement('div');

			const arrow = document.createElement('div');

			activityName.textContent = activity.activity_nature + '';

			arrow.innerHTML =
				'<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#currentColor"><g id="SVGRepo_bgCarrier" stroke-width="2"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z" fill="currentColor"></path></g></svg>';
			arrow.classList.add('arrow');

			activityButton.appendChild(activityName);
			activityButton.appendChild(arrow);

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
		}
	});

	var editButtons = document.getElementsByClassName('edit-button');

	for (var i = 0; i < editButtons.length; i++) {
		editButtons[i].addEventListener('click', function () {
			console.log('Clicked edit activity');

			//Close activity details modal

			// Select the modal and partnerName elements
			var modal = document.getElementById('editModal');

			var partnerModal = document.getElementById('partnerModal');
			// TODO: Integrate this functionality into the modal instead
			// var partnerName = this.getAttribute("data-loc");
			//       window.open(
			//         `editloc.html?partnerName=${encodeURIComponent(partnerName)}`,
			//         "_blank"
			//       );

			// Display the modal
			modal.style.display = 'flex';
			// partnerModal.classList.add('hidden'); // Not sure if this should be hidden nalang, or should be kept open with the editModal on top nalang

			// Close the modal when the user clicks anywhere outside of it
			window.onclick = function (event) {
				if (event.target == modal) {
					modal.style.display = 'none';
				}
			};
		});
	}
}


export async function getCoordsFromAddress(address = "161 Daan Tubo, Diliman, Quezon City"){
	console.log("ENTER PRESSED IN MAIN MODAL: ", address);

	var parsed_loc = encodeURIComponent(
		address.toLowerCase().replace(/[^a-z0-9 _-]+/gi, "-")
	  );
	var api_search = "https://nominatim.openstreetmap.org/search?q=";
	var link = api_search.concat(parsed_loc).concat("&format=json");
	console.log(link);

	var response = await fetch(link);
	var jsonified = await response.json();

	console.log(jsonified);
	console.log(jsonified[0]["lat"], jsonified[0]["lon"]);

	if (addForm_geopoint == null){
		addForm_geopoint = new GeoPoint(jsonified[0]["lat"],jsonified[0]["lon"]);
		console.log("coords have been set from the address.", addForm_geopoint);
	} else {
		console.log("No need, you already set it in the popup");
	}
}

//main modal enter the location
let addInp = document.getElementById("mainModalIframe").contentWindow.document.getElementById("address-input");

addInp.addEventListener('keyup', ({key}) => {
		if (key ==="Enter"){
			let inp = addInp.value;
			getCoordsFromAddress(inp);
		}
	});

//values stored in local before uploading them in batches
temp_activities = {};

// handle the temporary variables when adding a new entry
function handleSaveEntry(){
	let addForm_modal = document.getElementById("addModalHTML").contentWindow.document;

}