
import {  } from "./firestore.js";
import { getDocIdByPartnerName, getDocByID, setCollection, getCollection, DB } from "/firestore_UNIV.js";
import { getDivContent, searchLocation, panLocation } from "/index_UNIV.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

var colRef = getCollection();

var map = L.map("map").setView([14.673, 121.11215], 21);


L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var searchControl = L.esri.Geocoding.geosearch().addTo(map);

var results = L.layerGroup().addTo(map);
var popup = L.popup();

// Loads art the start
getDocs(colRef)
  .then((querySnapshot) => {
    querySnapshot.forEach((entry) => {
      var doc = entry.data();
      var marker;
      // Some coordinated are null, protective check
      if(doc.location_coordinates != null){
        marker = L.marker([
          parseFloat(doc.location_coordinates.latitude),
          parseFloat(doc.location_coordinates.longitude),
        ])
      }
      // TODO HAVE THIS BE CONSISTENT ACROSS EVERYTHING
      getDivContent(doc.household_name).then((div) =>{
        marker.bindPopup(div);
        results.addLayer(marker);
      });
    });
  })
  .catch((error) => {
    console.error("Error getting documents: ", error);
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

document.getElementById("locationList").addEventListener("click", (event) => {
  searchLocation(event.target.innerHTML, map);
  console.log("searching")
});

map.on('click', onMapClick);

