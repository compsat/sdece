import { getPartnersArray, addEntry } from "./firestore.js";
import { getDocIdByPartnerName, getDocByID, setCollection, getCollection, DB, AddLayerData, LayerDataList, LayerDataDelete } from "/firestore_UNIV.js";
import { getDivContent, addListeners } from "/index_UNIV.js";
import {
  collectionGroup,
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

// const db = getFirestore();
setCollection("buklod-official");
var colRef = getCollection();
let layer_data_list = []

var base_collection = "geo_data_test"
var layer_group_collection = "Layer1"
var layer_group_sub = "geo_data"
var layer_group_sub_attr = "geo_data"

// console.log(colRef);

var buklod = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
});

var test = L.marker([14.673, 121.11215]).bindPopup('Test marker')
var test2 = L.marker([15.673, 121.11215]).bindPopup('Test marker 2')
var test_layers = L.layerGroup([test, test2])



var map = L.map('map', {
  center: [14.673, 121.11215],
  zoom: 21,
  layers: [buklod, test_layers]
});

var baseMaps = {
	'Buklod': buklod
};

var overlayMaps = {
    'test': test_layers
};

L.control.layers(baseMaps, overlayMaps, { position: 'bottomright' }).addTo(map);

var searchControl = L.esri.Geocoding.geosearch().addTo(map);

var results = L.layerGroup().addTo(map);
var popup = L.popup();

// Loads art the start
getDocs(colRef)
  .then((querySnapshot) => {
    querySnapshot.forEach((entry) => {
      var doc = entry.data();
      // console.log(doc);
      var marker = L.marker([
        parseFloat(doc.location_coordinates._lat),
        parseFloat(doc.location_coordinates._long),
      ]);
      var popupContent = `
      <div class="leaflet-popup-container">
      <h2 class="partner-header">${doc.household_name}</h2>          
      <div class="partner-contact">${doc.household_address} ${doc.phase}</div>
        `;
      marker.bindPopup(popupContent);
      results.addLayer(marker);
    });
  })
  .catch((error) => {
    console.error("Error getting documents: ", error);
  });

// addListeners();


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
        else {
          console.log("No matching partner found.");
        }
    }});
  }

// add Leaflet-Geoman controls with some options to the map  
map.pm.addControls({  
	position: 'bottomright',  
	drawCircleMarker: false,
	rotateMode: false,
  });


//function to add data to the DB when creating new layer elements
map.on('pm:create', function (e) {
  var layer = e.layer;
  var geojson = layer.toGeoJSON();  
  var data = JSON.stringify(geojson)
  console.log(data)
  
  AddLayerData(layer_group_collection, data, base_collection, layer_group_sub)
  // First parameter takes the name of the layer group collection the data should go to.
  // Third parameter takes the name of the base collection containing the data (precedes layer collection). 
  // Fourth parameter takes the name of the sub collection under the layer collection that should contain the geoJSON data.
  // Collection order: Base collection > Layer group subcollection/doc > Layer data subcollection/doc > Layer geodata/doc
});

//function to remove data from the DB when erasing layer elements
map.on('pm:remove', (e) => {
  // Sends GeoJSON data to the function to determine which layer was deleted 
  // Yes the attribute data field in the database is a string and not an Object. It works, I don't care
  console.log(JSON.stringify(e.layer.toGeoJSON()))
  LayerDataDelete(JSON.stringify(e.layer.toGeoJSON()), layer_group_sub, layer_group_sub_attr)
  // Second parameter takes the name of the collection group holding the data geoJSON data. 
  // Third parameter takes the name of the attribute data in the collection group.

})

//function to load layer data to the map on load
LayerDataList(layer_group_sub, layer_data_list)
// First parameter takes the name of the collection group containing the geoJSON data 
.then(() => {
    layer_data_list.forEach((layer) => {

      console.log(layer.data().geo_data)
        L.geoJSON(JSON.parse(layer.data().geo_data)).addTo(map);
        // Adds the layer data to the map
        // Can still add a bindpopup stored from the database to display data. Would require assistance from frontend to implement  

    })
  })
  .catch((error) => {
    console.error('Error fetching layer data: ', error);
  })
