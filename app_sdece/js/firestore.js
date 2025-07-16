// FIRESTORE DATABASE\
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
	editEntry,
	addEntry
} from '../../js/firestore_UNIV.js'; 

import { addListeners, map, getDivContent } from '../../js/index_UNIV.js';
import { showMainModal, showAddModal } from './index.js';

// Your Firestore code here
const FIREBASE_CONFIG = {
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

// Pans to the Philippines
map.setView(new L.LatLng(14.651, 121.052), 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var results = L.layerGroup().addTo(map);
var popup = L.popup();

function onMapClick(e) {
	const lat = e.latlng.lat;
	const lng = e.latlng.lng;

	// Popup for when user clicks anywhere on the map
	var popupContent = 
	`<div class="partner-geolocation"> Latitude: ${lat} <br> Longitude: ${lng} </div>
	 <button class="addButton" data-lat="${lat}" data-lng="${lng}"> Add Location</button>`;

	popup.setLatLng(e.latlng).setContent(popupContent).openOn(map);

	// Add Location button for Popup
	var add_button = document.querySelector('.addButton');
	add_button.addEventListener('click', function () {
		addForm_geopoint = new GeoPoint(lat, lng);
		showMainModal();
		populateMainModalList();
	});
}

map.on('click', onMapClick);

// add activity from the main modal
const mainModalDocument = document.getElementById('mainModalIframe').contentDocument;
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

				marker.on('click', function () {
					marker.openPopup();

					// Center the map on this marker
					map.setView(marker.getLatLng(), map.getZoom(), {
						animate: true,
						duration: 0.5,
					});

					clearAllHighlights();

					const sidebarItems = document.querySelectorAll('.partnerDiv');
					sidebarItems.forEach((item) => {
						const nameDiv = item.querySelector('.name');
						if (nameDiv && nameDiv.textContent === partner) {
							item.scrollIntoView({ behavior: 'smooth', block: 'center' });
							item.classList.add('highlight');
						}
					});
					
					var test = document.getElementById(
						partners[partner][0]['partner_name']
					);
					if (test) {
					test.addEventListener('click', function () {
						showModal(partners[partner]);
					});
					}
					// Directly show the modal on marker click
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
						getActivity(activity) + '<br/>'; // there might be a better way to display multiple activities
				});
			}

			nameDiv.classList.add('name');
			addressDiv.classList.add('address');
			activityDiv.classList.add('activity');

			nameDiv.textContent = partner;
			addressDiv.textContent = partners[partner][0]['partner_address'];

			let activities_string = '';

			for (let activity of partners[partner]) {
				activities_string += getActivity(activity) + '<br>';
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
	modalHeader.style.flexDirection = 'column';
	modalHeader.style.justifyContent = 'flex-start';
	modalHeader.style.alignItems = 'flex-start';

	// Clear previous content
	modalHeader.innerHTML = '';
	modalContent.innerHTML = '';

	// --- HEADER ---
	const headerTitle = document.createElement('div');
	headerTitle.className = 'modal-modern-title';
	headerTitle.innerHTML = `
	  <span class="modal-modern-location">${partner[0].partner_name || ''}</span>
	`;
	modalHeader.appendChild(headerTitle);

	// --- COORDINATES ---
	const coords = partner[0].partner_coordinates;
	let lat = coords && (coords._lat || coords.latitude);
	let lng = coords && (coords._long || coords.longitude);
	if (lat && lng) {
		lat = (Math.round(lat * 10000) / 10000).toFixed(4);
		lng = (Math.round(lng * 10000) / 10000).toFixed(4);
		const coordDiv = document.createElement('div');
		coordDiv.className = 'modal-geolocation-row';
		coordDiv.innerHTML = `
			<span class="geo-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.8995L16.9497 15.9497C19.6834 13.2161 19.6834 8.78392 16.9497 6.05025C14.2161 3.31658 9.78392 3.31658 7.05025 6.05025C4.31658 8.78392 4.31658 13.2161 7.05025 15.9497L12 20.8995ZM12 23.7279L5.63604 17.364C2.12132 13.8492 2.12132 8.15076 5.63604 4.63604C9.15076 1.12132 14.8492 1.12132 18.364 4.63604C21.8787 8.15076 21.8787 13.8492 18.364 17.364L12 23.7279ZM12 13C13.1046 13 14 12.1046 14 11C14 9.89543 13.1046 9 12 9C10.8954 9 10 9.89543 10 11C10 12.1046 10.8954 13 12 13ZM12 15C9.79086 15 8 13.2091 8 11C8 8.79086 9.79086 7 12 7C14.2091 7 16 8.79086 16 11C16 13.2091 14.2091 15 12 15Z"></path></svg></span>
			<span>${lat}, ${lng}</span>
		`;
		modalHeader.appendChild(coordDiv);
	}

	// --- LIST OF ACTIVITIES SECTION ---
	const activitiesSection = document.createElement('div');
	activitiesSection.className = 'modal-section';
	activitiesSection.innerHTML = `
	  <div class=\"modal-section-header\">\n        <span class=\"modal-section-icon\" style=\"display:flex;align-items:center;\">\n          <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"#7b8a99\" width=\"1.1em\" height=\"1.1em\"><path d=\"M20.0833 15.1999L21.2854 15.9212C21.5221 16.0633 21.5989 16.3704 21.4569 16.6072C21.4146 16.6776 21.3557 16.7365 21.2854 16.7787L12.5144 22.0412C12.1977 22.2313 11.8021 22.2313 11.4854 22.0412L2.71451 16.7787C2.47772 16.6366 2.40093 16.3295 2.54301 16.0927C2.58523 16.0223 2.64413 15.9634 2.71451 15.9212L3.9166 15.1999L11.9999 20.0499L20.0833 15.1999ZM20.0833 10.4999L21.2854 11.2212C21.5221 11.3633 21.5989 11.6704 21.4569 11.9072C21.4146 11.9776 21.3557 12.0365 21.2854 12.0787L11.9999 17.6499L2.71451 12.0787C2.47772 11.9366 2.40093 11.6295 2.54301 11.3927C2.58523 11.3223 2.64413 11.2634 2.71451 11.2212L3.9166 10.4999L11.9999 15.3499L20.0833 10.4999ZM12.5144 1.30864L21.2854 6.5712C21.5221 6.71327 21.5989 7.0204 21.4569 7.25719C21.4146 7.32757 21.3557 7.38647 21.2854 7.42869L11.9999 12.9999L2.71451 7.42869C2.47772 7.28662 2.40093 6.97949 2.54301 6.7427C2.58523 6.67232 2.64413 6.61343 2.71451 6.5712L11.4854 1.30864C11.8021 1.11864 12.1977 1.11864 12.5144 1.30864ZM11.9999 3.33233L5.88723 6.99995L11.9999 10.6676L18.1126 6.99995L11.9999 3.33233Z\"></path></svg>\n        </span>\n        <span>List of activities</span>\n      </div>\n      <div class='modal-section-divider'></div>\n    `;
	// List of activity cards
	partner.forEach((activity) => {
		const card = document.createElement('div');
		card.className = 'modal-card-activity modal-activity-summary-card';
		card.style.cursor = 'pointer';
		card.innerHTML = `
			<div class="modal-card-header-activity" style="font-size:1rem;font-weight:500;">${getActivity(activity) || 'Activity Name'}</div>
			<div class="modal-card-row" style="margin-top:-0.5rem;">
				<span class="modal-office">${activity.ADMU_office || 'Department'}</span>
	  </div>
			<span class="modal-activity-arrow" style="position:absolute;right:1.5rem;top:50%;transform:translateY(-50%);font-size:1.3rem;color:#b0b0b0;">&#8250;</span>
		`;
		card.style.position = 'relative';
		card.onclick = () => showActivityDetailModal(activity, partner[0].partner_name, coords);
		activitiesSection.appendChild(card);
	});
	modalContent.appendChild(activitiesSection);

	// --- CLOSE BUTTON (top right) ---
	const closeDiv = document.createElement('button');
	closeDiv.className = 'close-btn';
	closeDiv.innerHTML = '&times;';
	closeDiv.onclick = function() {
		modal.style.display = 'none';
	  modal.classList.remove('open');
	};
	modalHeader.appendChild(closeDiv);

	// Show the partner modal
		modal.style.display = 'flex';
	modal.classList.add('open');
}

function showEditActivityForm(activity, partnerName, coords) {
	const modal = document.getElementById('partnerModal');
	const modalHeader = document.getElementById('modalHeader');
	const modalContent = document.getElementById('modalContent');
	modalHeader.innerHTML = '';
	modalContent.innerHTML = '';

	// --- HEADER ---
	const headerRow = document.createElement('div');
	headerRow.style.display = 'flex';
	headerRow.style.alignItems = 'center';
	headerRow.style.gap = '1rem';

	// Back button
	const backBtn = document.createElement('button');
	backBtn.className = 'modal-back-btn';
	backBtn.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.5 19L8.5 12L15.5 5" stroke="#222b45" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	backBtn.onclick = function() {
		showActivityDetailModal(activity, partnerName, coords);
	};
	headerRow.appendChild(backBtn);

	const headerTitle = document.createElement('div');
	headerTitle.style.fontFamily = 'Geist', 'Montserrat', 'sans-serif';
	headerTitle.style.fontWeight = '700';
	headerTitle.style.fontSize = '1.2rem';
	headerTitle.style.lineHeight = '1.5rem';
	headerTitle.style.color = '#181c26';
	headerTitle.textContent = 'Edit Activity Details';
	headerRow.appendChild(headerTitle);
	modalHeader.appendChild(headerRow);

	// --- LOAD FORM HTML ---
	fetch('html/editloc.html')
		.then(response => response.text())
		.then(html => {
			// Extract only the <form>...</form> part
			console.log('[DEBUG] Loaded HTML:', html);
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = html;
			const form = tempDiv.querySelector('form');
			if (!form) {
				modalContent.innerHTML = '<div style="color:#b91c1c;">Error loading form.</div>';
				return;
			}
			form.id = 'editActivityForm';
			// Remove any old event listeners
			form.onsubmit = null;
			// Remove close button if present
			const closeBtn = form.querySelector('#close-btn');
			if (closeBtn) closeBtn.remove();
			// Remove the 'Edit Activity' card title if present
			const editActivityTitle = form.querySelector('h2, .edit-activity-title, .modal-card-header-information');
			if (editActivityTitle && editActivityTitle.textContent.trim().toLowerCase().includes('edit activity')) {
				editActivityTitle.remove();
			}
			// Prefill fields
			const fieldMap = {
				activity_name: activity.activity_name || '',
				activity_nature: activity.activity_nature || '',
				activity_date: activity.activity_date ? (typeof activity.activity_date === 'string' ? activity.activity_date : (activity.activity_date.toDate ? activity.activity_date.toDate().toLocaleDateString('en-CA') : '')) : '',
				additional_partnership: activity.additional_partnership || '',
				organization_unit: activity.organization_unit || '',
				partner_name: activity.partner_name || '',
				partner_address: activity.partner_address || '',
				partner_contact_name: activity.partner_contact_name || '',
				partner_contact_number: activity.partner_contact_number || '',
				partner_email: activity.partner_email || '',
				ADMU_office: activity.ADMU_office || '',
				ADMU_contact_name: activity.ADMU_contact_name || '',
				ADMU_email: activity.ADMU_email || ''
			};
			Object.keys(fieldMap).forEach(key => {
				const input = form.querySelector(`[name="${key}"]`);
				if (input) input.value = fieldMap[key];
			});
			// Save/cancel logic
			form.onsubmit = function(e) {
				e.preventDefault();
				const updated = {};
				Object.keys(fieldMap).forEach(key => {
					const input = form.querySelector(`[name="${key}"]`);
					updated[key] = input ? input.value : '';
				});
				updated['partner_coordinates'] = activity.partner_coordinates;
				let errors = validateData('sdece-official-TEST', updated);
				const errorDiv = form.querySelector('#error_messages');
				if (errorDiv) errorDiv.innerHTML = '';
				if (errors.length > 0) {
					if (errorDiv) {
						errors.forEach(err => {
							const p = document.createElement('p');
							p.textContent = err;
							p.style.color = '#b91c1c';
							p.style.fontSize = '0.95rem';
							errorDiv.appendChild(p);
						});
					}
					return;
				}
				if (typeof updated.activity_date === 'string' && !isNaN(Date.parse(updated.activity_date))) {
					const dateOnly = new Date(updated.activity_date);
					dateOnly.setHours(0, 0, 0, 0);
					updated.activity_date = Timestamp.fromDate(dateOnly);
				}
				editEntry(updated, activity.identifier);
				showActivityDetailModal({...activity, ...updated}, partnerName, coords);
			};
			// Cancel/Back logic
			const cancelBtn = form.querySelector('#cancel-btn');
			if (cancelBtn) {
				cancelBtn.onclick = function(e) {
					e.preventDefault();
					showActivityDetailModal(activity, partnerName, coords);
				};
			}
			modalContent.appendChild(form);
		})
		.catch(() => {
			modalContent.innerHTML = '<div style="color:#b91c1c;">Error loading form.</div>';
		});
}

function showActivityDetailModal(activity, partnerName, coords) {
	const modal = document.getElementById('partnerModal');
	const modalHeader = document.getElementById('modalHeader');
	const modalContent = document.getElementById('modalContent');

				modalHeader.innerHTML = '';
				modalContent.innerHTML = '';

	// --- HEADER ---
	const headerRow = document.createElement('div');
	headerRow.style.display = 'flex';
	headerRow.style.alignItems = 'center';
	headerRow.style.gap = '1rem';

	// Back button
	const backBtn = document.createElement('button');
	backBtn.className = 'modal-back-btn';
	backBtn.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.5 19L8.5 12L15.5 5" stroke="#222b45" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	backBtn.onclick = function() {
		// Always show the summary modal for this partner
		let allPartners = window.partners || {};
		let partnerArr = null;
		if (allPartners && allPartners[partnerName]) {
			partnerArr = allPartners[partnerName];
		} else if (window.activities) {
			// fallback: search activities for matching partner name
			partnerArr = Object.values(window.activities).filter(a => a.partner_name === partnerName);
		}
		if (partnerArr && partnerArr.length > 0) {
			showModal(partnerArr);
		} else {
			// fallback: showModal with just this activity
			showModal([activity]);
		}
	};
	headerRow.appendChild(backBtn);

	const headerTitle = document.createElement('div');
	headerTitle.className = 'modal-modern-title';
	headerTitle.innerHTML = `
	  <span class="modal-modern-activity">${getActivity(activity) || ''}</span><br>
	  <span class="modal-location-label">${partnerName || ''}</span>
	`;
	headerRow.appendChild(headerTitle);
	modalHeader.appendChild(headerRow);

	// --- GENERAL INFORMATION SECTION ---
	const generalSection = document.createElement('div');
	generalSection.className = 'modal-section';
	generalSection.innerHTML = `
	  <div class="modal-section-header">
		<span class="modal-section-icon" style="display:inline-flex;align-items:center;">
		  <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"rgba(126,138,152,1)\"><path d=\"M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z\"></path></svg>
		</span>
		<span>General Information</span>
	  </div>
	`;
	// Contact Information Card
	const contactCard = document.createElement('div');
	contactCard.className = 'modal-card-information';
	contactCard.innerHTML = `
	  <div class=\"modal-card-header-information\"><span style=\"display:inline-flex;align-items:center;\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"rgba(126,138,152,1)\" width=\"1.2em\" height=\"1.2em\" style=\"vertical-align:middle;margin-right:0.5rem;\"><path d=\"M20 22H6C4.34315 22 3 20.6569 3 19V5C3 3.34315 4.34315 2 6 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22ZM19 20V18H6C5.44772 18 5 18.4477 5 19C5 19.5523 5.44772 20 6 20H19ZM5 16.1707C5.31278 16.0602 5.64936 16 6 16H19V4H6C5.44772 4 5 4.44772 5 5V16.1707ZM12 10C10.8954 10 10 9.10457 10 8C10 6.89543 10.8954 6 12 6C13.1046 6 14 6.89543 14 8C14 9.10457 13.1046 10 12 10ZM9 14C9 12.3431 10.3431 11 12 11C13.6569 11 15 12.3431 15 14H9Z\"></path></svg>Contact Information</span></div>
	  <div class=\"modal-card-row\">\n        <span class=\"modal-label\">Contact person</span>\n        <span class=\"modal-value\">${activity.partner_contact_name || '—'}</span>\n      </div>\n      <div class=\"modal-card-row\">\n        <span class=\"modal-label\">Email address</span>\n        <span class=\"modal-value\">${activity.partner_email || '—'}</span>\n      </div>\n    `;
	// Partnership Information Card
	const partnershipCard = document.createElement('div');
	partnershipCard.className = 'modal-card-information';
	partnershipCard.innerHTML = `
	  <div class=\"modal-card-header-information\"><span style=\"display:inline-flex;align-items:center;\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"rgba(126,138,152,1)\" width=\"1.2em\" height=\"1.2em\" style=\"vertical-align:middle;margin-right:0.5rem;\"><path d=\"M2 22C2 17.5817 5.58172 14 10 14C14.4183 14 18 17.5817 18 22H16C16 18.6863 13.3137 16 10 16C6.68629 16 4 18.6863 4 22H2ZM10 13C6.685 13 4 10.315 4 7C4 3.685 6.685 1 10 1C13.315 1 16 3.685 16 7C16 10.315 13.315 13 10 13ZM10 11C12.21 11 14 9.21 14 7C14 4.79 12.21 3 10 3C7.79 3 6 4.79 6 7C6 9.21 7.79 11 10 11ZM18.2837 14.7028C21.0644 15.9561 23 18.752 23 22H21C21 19.564 19.5483 17.4671 17.4628 16.5271L18.2837 14.7028ZM17.5962 3.41321C19.5944 4.23703 21 6.20361 21 8.5C21 11.3702 18.8042 13.7252 16 13.9776V11.9646C17.6967 11.7222 19 10.264 19 8.5C19 7.11935 18.2016 5.92603 17.041 5.35635L17.5962 3.41321Z\"></path></svg>Partnership Information</span></div>
	  <div class=\"modal-card-row\">\n        <span class=\"modal-label\">Organization/Unit</span>\n        <span class=\"modal-value\">${activity.organization_unit || '—'}</span>\n      </div>\n      <div class=\"modal-card-row\">\n        <span class=\"modal-label\">Partnership date</span>\n        <span class="modal-value">${activity.activity_date && activity.activity_date.toDate ? activity.activity_date.toDate().toLocaleDateString('en-PH', {year: 'numeric', month: 'long', day: 'numeric'}): activity.activity_date || '—'}</span>\n      </div>\n    `;
	generalSection.appendChild(contactCard);
	generalSection.appendChild(partnershipCard);
	modalContent.appendChild(generalSection);

	// --- ATENEO OFFICE OVERSIGHT SECTION ---
	const officeSection = document.createElement('div');
	officeSection.className = 'modal-section';
	officeSection.innerHTML = `
	  <div class="modal-section-header">
		<span class="modal-section-icon" style="display:inline-flex;align-items:center;">
		  <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"rgba(126,138,152,1)\"><path d=\"M12 0.585693L18 6.58569V9H22V19H23V21H1V19H2V9H6V6.58569L12 0.585693ZM18 19H20V11H18V19ZM6 11H4V19H6V11ZM8 7.41412V18.9999H11V12H13V18.9999H16V7.41412L12 3.41412L8 7.41412Z\"></path></svg>
		</span>
		<span>Ateneo Office Oversight</span>
	  </div>
	`;
	const officeCard = document.createElement('div');
	officeCard.className = 'modal-card-information';
	officeCard.innerHTML = `
	  <div class="modal-card-row">
		<span class="modal-label">Ateneo Office</span>
		<span class="modal-value">${activity.ADMU_office || '—'}</span>
	  </div>
	  <div class="modal-card-row">
		<span class="modal-label">Oversight Contact</span>
		<span class="modal-value">${activity.ADMU_contact_name || '—'}</span>
	  </div>
	  <div class="modal-card-row">
		<span class="modal-label">Email address</span>
		<span class="modal-value">${activity.ADMU_email || '—'}</span>
	  </div>
	`;
	officeSection.appendChild(officeCard);
	modalContent.appendChild(officeSection);

	// --- EDIT BUTTON ---
	const editBtn = document.createElement('button');
	editBtn.className = 'modal-edit-btn';
	editBtn.textContent = 'Edit Activity';
	editBtn.onclick = function() {
		showEditActivityForm(activity, partnerName, coords);
	};
	modalContent.appendChild(editBtn);

	// --- CLOSE BUTTON (top right) ---
	const closeDiv = document.createElement('button');
	closeDiv.className = 'close-btn';
	closeDiv.innerHTML = '&times;';
	closeDiv.onclick = function() {
	  modal.style.display = 'none';
	  modal.classList.remove('open');
	};
	modalHeader.appendChild(closeDiv);

	// Show the partner modal
	modal.style.display = 'flex';
	modal.classList.add('open');
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
	//Get data from addloc.html
	var info_from_forms = {};
	for (let field of SDECE_RULES[2]) {
		if (field != 'partner_coordinates') {
			let input_field = addFormiframeDocument.getElementById(field);
			if (input_field != null) {
				if (input_field.value == '') {
					info_from_forms[field] = null;
				} else {
					info_from_forms[field] = input_field.value;
				}
			}
		} else {
			info_from_forms[field] = addForm_geopoint;
		}
	}

	//Validate the collated input here
	let errors = validateData('sdece-official-TEST', info_from_forms);

	if (errors.length > 0) {
		displayErrors(errors);
		event.preventDefault();
	} else {
		if (has_existing_partner) {
			// Uploads straight to firebase DB
			if (
				typeof info_from_forms.activity_date === 'string' &&
				!isNaN(Date.parse(info_from_forms.activity_date))
			) {
				const parsedDate = new Date(info_from_forms.activity_date);
				parsedDate.setHours(0, 0, 0, 0);
				info_from_forms.activity_date = Timestamp.fromDate(new Date(info_from_forms.activity_date));
			}
			addEntry(info_from_forms);
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
		addFormiframe.style.display = 'none';
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
let edit_modal = document.getElementById('editModal_iframe').contentWindow.document;
edit_modal.getElementById('submit_form').addEventListener('click', handleEdit);

export function handleEdit() {
	var collated_inp = {};
	for (let field of SDECE_RULES[2]) {
		if (field != 'partner_coordinates') {
			let input_field = edit_modal.getElementById(field);
			if (input_field != null) {
				if (input_field.value == '') {
					collated_inp[field] = null;
				} else {
					collated_inp[field] = input_field.value;
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
		mainModalActivityList.innerHTML = '<p class="main-modal-no-activities-message">No activities to show</p>';
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
