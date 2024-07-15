import { showModal } from './firestore.js';
import {
	getDocIdByPartnerName,
	getDocByID,
	setCollection,
	getCollection,
	DB,
} from '/firestore_UNIV.js';
import { addListeners, map, getDivContent } from '/index_UNIV.js';
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
//import { getDocIdByPartnerName, getDocByID } from "firestore_UNIV.js";

var colRef = getCollection();

// //list down all documents under the collection in console.log
// const querySnapshot = await getDocs(colRef);
// console.log(querySnapshot);
// querySnapshot.forEach((doc) => {
//   // doc.data() is never undefined for query doc snapshots
//   console.log(doc.id, " => ", doc.data());
// });

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
// 	attribution:
// 		'&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
// }).addTo(map);

var searchControl = L.esri.Geocoding.geosearch().addTo(map);
var results = L.layerGroup().addTo(map);
var popup = L.popup();

// Loads at the start
// addListeners();

// searchControl.on('results', function (data) {
// 	results.clearLayers();
// 	for (var i = data.results.length - 1; i >= 0; i--) {
// 		var marker = L.marker(data.results[i].latlng);
// 		console.log(marker);
// 		results.addLayer(marker);
// 	}
// });

// This function defines the event for when the user clicks anywhere on the map
function onMapClick(e) {
	const lat = e.latlng.lat;
	const lng = e.latlng.lng;

	// This is the popup for when the user clicks on a spot on the map
	var popupContent = `
      <div class="partner-geolocation">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C11.337 11.5 10.7011 11.2366 10.2322 10.7678C9.76339 10.2989 9.5 9.66304 9.5 9C9.5 8.33696 9.76339 7.70107 10.2322 7.23223C10.7011 6.76339 11.337 6.5 12 6.5C12.663 6.5 13.2989 6.76339 13.7678 7.23223C14.2366 7.70107 14.5 8.33696 14.5 9C14.5 9.66304 14.2366 10.2989 13.7678 10.7678C13.2989 11.2366 12.663 11.5 12 11.5Z" fill="#91C9DB"/>
            </svg>
            ${lat} + ${lng}
            <br>
        </div>
    <button id="addPartnerWithCoords" class="addButton p-5" data-lat="${lat}" data-lng="${lng}">Add Location</button>
  `;

	popup.setLatLng(e.latlng).setContent(popupContent).openOn(map);

	var add_partner_button_in_pin = document.getElementById("addPartnerWithCoords");
	add_partner_button_in_pin.addEventListener('click',function(){
		console.log("Coords supplied to the add partner");
	});

	var addButton = document.querySelector('.addButton');
	addButton.addEventListener('click', function () {
		console.log("Coords supplied to the add partner");

		const lat = this.getAttribute('data-lat');
		const lng = this.getAttribute('data-lng');

		var modal = document.getElementById('addModal');

		// TODO: Integrate this functionality into the modal instead
		// var partnerName = this.getAttribute("data-loc");
		// window.open(
		//   `addloc.html?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(
		//     lng
		//   )}`,
		//   "_blank"
		// );

		// Display the modal
		modal.classList.remove('hidden');

		// Close the modal when the user clicks anywhere outside of it
		window.onclick = function (event) {
			if (event.target == modal) {
				modal.classList.add('hidden');
			}
		};
	});

	
}

map.on('click', onMapClick);
map.panTo(new L.LatLng(14.652538, 121.077818));

// Show Main modal
// const element = document.getElementById('mainButton');
// element.addEventListener('click', showMainModal);

export function showMainModal() {
	console.log("'Add an activity' button was clicked!");

	var mainModal = document.getElementById('mainModal');
	mainModal.style.display = 'flex';

	// display temporarily saved activities to main modal
	var test_entry = {
		ADMU_contact_name : "UHHH",
		ADMU_email: "assadasd@gmail.com",
		ADMU_office: "QWERAS",
		// activity_date: Timestamp.fromDate(test_date),
		activity_name: "SOMRHTING",
		activity_nature: "reading AJKSDHKASDJH",
		additional_partnership: "UHHH",
		identifier: "wNr26AKaKadluPLiJrzG",
		organization_unit: "COMPASDDDDD",
		partner_address: "ddadad",
		partner_contact_name: "dddddaxcz",
		partner_contact_number: "qwerrwe",
		// partner_coordinates: testLoc,
		partner_email: "asdasd@gmail.com",
		partner_name: "HAHAHAHA",
	}

	const mainModalActivityList = mainModalDocument.getElementById('mainModalActivityList');
	mainModalActivityList.innerHTML = '';
	
	var activity = test_entry; //Set what 

	// View activity details button
	// const activityButton = document.createElement('button');
	const activityButton = document.createElement('div');
	activityButton.classList.add('modal-activities');
	const activityName = document.createElement('div');
	const arrow = document.createElement('div');

	activityName.textContent = activity.activity_nature + '';

	arrow.innerHTML =
		'<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#currentColor"><g id="SVGRepo_bgCarrier" stroke-width="2"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z" fill="currentColor"></path></g></svg>';
	arrow.classList.add('arrow');

	activityButton.appendChild(activityName);

	// To do: have list of activities and iterate-add
	mainModalActivityList.appendChild(activityButton);

	console.log('Main modal activities:');
	console.log(mainModalActivityList);

	window.onclick = function (event) {
		if (event.target == mainModal) {
			mainModal.style.display = 'none';
		}
	};
}

export function showAddModal() {
	console.log("The user clicked the '+' button within the Main Modal");
	var addModal = document.getElementById('addModal');
	addModal.style.display = 'flex';

	window.onclick = function (event) {
		if (event.target == addModal) {
			addModal.style.display = 'none';
		}
	};
}

// function addMainButtonText() {
// 	var mainButtonText = document.getElementById('mainButtonText');
// 	mainButtonText.innerHTML = 'Add an activity';
// }
// addMainButtonText();
