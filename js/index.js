import { getDocIdByPartnerName, getDocByID, setCollection, getCollection, DB } from "/firestore_UNIV.js";
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
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
//import { getDocIdByPartnerName, getDocByID } from "firestore_UNIV.js";

var map = L.map("map").setView([14.651, 121.052], 13);
setCollection("sdece-official");
var colRef = getCollection();

//list down all documents under the collection in console.log
const querySnapshot = await getDocs(colRef);
console.log(querySnapshot);
querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
  console.log(doc.id, " => ", doc.data());
});


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution:
		'&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var searchControl = L.esri.Geocoding.geosearch().addTo(map);

var results = L.layerGroup().addTo(map);
var popup = L.popup();

// async function searchLocation(loc) {
// 	var parsed_loc = encodeURIComponent(
// 		loc.toLowerCase().replace(/[^a-z0-9 _-]+/gi, '-')
// 	);
// 	var api_search = 'https://nominatim.openstreetmap.org/search?q=';
// 	var link = api_search.concat(parsed_loc).concat('&format=json');
// 	console.log(link);

// 	var response = await fetch(link);
// 	fetch(link)
// 		.then((response) => response.json())
// 		.then((json) => {
// 			json.forEach(function (entry, index) {
// 				var marker = L.marker([
// 					parseFloat(entry['lat']),
// 					parseFloat(entry['lon']),
// 				]);

// 				// This is the popup for when the user clicks on a partner
// 				var popupContent = `
//           <button class="popup-accordion" style="display: flex; align-items: center;">
//             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
//               <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C11.337 11.5 10.7011 11.2366 10.2322 10.7678C9.76339 10.2989 9.5 9.66304 9.5 9C9.5 8.33696 9.76339 7.70107 10.2322 7.23223C10.7011 6.76339 11.337 6.5 12 6.5C12.663 6.5 13.2989 6.76339 13.7678 7.23223C14.2366 7.70107 14.5 8.33696 14.5 9C14.5 9.66304 14.2366 10.2989 13.7678 10.7678C13.2989 11.2366 12.663 11.5 12 11.5Z" fill="#91C9DB"/>
//             </svg>
//             ${loc}
//             <svg xmlns="http://www.w3.org/2000/svg" fill="##387181" stroke="##387181" viewBox="0 0 24 24" stroke-width="1.5" class="size-8 mr-5">
//               <path stroke-linecap="round" stroke-linejoin="round" d="M12 15l-4.243-4.243 1.415-1.414L12 12.172l2.828-2.829 1.415 1.414z" />
//             </svg>
//           </button>

//           <div class="popup-accordion-content">
//             <div class="partner-info mb-4">
//               <p style="font-weight: bold;">[Contact Person Name]</p>
//               <p>[Contact Person Number]</p>
//             </div>

//             <hr class="mb-4">
            
//             <div class="partner-info">
//               <img src="img/logo-admu.png" alt="OSCI Logo" class="img w-8 h-auto mr-8">
//               <p style="font-weight: bold;">[Ateneo Person Name]</p>
//               <p>[Ateneo Person Email]</p>
//             </div>

//             <button class="expandPopUp text-red-600">Click for more details.</button>
//           </div>
//           `;

// 				marker.bindPopup(popupContent);
// 				results.addLayer(marker);

// 				marker.on('popupopen', function () {
// 					var expandButtons =
// 						document.getElementsByClassName('expandPopUp');
// 					for (var i = 0; i < expandButtons.length; i++) {
// 						expandButtons[i].addEventListener(
// 							'click',
// 							function () {
// 								// Select the modal and partnerName elements
// 								var modal =
// 									document.getElementById(
// 										'partnerModal'
// 									);

// 								// TODO: Integrate this functionality into the modal instead
// 								// var partnerName = this.getAttribute("data-loc");
// 								//       window.open(
// 								//         `editloc.html?partnerName=${encodeURIComponent(partnerName)}`,
// 								//         "_blank"
// 								//       );

// 								// Display the modal
// 								modal.classList.remove('hidden');
// 								modal.classList.add('flex');

// 								// Close the modal when the user clicks anywhere outside of it
// 								window.onclick = function (event) {
// 									if (event.target == modal) {
// 										modal.classList.add('hidden');
// 									}
// 								};
// 							}
// 						);
// 					}

// 					var editButtons =
// 						document.getElementsByClassName('editButton');
// 					for (var i = 0; i < editButtons.length; i++) {
// 						editButtons[i].addEventListener(
// 							'click',
// 							function () {
// 								// Select the modal and partnerName elements
// 								var modal =
// 									document.getElementById(
// 										'editModal'
// 									);

// 								var partnerModal =
// 									document.getElementById(
// 										'partnerModal'
// 									);
// 								// TODO: Integrate this functionality into the modal instead
// 								// var partnerName = this.getAttribute("data-loc");
// 								//       window.open(
// 								//         `editloc.html?partnerName=${encodeURIComponent(partnerName)}`,
// 								//         "_blank"
// 								//       );

// 								// Display the modal
// 								modal.classList.remove('hidden');
// 								modal.classList.add('flex');
// 								partnerModal.classList.add('hidden'); // Not sure if this should be hidden nalang, or should be kept open with the editModal on top nalang

// 								// Close the modal when the user clicks anywhere outside of it
// 								window.onclick = function (event) {
// 									if (event.target == modal) {
// 										modal.classList.add('hidden');
// 									}
// 								};
// 							}
// 						);
// 					}

// 					// Pop up toggle show/hide
// 					var acc =
// 						document.getElementsByClassName(
// 							'popup-accordion'
// 						);
// 					var i;

// 					for (i = 0; i < acc.length; i++) {
// 						acc[i].addEventListener('click', function () {
// 							/* Toggle between adding and removing the "active" class,
//             to highlight the button that controls the panel */
// 							this.classList.toggle('active');

// 							/* Toggle between hiding and showing the active panel */
// 							var contents = this.nextElementSibling;
// 							if (contents.style.display === 'block') {
// 								contents.style.display = 'none';
// 							} else {
// 								contents.style.display = 'block';
// 							}
// 						});
// 					}
// 				});
// 				marker.on('click', function (event) {
// 					console.log(getDetails(entry['name']));
// 				});
// 			});
// 		});
// }

function searchLocation(doc) {// just add a marker at this location
  console.log("adding markers in "+doc.partnerName+" at "+ 
    "lat: "+ doc.location.latitude +
    "long: "+ doc.location.longitude);
  var marker = L.marker([
    parseFloat(doc.location.latitude),
    parseFloat(doc.location.longitude),
  ]);

  results.addLayer(marker);
  // console.log("Search location of "+ doc.id);
  // let popup = L.popup()
  //   .setLatLng([doc.latitude + 0.00015, doc.longitude] )
  //   .setContent(`
  //   <div class="leaflet-popup-container">
  //   <h2 class="partner-header">${doc.household_name}</h2>          
  //   <div class="partner-contact">${doc.address} ${doc.phase}</div>
  //   `)
  //   .openOn(map);

  
  // map.panTo(new L.LatLng(doc.latitude, doc.longitude));
}

searchControl.on("results", function (data) {
  results.clearLayers();
  for (var i = data.results.length - 1; i >= 0; i--) {
    var marker = L.marker(data.results[i].latlng);
    console.log(marker);
    results.addLayer(marker);
  }
});

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
    <button class="addButton p-5" data-lat="${lat}" data-lng="${lng}">Add Location</button>
  `;

	popup.setLatLng(e.latlng).setContent(popupContent).openOn(map);

	var addButton = document.querySelector('.addButton');
	addButton.addEventListener('click', function () {
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
		modal.classList.add('flex');

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

function panLocation(name) {
  getDocIdByPartnerName(name).then((docId) => {
    getDocByID(docId).then((doc) => {
      console.log(doc);
      console.log(`Panning to ${doc.location.latitude}, ${doc.location.longitude}`);
      map.panTo(new L.LatLng(doc.location.latitude, doc.location.longitude));
      console.log(`Searching for ${doc.partnerName}`);
      searchLocation(doc);
    });
  });
}

document.getElementById('locationList').addEventListener('click', (event) => {
	panLocation(event.target.innerHTML);
});

function getDetails(name) {
	getDocIdByPartnerName(name).then((docId) => {
		if (docId) {
			getDocByID(docId).then((doc) => {
				console.log('Partner details:', doc);
				// Insert the partner details into the div with class "partner-contact"
				const partnerContactDiv =
					document.querySelector('.partner-contact');
				if (partnerContactDiv) {
					doc.activities.forEach((activity) => {
						// current lists down all of activities, revamp if needed
						partnerContactDiv.innerHTML += `
            <div class="partner-info">
              <p class="partner-activity"> ${activity.activityName}</p>
            </div>

            <br>

            <div class="partner-info">
              <p class="partner-label">Contact Person</p>
              <p class="partner-value">${activity.ateneoContactPerson}</p>
            </div>

            <br>            

            <div class="partner-info">
              <p class="partner-label">Organization / Unit</p>
              <p class="partner-value"> ${activity.ateneoOrganization}</p>
            </div>
            
            <br>

            <div class="partner-info">
              <p class="partner-label">Date/s of Partnership</p>
              <p class="partner-value"> ${activity.activityDate.toDate()}</p>   <!-- find a way to format this into just Date -->
            </div>

              <hr>
              <br>
              <h2>Ateneo Office Oversight</h2> 

            <div class="partner-info">          
              <p class="partner-label">${activity.ateneoOverseeingOffice}</p>
              <p class="partner-value"> ${activity.ateneoContactEmail}</p>
              <p class="partner-value"> ${
				activity.ateneoOverseeingOfficeEmail
			}</p>
              </div>
            `;
					});
				} else {
					console.log(
						"Div with class 'partner-contact' not found."
					);
				}
			});
		} else {
			console.log('No matching partner found.');
		}
	});
}

// Show main Add an activity modal
const element = document.getElementById('mainButton');
element.addEventListener('click', showModal);

function showModal() {
	console.log("'Add an activity' button was clicked!");

	var mainModal = document.getElementById('mainModal');
	mainModal.classList.remove('hidden');
	mainModal.classList.add('flex');
}

// Close main Add an activity modal
const elementCloseButton = document.getElementById('closeButton');
elementCloseButton.addEventListener('click', closeModal);

function closeModal() {
	var mainModal = document.getElementById('mainModal');
	mainModal.classList.remove('flex');
	mainModal.classList.add('hidden');
}

// Fuction for filtering results upon searching partners

const newButton = document.getElementById('otherButton');
newButton.addEventListener('click', testFunction);

function testFunction() {
	console.log('The button is working');

	var m = document.getElementById('addModal');
	m.classList.remove('hidden');
	m.classList.add('flex');
}
