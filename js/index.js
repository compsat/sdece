import { getDocIdByPartnerName, getDocByID } from "./firestore.js";

var map = L.map("map").setView([14.651, 121.052], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var searchControl = L.esri.Geocoding.geosearch().addTo(map);

var results = L.layerGroup().addTo(map);
var popup = L.popup();

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
      json.forEach(function (entry, index) {
        var marker = L.marker([
          parseFloat(entry["lat"]),
          parseFloat(entry["lon"]),
        ]);
        var popupContent = `
        <div class="leaflet-popup-container">
          <h2 class="partner-header">${loc}</h2>          
          <div class="partner-contact">
          </div>
          <div class="leaflet-buttons">
          <div class="deleteButton" data-loc="${loc}">Delete<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M10 10C10.5523 10 11 10.4477 11 11V17C11 17.5523 10.5523 18 10 18C9.44772 18 9 17.5523 9 17V11C9 10.4477 9.44772 10 10 10Z" fill="#D64747"/>
  <path d="M15 17V11C15 10.4477 14.5523 10 14 10C13.4477 10 13 10.4477 13 11V17C13 17.5523 13.4477 18 14 18C14.5523 18 15 17.5523 15 17Z" fill="#D64747"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M7 5V4C7 3.20435 7.31607 2.44129 7.87868 1.87868C8.44129 1.31607 9.20435 1 10 1H14C14.7956 1 15.5587 1.31607 16.1213 1.87868C16.6839 2.44129 17 3.20435 17 4V5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H20V20C20 20.7957 19.6839 21.5587 19.1213 22.1213C18.5587 22.6839 17.7957 23 17 23H7C6.20435 23 5.44129 22.6839 4.87868 22.1213C4.31607 21.5587 4 20.7957 4 20V7H3C2.44772 7 2 6.55228 2 6C2 5.44772 2.44772 5 3 5H7ZM9.29289 3.29289C9.48043 3.10536 9.73478 3 10 3H14C14.2652 3 14.5196 3.10536 14.7071 3.29289C14.8946 3.48043 15 3.73478 15 4V5H9V4C9 3.73478 9.10536 3.48043 9.29289 3.29289ZM6 7V20C6 20.2652 6.10536 20.5196 6.29289 20.7071C6.48043 20.8946 6.73478 21 7 21H17C17.2652 21 17.5196 20.8946 17.7071 20.7071C17.8946 20.5196 18 20.2652 18 20V7H6Z" fill="#D64747"/>
</svg></div>
          <div class="editButton" data-loc="${loc}">Edit<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M20 0.878662C19.1722 0.878662 18.3783 1.20751 17.7929 1.79288L8.29289 11.2929C8.16473 11.421 8.07382 11.5816 8.02986 11.7574L7.02986 15.7574C6.94466 16.0982 7.04451 16.4587 7.29289 16.7071C7.54127 16.9555 7.90176 17.0553 8.24254 16.9701L12.2425 15.9701C12.4184 15.9262 12.5789 15.8352 12.7071 15.7071L22.2071 6.20709C22.7925 5.62173 23.1213 4.82781 23.1213 3.99998C23.1213 3.17216 22.7925 2.37824 22.2071 1.79288C21.6217 1.20751 20.8278 0.878662 20 0.878662ZM19.2071 3.20709C19.4174 2.9968 19.7026 2.87866 20 2.87866C20.2974 2.87866 20.5826 2.9968 20.7929 3.20709C21.0032 3.41738 21.1213 3.70259 21.1213 3.99998C21.1213 4.29737 21.0032 4.58259 20.7929 4.79288L11.4888 14.097L9.37437 14.6256L9.90296 12.5112L19.2071 3.20709Z" fill="#3d97af"/>
          <path d="M4 3C3.20435 3 2.44129 3.31607 1.87868 3.87868C1.31607 4.44129 1 5.20435 1 6V20C1 20.7957 1.31607 21.5587 1.87868 22.1213C2.44129 22.6839 3.20435 23 4 23H18C18.7957 23 19.5587 22.6839 20.1213 22.1213C20.6839 21.5587 21 20.7957 21 20V13C21 12.4477 20.5523 12 20 12C19.4477 12 19 12.4477 19 13V20C19 20.2652 18.8946 20.5196 18.7071 20.7071C18.5196 20.8946 18.2652 21 18 21H4C3.73478 21 3.48043 20.8946 3.29289 20.7071C3.10536 20.5196 3 20.2652 3 20V6C3 5.73478 3.10536 5.48043 3.29289 5.29289C3.48043 5.10536 3.73478 5 4 5H11C11.5523 5 12 4.55228 12 4C12 3.44772 11.5523 3 11 3H4Z" fill="#3d97af"/>
          </svg></div>
          </div>
        </div>
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
        marker.on("click", function (event) {
          console.log(getDetails(entry["name"]));
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

function onMapClick(e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  var popupContent = `
      <div class="partner-geolocation">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C11.337 11.5 10.7011 11.2366 10.2322 10.7678C9.76339 10.2989 9.5 9.66304 9.5 9C9.5 8.33696 9.76339 7.70107 10.2322 7.23223C10.7011 6.76339 11.337 6.5 12 6.5C12.663 6.5 13.2989 6.76339 13.7678 7.23223C14.2366 7.70107 14.5 8.33696 14.5 9C14.5 9.66304 14.2366 10.2989 13.7678 10.7678C13.2989 11.2366 12.663 11.5 12 11.5Z" fill="#91C9DB"/>
            </svg>
            ${lat} + ${lng}
            <br>
        </div>
    <button class="addButton" data-lat="${lat}" data-lng="${lng}">Add Location</button>
  `;

  popup.setLatLng(e.latlng).setContent(popupContent).openOn(map);

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
map.panTo(new L.LatLng(14.652538, 121.077818));

function panLocation(name) {
  getDocIdByPartnerName(name).then((docId) => {
    getDocByID(docId).then((doc) => {
      console.log(doc);
      console.log(`Panning to ${doc.location.latitude}, ${doc.location.longitude}`);
      map.panTo(new L.LatLng(doc.location.latitude, doc.location.longitude));
      console.log(`Searching for ${doc.partnerName}`);
      searchLocation(doc.partnerName);
    });
  });
}

document.getElementById("locationList").addEventListener("click", (event) => {
  panLocation(event.target.innerHTML);
});

function getDetails(name) {
  getDocIdByPartnerName(name).then((docId) => {
    if (docId) {
      getDocByID(docId).then((doc) => {
        console.log("Partner details:", doc);
        // Insert the partner details into the div with class "partner-contact"
        const partnerContactDiv = document.querySelector(".partner-contact");
        if (partnerContactDiv) {
          doc.activities.forEach( (activity) => {       // current lists down all of activities, revamp if needed
            partnerContactDiv.innerHTML += `
            <div class="partner-info">
              <p class="partner-activity"> ${activity.activityName}</p>
            </div>

            <div class="partner-info">
              <p class="partner-label">Contact Person</p>
              <p class="partner-value">${activity.ateneoContactPerson}</p>
            </div>

            <div class="partner-info">
              <p class="partner-label">Organization / Unit</p>
              <p class="partner-value"> ${activity.ateneoOrganization}</p>
            </div>
            

            <div class="partner-info">
              <p class="partner-label">Date/s of Partnership</p>
              <p class="partner-value"> ${activity.activityDate.toDate()}</p>   <!-- find a way to format this into just Date -->
            </div>

              <hr>
              <h2>Ateneo Office Oversight</h2> 

            <div class="partner-info">          
              <p class="partner-label">${activity.ateneoOverseeingOffice}</p>
              <p class="partner-value"> ${activity.ateneoContactEmail}</p>
              <p class="partner-value"> ${activity.ateneoOverseeingOfficeEmail}</p>
              </div>
            
            `;
          });
          
        } else {
          console.log("Div with class 'partner-contact' not found.");
        }
      });
    } else {
      console.log("No matching partner found.");
    }
  });
}
