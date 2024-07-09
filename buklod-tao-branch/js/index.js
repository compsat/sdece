
import {  } from "./firestore.js";
import { getCollection, } from "/firestore_UNIV_v2_mirror.js";
import { addListeners, map } from "/index_UNIV_v2.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

var colRef = getCollection();

map.panTo(new L.LatLng(14.673, 121.11215));

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var searchControl = L.esri.Geocoding.geosearch().addTo(map);
var results = L.layerGroup().addTo(map);
var popup = L.popup();

export function loadMapMarkers(households){
	Object.keys(households).forEach((household) => {
		var marker;
    // Grabs the household of key household
		if (households[household]["location_coordinates"] != null){
			let household_lat = households[household]["location_coordinates"]._lat;
			let household_long = households[household]["location_coordinates"]._long;

			marker = L.marker([
				parseFloat(household_lat),
				parseFloat(household_long),
			]);
      
      results.addLayer(marker);
      var popupContent = `
        <div class="partner-popup font-montserrat text-darkbg !text-center	" id="`;
      // makes the id of the partner-popup household (temporary, may change for security)
      popupContent += household;
      popupContent += `">`;
      popupContent += households[household]["household_name"];
      popupContent += `</div>`;

      marker.bindPopup(popupContent);
      results.addLayer(marker);
      
      marker.on('popupopen', function () {
        console.log('Clicked on ' + household.household_name + ' pin!');

        var test = document.getElementById(household);
        test.addEventListener('click', function () {
          // Testing
          console.log(
            'Clicked on the pop-up content of ' +
            household.household_name
          );
          showModal(household);
          // TODO: call showModal(household) here! Not super sure what the partner object should be in this case
        });
      });
      }
      

	});

  addListeners(households, "household_name","location_coordinates");

}



// function to store the html for info display on pin click
function onPinClick(doc){
  let leaflet_html =
  `
  <div class="leafletPopupContainer" id="leafletModal">
    <div class="leafletHeader">
      <label>${doc.household_name}</label>
    </div>
    <div class="leafletContent">
      <br>
      <div styel="line-height: 1px;">
        <p>${doc.contact_number}</p>
        <p>${doc.household_address}</p>
      </div>
      <div class="modal-line">
        <label class="leafletLabel">Residency Status</label>
        <label class="leafletLabel">Part of HOA/NOA</label>
      </div>
      <div class="modal-line" style="line-height: 3px; margin-bottom: 2px;">
        <p class="leafletDetails">${doc.residency_status}</p>
        <p class="leafletDetails">${doc.is_hoa_noa}</p>
      </div>
      <div style="line-height: 3px; margin-bottom: 2px;">
        <label class="leafletLabel">Nearest Evacuation Area</label>
        <p class="leafletDetails">${doc.nearest_evac}</p>
      </div>
    <div>
      <div class="leafletSubHeader">
        <label>Risk Levels</label>
      </div>
      <div class="modal-line">
        <label class="leafletLabel">Earthquake</label>
        <label class="leafletLabel">RISK LEVEL</label>
      </div>
      <div>
        <p class="leafletDetails">${doc.earthquake_risk}</p>
      </div>
      <div class="modal-line">
        <label class="leafletLabel">Fire</label>
        <label class="leafletLabel">RISK LEVEL</label>
      </div>
      <div>
        <p class="leafletDetails">${doc.fire_risk}</p>
      </div>
      <div class="modal-line">
        <label class="leafletLabel">Flood</label>
        <label class="leafletLabel">RISK LEVEL</label>
      </div>
      <div>
        <p class="leafletDetails">${doc.flood_risk}</p>
      </div>
      <div class="modal-line">
        <label class="leafletLabel">Landslide</label>
        <label class="leafletLabel">RISK LEVEL</label>
      </div>
      <div>
        <p class="leafletDetails">${doc.landslide_risk}</p>
      </div>
      <div class="modal-line">
        <label class="leafletLabel">Storm</label>
        <label class="leafletLabel">RISK LEVEL</label>
      </div>
      <div>
        <p class="leafletDetails">${doc.storm_risk}</p>
      </div>
    </div>
    <div>
      <div class="leafletSubHeader">
        <label>Residents</label>
      </div>
      <div class="modal-line">
        <label class="leafletLabel">Total</label>
        <label class="leafletLabel">${doc.number_residents}</label>
      </div>
      <hr style="border-top: 1px solid #CBD5E0;">
      <div class="modal-line">
        <label class="leafletLabel">Minors</label>
        <label class="leafletLabel">${doc.number_minors}</label>
      </div>
      <br>
      <div class="modal-line">
        <label class="leafletLabel">Seniors</label>
        <label class="leafletLabel">${doc.number_seniors}</label>
      </div>
      <br>
      <div class="modal-line">
        <label class="leafletLabel">PWD</label>
        <label class="leafletLabel">${doc.number_pwd}</label>
      </div>
      <br>
      <div class="modal-line">
        <label class="leafletLabel">Sick</label>
        <label class="leafletLabel">${doc.number_sick}</label>
      </div>
      <br>
      <div class="modal-line">
        <label class="leafletLabel">Pregnant</label>
        <label class="leafletLabel">${doc.number_pregnant}</label>
      </div>
      </div>
    </div>
  </div>       
  `
  ;
  return leaflet_html;
}

// // Loads art the start
// getDocs(colRef)
//   .then((querySnapshot) => {
//     querySnapshot.forEach((entry) => {
//       var doc = entry.data();
//       var marker = L.marker([0, 0]);
//       //console.log(doc);
//       if(doc.location_coordinates != null){
//
//         marker = L.marker([
//           parseFloat(doc.location_coordinates._lat),
//           parseFloat(doc.location_coordinates._long),
//         ]);
//       }
//       // shows partner info on pin click
//       var popupContent = onPinClick(doc);
//       marker.bindPopup(popupContent);
//       results.addLayer(marker);
//     });
//   })
//   .catch((error) => {
//     console.error("Error getting documents: ", error);
//   });


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
          modal.classList.remove('flex');
        }
      };
    });
  }
  
//// Event Listeners
searchControl.on("results", function (data) {
  console.log(data);
  results.clearLayers();
  for (var i = data.results.length - 1; i >= 0; i--) {
    var marker = L.marker(data.results[i].latlng);
    //console.log(marker);
    results.addLayer(marker);
  }
});
//
// //script for add household modal
//
// // modal
// var formModal = document.getElementById("formModal");
//
// // open modal
// var openForm = document.getElementById("addHousehold");
//
// // Get the <span> element that closes the modal
// var closeForm = document.getElementsByClassName("closeForm")[0];
//
// // When the user clicks the button, open the modal 
// openForm.onclick = function() {
//   formModal.style.display = "block";
// }
//
// // When the user clicks on <span> (x), close the modal
// closeForm.onclick = function() {
//   formModal.style.display = "none";
// }
//
// // Closing the modal if the user clicks outside of it 
// window.onclick = function(event) {
//   if (event.target == formModal) {
//     formModal.style.display = "none";
//   }
//   if (event.target == partnerModal) {
//     partnerModal.style.display = "none";
//   }
// };
