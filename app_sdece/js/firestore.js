// FIRESTORE DATABASE\
import { getDocs, GeoPoint, Timestamp } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';
import { getCollection, setCollection, SDECE_RULES, validateData, editEntry, addEntry } from '/js/firestore_UNIV.js';
import { map } from '/js/index_UNIV.js';
import { showMainModal, showAddModal } from './index.js';

// Set collection and associated rule config
let collection_value = 'sdece-official'
setCollection(collection_value);

// Pans to the Philippines
map.setView(new L.LatLng(14.651, 121.052), 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let results = L.layerGroup().addTo(map);
let popup = L.popup();
let addForm_geopoint;

// Handles Map Click events
function onMapClick(e) {
	const lat = e.latlng.lat;
	const lng = e.latlng.lng;

	// Popup for when user clicks anywhere on the map
	let popupContent = 
	`<div class="partner-geolocation"> Latitude: ${lat} <br> Longitude: ${lng} </div>
	 <button class="addButton" data-lat="${lat}" data-lng="${lng}"> Add Location</button>`;

	popup.setLatLng(e.latlng).setContent(popupContent).openOn(map);

	// Add Location button for Popup
	let add_button = document.querySelector('.addButton');
	add_button.addEventListener('click', function () {
		addForm_geopoint = new GeoPoint(lat, lng);
		showMainModal();
		populateMainModalList();
	});
}

map.on('click', onMapClick);

// Handles Add Activity from the main modal
const mainModalDocument = document.getElementById('mainModalIframe').contentDocument;
const newButton = mainModalDocument.getElementById('addModalButton');
let has_existing_partner;

newButton.addEventListener('click', () => {
	// Get the Add Activity form and the needed input fields for autofill
	let inputtedPartnerName = mainModalDocument.getElementById('inputted_partner_name').value;
	let inputtedPartnerAddress = mainModalDocument.getElementById('address-input').value;
	let input = addFormiframeDocument.getElementById(field);
	has_existing_partner = false;

	if (inputtedPartnerName == '' || inputtedPartnerAddress == '') {
		alert('Partner Name and Partner Address cannot be blank.');
	} else {
		for (let field of SDECE_RULES[2]) {
			if (field != 'partner_coordinates') {
				if (field == 'partner_name' || field == 'partner_address') {
					if (field == 'partner_name') {
						input.value = inputtedPartnerName;
					} else {
						input.value = inputtedPartnerAddress;
					}
					input.readOnly = true;
					input.style.backgroundColor = 'var(--custom-medium-gray';
					input.style.color = 'var(--custom-dark-gray';
				} else {
					input.value = null;
					input.readOnly = false;
				}
			} 
		}
		showAddModal();
	}
});

// Uses activity nature if there's activity name is N/A	
function getActivity(activity) {
	const name = activity['activity_name'];
	const nature = activity['activity_nature'];

	if (!name || name.trim() === '') {
		return nature;
	}
	return name;
}

// Clears Highlight on the Side Bar when transitioning
function clearAllHighlights() {
	const sidebarItems = document.querySelectorAll('.partnerDiv');
	sidebarItems.forEach((item) => {
		item.classList.remove('highlight');
	});
}

// Fetches all activity documents from the specified Firestore collection.
// Filters out test entries, groups activities by partner, and dynamically
// creates map markers and sidebar entries for each unique partner.
let collection_ref = getCollection();
let partners = {}; 
let activities = {};

getDocs(collection_ref)
	.then((querySnapshot) => {
		// Load and filter activities
		querySnapshot.forEach((doc) => {
			let activity = doc.data();
			let activity_Name = activity.name;

			// Store activity by ID
			if ( activity_Name !== 'Test 2' || activity_Name !== 'Test2'){
				activity['identifier'] = doc.id;
				activities[doc.id] = activity;
			}
		});

		//  Group activities by partner
		Object.keys(activities).forEach((activity) => {
			let partner = activities[activity][SDECE_RULES[1]];

			if (partners[partner] == null) {
				partners[partner] = [];
			} 
			partners[partner].push(activities[activity]);
		});

		// Create map markers and sidebar list items for each partner
		Object.keys(partners).forEach((partner) => {
			// Some coordinated are null, protective check
			let partnerCoordinates = partners[partner][0]['partner_coordinates'];
			let partnerLatitude = partnerCoordinates.latitude;
			let partnerLongitude = partnerCoordinates.longitude;
			let marker;

			// Skip if no coordinates
			if (partnerCoordinates != null) {

				let lati = parseFloat(partnerLatitude);
				let longi = parseFloat(partnerLongitude);

				marker = L.marker([lati, longi]);

				// Bind popup to marker
				let popupContent = `
					<div class="partner-popup" id="${partner}">
					${partner}
					</div>`;
				marker.bindPopup(popupContent);
				results.addLayer(marker); // Add to layer group


				// Marker hover and click events
				marker.on('mouseover', () => marker.openPopup());
				marker.on('click', () => {
					map.panTo(new L.LatLng(lati, longi));
					clearAllHighlights();

					// Highlight sidebar item for this partner
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

			// Build sidebar item for this partner
			const containerDiv = document.createElement('div');
			const img = document.createElement('svg');
			const listItem = document.createElement('li');
			const anchor = document.createElement('a');
			const nameDiv = document.createElement('div');
			const addressDiv = document.createElement('div');
			const activityDiv = document.createElement('div');
			
			containerDiv.classList.add('partnerDiv');
			listItem.classList.add('accordion');
			nameDiv.classList.add('name');
			addressDiv.classList.add('address');
			activityDiv.classList.add('activity');

			nameDiv.textContent = partner;
			addressDiv.textContent = partners[partner][0]['partner_address'];

			// Append activity names
			let activities_string = '';

			for (let activity of partners[partner]) {
				activities_string += getActivity(activity)+ '<br>';
			}
			activityDiv.innerHTML = activities_string;

			 // Add click behavior for sidebar item
			containerDiv.addEventListener('click', function () {
				marker.openPopup();
				map.panTo(new L.LatLng(lati, longi));

				clearAllHighlights();
				containerDiv.classList.add('highlight');
				showModal(partners[partner]);
			});

			// Append elements to the DOM
			anchor.append(nameDiv, addressDiv, activityDiv);
			listItem.appendChild(anchor);
			containerDiv.append(img, listItem);
			locationList.appendChild(containerDiv);
		}});
	})
	.catch((error) => {
		console.error('Error getting documents: ', error);
	});

// Display partner modal by clicking partner entry
let current_viewed_activity = null; // docId of the currently viewed activity

export function showModal(partner) {
	
	// Sets up Partner's Modal
	function setupModal(){
		// Hide external button (reset state)
		const modalButton = document.querySelector('.modal-button'); 
		modalButton.style.display = 'none';
		modalButton.style.padding = '0px';

		// Select modal containers
		const modal = document.getElementById('partnerModal');
		const modalHeader = document.getElementById('modalHeader');
		const modalContent = document.getElementById('modalContent');
		const modalHeaderStyle = modalHeader.style;

		// Prepare modal header style for layout
		modalHeaderStyle.width = '100%';
		modalHeaderStyle.display = 'flex';
		modalHeaderStyle.flexDirection = 'row';
		modalHeaderStyle.justifyContent = 'space-between';
		modalHeaderStyle.alignItems = 'center';

		// Clear previous content
		modalHeader.innerHTML = '';
		modalContent.innerHTML = '';

		return {modal, modalHeader, modalContent};
	}
	const {modal, modalHeader, modalContent} = setupModal();

	// Creates the Partners Details
	function createBaseElements() {
		// Partner info display
		const nameDiv = document.createElement('div');
		const addressDiv = document.createElement('div');
		nameDiv.classList.add('modal-name');
		addressDiv.classList.add('modal-address');

		// Activities Section
		const activityHeaderDiv = document.createElement('div');
		const activityDiv = document.createElement('div');

		// ADMU footer details
		const admuContactDiv = document.createElement('div');
		const admuEmailDiv = document.createElement('div');
		const admuOfficeDiv = document.createElement('div');
		const orgDiv = document.createElement('div');

		return {nameDiv, addressDiv, activityHeaderDiv, activityDiv, admuContactDiv, admuEmailDiv, admuOfficeDiv, orgDiv};
	}
	const { nameDiv, addressDiv, activityHeaderDiv, activityDiv, admuContactDiv, admuEmailDiv, admuOfficeDiv, orgDiv } = createBaseElements();
	
	// Modal Control Button
	const backarrowDiv = createBackButton();
	const closeDiv = createCloseButton();
	
	// Back button: return to list view from activity details
	function createBackButton() {
		const back = document.createElement('div');

		back.classList.add('back-btn');
		back.innerHTML = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#currentColor" transform="matrix(-1, 0, 0, -1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="2"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z" fill="currentColor"></path></g></svg>';
		
		back.addEventListener('click', () => {
			// Reset state
			current_viewed_activity = null;

			// Hide floating edit button if visible
			const modalBtn = document.querySelector('.modal-button');
			modalBtn.style.display = 'none';
			modalBtn.style.padding = '0px';

			// Clear modal content before repopulating
			modalHeader.innerHTML = '';
			modalContent.innerHTML = '';

			// Restore default partner modal view
			modalHeader.append(nameDiv, closeDiv);
			modalContent.append(addressDiv, activityHeaderDiv, activityDiv);
			});
		return back;
	}

	// Close button: exit modal entirely
	function createCloseButton() {
		const close = document.createElement('div');

		close.classList.add('close-btn');
		close.innerHTML = '<svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#currentColor"><path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="currentColor"></path></svg>';
		
		close.addEventListener('click', () => {
			current_viewed_activity = null; // reset viewed activity
			clearAllHighlights();			// unhighlight selected UI elements
			modal.style.display = 'none';	// hide modal
			modal.classList.remove('open'); //transition out
		});
		return close;
	}

	// === ALTERNATE CLOSE EVENT when user clicks outside ===
	// window.addEventListener('click', (event) => {
	// 	if (event.target == modal) {
	// 		modal.classList.remove('open'); //transition out
	// 		modal.style.display = 'none';
	// 		current_viewed_activity = null;
	// 	}
	// });

	// Set partner name and coordinates as modal header content
	function populatePartnerInfo(nameDiv, addressDiv, partner) {
		nameDiv.textContent = partner[0].partner_name;
		addressDiv.textContent =
			'Latitude, Longitude: ' +
			partner[0].partner_coordinates._lat + ', ' +
			partner[0].partner_coordinates._long;
	}
	populatePartnerInfo(nameDiv, addressDiv, partner);

	function setupActivityHeader(partner, activityHeaderDiv) {
		// Activities header with add activity button
		activityHeaderDiv.innerHTML = 'List of activities: ';
		const addActivity = document.createElement('button');
		addActivity.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 12H20M12 4V20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
		addActivity.classList.add('plus-btn');

		activityHeaderDiv.appendChild(addActivity);
		activityHeaderDiv.classList.add('modal-activities-header');

		// Add new activity (reuses existing partner location and name/address)
		addActivity.addEventListener('click', () => {
			has_existing_partner = true;
			addForm_geopoint = new GeoPoint(partner[0].partner_coordinates._lat, partner[0].partner_coordinates._long);

			// Access iframe form and autofill with partner details
			let modal = document.getElementById('addModal');
			let modalHtml = document.getElementById('addModalHTML');
			let partnerName = modalHtml.contentWindow.document.getElementById('partner_name');
			let partnerAddress = modalHtml.contentWindow.document.getElementById('partner_address');

			modal.style.display = 'flex'; // open modal
			
			// Populate the field with current partner values
			partnerName.value = partner[0].partner_name;
			partnerName.readOnly = true;
			partnerName.style.backgroundColor = 'var(--custom-medium-gray)';
			partnerName.style.color = 'var(--custom-dark-gray)';

			partnerAddress.value = partner[0].partner_address;
			partnerAddress.readOnly = true;
			partnerAddress.style.backgroundColor = 'var(--custom-medium-gray)';
			partnerAddress.style.color = 'var(--custom-dark-gray)';
		});
	}
	setupActivityHeader(partner, activityHeaderDiv);

	// Add each activity to the modal content
	function populateActivityList(partner, activityDiv, modalHeader, modalContent, nameDiv, closeDiv, backarrowDiv) {
		if (partner.length > 0) {

			partner.forEach((activity) => {
				// === PREVIEW SECTION: visible when viewing the partner summary ===

				// Create container for the activity preview
				const activityButton = document.createElement('div');
				const activityTitle = document.createElement('button');
				activityTitle.classList.add('modal-activity-title');
				activityButton.classList.add('modal-activity-button');

				// Build the elements for the preview 
				const activityName = document.createElement('div');
				const arrow = document.createElement('div');
				arrow.classList.add('arrow');
				const office = document.createElement('div');
				office.classList.add('modal-office');

				// Populate preview content
				activityName.textContent = getActivity(activity) + '';
				arrow.innerHTML = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#currentColor"><g id="SVGRepo_bgCarrier" stroke-width="2"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z" fill="currentColor"></path></g></svg>';
				office.innerHTML = activity.ADMU_office;

				// Combine preview elements into the button
				activityTitle.append(activityName, arrow);
				activityButton.append(activityTitle, office);

				// === DETAIL SECTION: visible when the activity is clicked ===

				// Set div content for activity details
				const activityNameDiv = document.createElement('div');
				const activityAddressDiv = document.createElement('div');
				const activityContactDiv = document.createElement('div');
				const activityOrganizationDiv = document.createElement('div');
				const activityDatesDiv = document.createElement('div');
				const activityOfficeDiv = document.createElement('div');

				// Fill in detail data and apply classes
				activityNameDiv.innerHTML = getActivity(activity) + '';
				activityNameDiv.classList.add('modal-activities-header');
				activityAddressDiv.innerHTML = activity.partner_address;
				activityAddressDiv.classList.add('modal-address');

				activityContactDiv.innerHTML =
					'<b>Contact</b>' +
					'<p class="pm-detailed-info">' + activity.partner_contact_name + '</p>' +
					'<p class="pm-detailed-info">' + activity.partner_email + '</p>';

				activityOrganizationDiv.innerHTML =
					'<b>Organization/Unit</b>' +
					'<p class="pm-detailed-info">' + activity.organization_unit + '</p>';

				activityDatesDiv.innerHTML =
					'<b>Date/s of Partnership</b>' +
					'<p class="pm-detailed-info">' +
					(activity.activity_date?.toDate?.()
						? activity.activity_date.toDate().toLocaleDateString('en-PH', {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						})
						: 'N/A') +
					'</p>'; 

				activityOfficeDiv.innerHTML =
					'<b class="ao-header">Ateneo Office Oversight</b>' +
					'<p class="ao-office">' + activity.ADMU_office + '</p>' +
					'<p class="ao-details">' + activity.ADMU_contact_name + '</p>' +
					'<p class="ao-details">' + activity.ADMU_email + '</p>';

				// === CLICK HANDLER: when user clicks on activity preview ===

				activityButton.addEventListener('click', () => {
					current_viewed_activity = activity;

					// Reset modal layout and show detailed view
					document.querySelector('.modal-button').style.display = 'flex';
					modalHeader.innerHTML = '';
					modalContent.innerHTML = '';

					modalHeader.append(backarrowDiv, nameDiv, closeDiv);

					// Reset and apply class styles for detail elements
					activityNameDiv.classList = '';
					activityAddressDiv.classList = '';

					activityNameDiv.classList.add('pm-activity-name');
					activityAddressDiv.classList.add('pm-activity-address');
					activityContactDiv.classList.add('pm-details');
					activityOrganizationDiv.classList.add('pm-details');
					activityDatesDiv.classList.add('pm-details');
					activityOfficeDiv.classList.add('pm-activity-office');

					// Insert all detail sections into modal body
					modalContent.append(activityNameDiv, activityAddressDiv, activityContactDiv, 
					activityOrganizationDiv, activityDatesDiv, activityOfficeDiv);
				});
				// Add this activity preview to the list shown in modal
				activityDiv.appendChild(activityButton);
			});
		}
	}
	populateActivityList(partner, activityDiv, modalHeader, modalContent, nameDiv, closeDiv, backarrowDiv)

	// Append the main partner info and activity list sections to the modal
	function finalizeActivitySection(activityDiv, partner, admuContactDiv, admuEmailDiv, admuOfficeDiv, orgDiv) {
		activityDiv.classList.add('modal-activities-list');

		admuContactDiv.innerHTML = '<b>AdMU Contact: </b>' + partner.ADMU_contact;
		admuEmailDiv.innerHTML   = '<b>AdMU Email: </b>' + partner.ADMU_email;
		admuOfficeDiv.innerHTML  = '<b>AdMU Office: </b>' + partner.ADMU_office;
		orgDiv.innerHTML         = '<b>Organization: </b>' + partner.organization_unit;
	}
	finalizeActivitySection(activityDiv, partner, admuContactDiv, admuEmailDiv, admuOfficeDiv, orgDiv)

	// Append core sections to modal: partner info and activity list
	modalHeader.append(nameDiv, closeDiv);
	modalContent.append(addressDiv, activityHeaderDiv, activityDiv);

	// Display the partner modal
	modal.style.display = 'flex';
	modal.classList.add('open'); //transition in

	// Setup edit button behavior: opens the edit modal and pre-fills it with data
	function setupEditButtons() {
		// Select all buttons that allows editing
		let editButtons = document.getElementsByClassName('edit-button');

		for (let i = 0; i < editButtons.length; i++) {
			editButtons[i].addEventListener('click', function () {
				if (current_viewed_activity != null) {

					// Select modal element and show it
					let modal = document.getElementById('editModal');
					modal.style.display = 'flex';
			
					// Get reference to the form inside the edit iframe
					let iframeDoc = document.getElementById('editModal_iframe').contentWindow.document;

					// Loop through all form field names defined in SDECE_RULES[2]
					SDECE_RULES[2].forEach((field) => {
						let input = iframeDoc.getElementById(field);
						if (input != null) {
							input.value = current_viewed_activity[field];
						}
					});
				}
			});
		}
	}
	setupEditButtons();
}

// Local values stored before batch uploading
let temp_activities = {};
let temp_activities_id = 0;

// Addloc.html Save button click listener
let addFormiframe = document.getElementById('addModalHTML');
let addFormiframeDocument = addFormiframe.contentWindow.document;
let addFormSubmitButton = addFormiframeDocument.getElementById('submit_form');
addFormSubmitButton.addEventListener('click', function () {
	//Get data from addloc.html
	let info_from_forms = {};
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
			// Locally store it
			temp_activities[temp_activities_id + ''] = info_from_forms;
			temp_activities_id += 1;

			populateMainModalList();
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
	let collated_inp = {};
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

	// Validate the collated input here
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

// Mainmodal save button for batch uploading
const MAIN_MODAL_SAVE_BUTTON = mainModalDocument.getElementsByClassName('main-modal-save')[0];

MAIN_MODAL_SAVE_BUTTON.addEventListener('click', function () {

	let temp_keys = Object.keys(temp_activities).length;

	if (temp_keys > 0) {
		Object.keys(temp_activities).forEach((temp_id) => {
			let current_temp_activity = temp_activities[temp_id];
			let new_partner_name = mainModalDocument.getElementsByClassName('main-modal-partner-name')[0].value;
			let new_partner_address = mainModalDocument.getElementById('address-input').value;
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

		// Auto close modal
		window.parent.postMessage('closeMainModal', '*');

		// Clear input partner name and address
		mainModalDocument.getElementById('inputted_partner_name').value = '';
		mainModalDocument.getElementById('address-input').value = '';

		// Clear temp_activities
		temp_activities = {};

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
	// Display temporarily saved activities to main modal
	const mainModalActivityList = mainModalDocument.getElementById('mainModalActivityList');
	mainModalActivityList.innerHTML = '';

	if (Object.keys(temp_activities).length == 0) {
		mainModalActivityList.innerHTML = '<p> No activities to show </p>';
	} else {
		for (let i = 0; i < Object.keys(temp_activities).length; i++) {
			let activity = temp_activities[Object.keys(temp_activities)[i]];

			// View activity details button
			const activityButton = document.createElement('li');
			const activityName = document.createElement('div');
			const arrow = document.createElement('div');

			activityName.textContent = getActivity(activity) + '';

			arrow.innerHTML = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#currentColor"><g id="SVGRepo_bgCarrier" stroke-width="2"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z" fill="currentColor"></path></g></svg>';
			arrow.classList.add('arrow');

			activityButton.appendChild(activityName);
			activityButton.classList.add('main-modal-temporary-activity');
			mainModalActivityList.appendChild(activityButton);
		}
	}
}
