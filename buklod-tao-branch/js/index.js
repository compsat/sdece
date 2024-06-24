// import { getPartnersArray, addEntry } from "./firestore.js";
import { getDocIdByPartnerName, getDocByID, setCollection, getCollection, DB } from "/firestore_UNIV.js";
import { getDivContent, addListeners, map } from "/index_UNIV.js";
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

// console.log(colRef);

var buklod = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
});

var test = L.marker([14.673, 121.11215]).bindPopup('Test marker')
var test2 = L.marker([15.673, 121.11215]).bindPopup('Test marker 2')
var test_layers = L.layerGroup([test, test2])

// var map = L.map("map").setView([14.673, 121.11215], 21, [buklod, test_layers]);

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

addListeners();


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

//function to add data to the DB when creating new layer elements
function AddLayerData(layer_name, data) {
  const layers = doc(DB, "geo_data_test", layer_name);

  // "geo_data" is the (tentative) naming convention for the data sub-collection
  addDoc(collection(layers, "geo_data"), {
    geo_data: JSON.stringify(data),
  })
  .then(() => {
    console.log('Document successfully written!');
  })
  .catch((error) => {
    console.error('Error writing document: ', error);
  });
};



// add Leaflet-Geoman controls with some options to the map  
map.pm.addControls({  
	position: 'bottomright',  
	drawCircleMarker: false,
	rotateMode: false,
  });



  map.on('pm:create', function (e) {
  var layer = e.layer;
  var geojson = layer.toGeoJSON();  
  var data = JSON.stringify(geojson)
  console.log(data)
  
  // AddLayerData("Layer3", data)

});

map.on('pm:remove', (e) => {
  console.log(JSON.stringify(e.layer.toGeoJSON()))
})

getDocs(collectionGroup(DB, "geo_data"))
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.data())
    });
  })
  .catch((error) => {
    console.error('Error getting documents: ', error);
  });

// getDocs(collection(DB, "geo_data_test"))
//   .then((querySnapshot) => {
//     querySnapshot.forEach((doc) => {
//       console.log(doc.data())
//     });
//   })
//   .catch((error) => {
//     console.error('Error getting documents: ', error);
//   });



// console.log(map.pm.Toolbar.getControlOrder())
