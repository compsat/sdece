
// import { getPartnersArray, addEntry } from "./firestore.js";
import { getDocIdByPartnerName, getDocByID, setCollection, getCollection, DB } from "/firestore_UNIV.js";
import { getDivContent, searchLocation, panLocation } from "/index_UNIV.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

// const db = getFirestore();
setCollection("buklod-official");
var colRef = getCollection();

//list down all documents under the collection in console.log
const querySnapshot = await getDocs(colRef);
console.log(querySnapshot);
querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
  console.log(doc.id, " => ", doc.data());
});

var map = L.map("map").setView([14.673, 121.11215], 21);


L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var searchControl = L.esri.Geocoding.geosearch().addTo(map);

var results = L.layerGroup().addTo(map);
var popup = L.popup();

// Loads art the start
getDocs(col_ref)
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
        console.log("I DID THIS");
      }
      getDivContent(doc.household_name).then((div) =>{
        marker.bindPopup(div);
        results.addLayer(marker);
      });
    });
  })
  .catch((error) => {
    console.error("Error getting documents: ", error);
  });

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
  console.log()
});





