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
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';
import {
	getCollection,
	setCollection,
	SDECE_RULES,
	getDocIdByPartnerName,
} from '/firestore_UNIV.js';

import { showAddModal } from './index.js';
// Your Firestore code here

// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
setCollection('sdece-official');

var col_ref = null;

col_ref = getCollection();

console.log(col_ref);

var partners = {}; // queried
var activities = [];

// get docs from firestore and place them in partner and activities

getDocs(col_ref)
	.then((querySnapshot) => {
		//populate activities
		querySnapshot.forEach((doc) => {
			if (
				doc.data().name !== 'Test 2' ||
				doc.data().name !== 'Test2'
			) {
				activities.push(doc.data());
			}
		});

		console.log('Activities:');
		console.log(activities);

		//populate with partners
		activities.forEach((activity) => {
			let partner = activity[SDECE_RULES[1]];

			//console.log(partner);

			if (partners[partner] == null) {
				partners[partner] = [];
				partners[partner].push(activity);
			} else {
				partners[partner].push(activity);
			}
		});

		console.log('Partners: ');
		console.log(partners);

		//populate ul with partners
		Object.keys(partners).forEach((partner) => {
			const containerDiv = document.createElement('div');
			const img = document.createElement('svg');
			const listItem = document.createElement('li');
			const anchor = document.createElement('a');
			const nameDiv = document.createElement('div');
			const addressDiv = document.createElement('div');
			const activityDiv = document.createElement('div');

			// Set attributes
			anchor.href = '#';

			anchor.addEventListener('click', function () {
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

			nameDiv.classList.add(
				'name'
				// 'font-montserrat',
				// 'font-bold',
				// 'text-lg',
				// 'text-darkbg',
				// 'leading-[110%]'
			);
			addressDiv.classList.add(
				'address'
				// 'text-sm',
				// 'text-customGray',
				// 'font-hind',
				// 'font-regular',
				// 'leading-[120%]',
				// 'mt-2'
			);
			activityDiv.classList.add(
				'activity'
				// 'text-sm',
				// 'text-customBlack',
				// 'font-hind',
				// 'font-regular',
				// 'leading-[110%]',
				// 'mt-2'
			);

			nameDiv.textContent = partner;
			addressDiv.textContent = partners[partner][0]['partner_address'];

			let qq = '';

			for (let activityy of partners[partner]) {
				qq += activityy['activity_nature'] + '\n';
			}
			activityDiv.textContent = qq;

			//   if (partner.activities.length > 0)      // check if list of activities is present, otherwise is skipped to avoid errors
			//   {
			//     partner.activities.forEach( (activity) => {
			//       activityDiv.innerHTML += activity.activityName + "<br/>";       // there might be a better way to display multiple activities
			//     });
			//   }
			//   else {
			//     console.log("No activities found");
			//   }

			listItem.classList.add(
				'accordion'
				// 'py-6',
				// 'px-8',
				// 'border-customGray',
				// 'w-full'
			);
			// anchor.classList.add('accordion', 'link');

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
	console.log('SHOW THE MODAL');

	console.log('Partner being shown as modal: ' + partner[0].partner_name);

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
	//modal.innerHTML = '';

	// Create div elements for each piece of information
	const backarrowDiv = document.createElement('button');
	const closeDiv = document.createElement('div');
	const nameDiv = document.createElement('div');
	const addressDiv = document.createElement('div');

	const activityHeaderDiv = document.createElement('div');
	const contactPersonDiv = document.createElement('div');
	const activityDiv = document.createElement('div');
	const admuContactDiv = document.createElement('div');
	const admuEmailDiv = document.createElement('div');
	const admuOfficeDiv = document.createElement('div');
	const orgDiv = document.createElement('div');
	const datesDiv = document.createElement('div');

	nameDiv.classList.add('modal-name');
	nameDiv.style = 'float: left;';
	addressDiv.classList.add('modal-address');

	// Set the content of each div
	backarrowDiv.innerHTML =
		'<svg viewBox="0 0 1024 1024" class="w-6 h-6" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#a0a0a0" stroke="#a0a0a0" stroke-width="50" transform="matrix(-1, 0, 0, -1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z" fill="#a0a0a0"></path></g></svg>';
	backarrowDiv.style = 'float-left';
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
	closeDiv.style = 'float: right;';
	// Close the modal when the close button is clicked
	closeDiv.addEventListener('click', () => {
		console.log('modal closed');
		modal.style.display = 'none';
	});

	console.log(partner[0]);

	// limit partner_name to 30 characters
	// if (partner[0].partner_name.length > 30) {
	// 	nameDiv.textContent =
	// 		partner[0].partner_name.substring(0, 30) + '...';
	// } else {
	nameDiv.textContent = partner[0].partner_name;
	// }

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
		showAddModal();
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
				'<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#a0a0a0" class="w-6 h-6"><g id="SVGRepo_bgCarrier" stroke-width="2"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z" fill="#a0a0a0"></path></g></svg>';
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
			activityNameDiv.classList
				.add
				// 'font-bold',
				// 'text-2xl',
				// 'text-lightbg'
				();

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
				activity.activity_date;

			activityOfficeDiv.innerHTML =
				"<hr> <br> <b class='font-bold text-2xl' style='color: #3d97af'>Ateneo Office Oversight</b> <br>" +
				activity.ADMU_office +
				'<br>' +
				activity.ADMU_contact_name +
				'<br>' +
				activity.ADMU_email +
				'<br>';

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
			activityDiv.appendChild(document.createElement('br'));
		});
	}

	activityDiv.classList.add('modal-activities');

	admuContactDiv.innerHTML = '<b>AdMU Contact: </b>' + partner.ADMU_contact;
	admuEmailDiv.innerHTML = '<b>AdMU Email: </b>' + partner.ADMU_email;
	admuOfficeDiv.innerHTML = '<b>AdMU Office: </b>' + partner.ADMU_office;
	orgDiv.innerHTML = '<b>Organization: </b>' + partner.organization_unit;

	// Append the div elements to the modal content
	modalHeader.appendChild(nameDiv);
	modalHeader.appendChild(closeDiv);

	modalContent.appendChild(addressDiv);
	modalContent.appendChild(activityHeaderDiv);
	modalContent.appendChild(activityDiv);

	// modalContent.appendChild(contactPersonDiv);
	// modalContent.appendChild(admuContactDiv);
	// modalContent.appendChild(admuEmailDiv);
	// modalContent.appendChild(admuOfficeDiv);
	// modalContent.appendChild(orgDiv);
	// modalContent.appendChild(datesDiv);

	// Show the modal
	modal.style.display = 'block';

	// Close the modal when the user clicks outside of it
	window.addEventListener('click', (event) => {
		if (event.target == modal) {
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
