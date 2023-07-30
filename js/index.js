import { getDocIdByPartnerName, getDocByID } from "./firestore.js";

var map = L.map("map").setView([14.651, 121.052], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var searchControl = L.esri.Geocoding.geosearch().addTo(map);

var results = L.layerGroup().addTo(map);
var popup = L.popup();

// function onclickmarker(e)
// {
// 	popup.setLatLng(e.latlng)
// 		.setContent("You clicked the popup at " + e.latlng.toString())
// 		.openOn(map);
// }

/* 
	API call for searching, use for a search bar, returns a list based on this link:
	https://nominatim.openstreetmap.org/ui/search.html

	Create a search function to implement this.

	Currently, upon calling this, markers will be created in the map that satisfies these locations, otherwise none.
*/
async function searchLocation(loc) {
  var parsed_loc = encodeURIComponent(
    loc.toLowerCase().replace(/[^a-z0-9 _-]+/gi, "-")
  );
  var api_search = "https://nominatim.openstreetmap.org/search?q=";
  var link = api_search.concat(parsed_loc).concat("&format=json");
  console.log(link);

  var response = await fetch(link);

  fetch(link)
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      json.forEach(function (entry, index) {
        console.log(entry);
        var marker = L.marker([
          parseFloat(entry["lat"]),
          parseFloat(entry["lon"]),
        ]);
        var popupContent = `
          <b>${loc}</b>          
		  <br>
          <button class="editButton" data-loc="${loc}">Edit Location</button>
        `;
        marker.bindPopup(popupContent);
        results.addLayer(marker);
        marker.on("popupopen", function () {
          var editButtons = document.getElementsByClassName("editButton");
          for (var i = 0; i < editButtons.length; i++) {
            editButtons[i].addEventListener("click", function () {
              var partnerName = this.getAttribute("data-loc");
              window.open(
                `editloc.html?partnerName=${encodeURIComponent(partnerName)}`,
                "_blank"
              );
            });
          }
        });
      });
    });
}

searchControl.on("results", function (data) {
  results.clearLayers();
  for (var i = data.results.length - 1; i >= 0; i--) {
    var marker = L.marker(data.results[i].latlng);
    console.log(marker);
    results.addLayer(marker);
  }
});

// var map = L.map('map').setView([14.651, 121.052], 13);
// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
// 	maxZoom: 19,
// 	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
// }).addTo(map);

// var marker = L.marker([14.6504432,121.0752025]).addTo(map);
// var marker2 = L.marker([14.6398666,121.0762999]).addTo(map);
// var popup = L.popup();

// function onclickmarker(e)
// {

// 	popup.setLatLng(e.latlng)
// 		.setContent("You clicked the map at " + e.latlng.toString())
// 		.openOn(map);
// }
// marker.on('click', onclickmarker);
// marker2.on('click', onclickmarker);

function onMapClick(e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  var popupContent = `
    <p>Location: ${lat}, ${lng}</p>
    <button class="addButton" data-lat="${lat}" data-lng="${lng}">Add Location</button>
  `;

  popup.setLatLng(e.latlng).setContent(popupContent).openOn(map);

  // Add event listener to the "Add Location" button
  var addButton = document.querySelector(".addButton");
  addButton.addEventListener("click", function () {
    const lat = this.getAttribute("data-lat");
    const lng = this.getAttribute("data-lng");

    window.open(
      `addloc.html?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(
        lng
      )}`,
      "_blank"
    );
  });
}

map.on("click", onMapClick);



//search loc through name, check if present in firebase
//get latlng through firebase, then call searchloc, and then pan through the latlng in firebase

function panLocation(name) {
  getDocIdByPartnerName(name).then((docId) => {
    getDocByID(docId).then((doc) => {
      console.log(doc);
      console.log(`Panning to ${doc.Latitude}, ${doc.Longitude}`);
      map.panTo(new L.LatLng(doc.Latitude, doc.Longitude));
      console.log(`Searching for ${doc.name}`);
      searchLocation(doc.name);
    });
  });
}

document.getElementById("locationList").addEventListener("click", (event) => {
  panLocation(event.target.innerHTML);
});
