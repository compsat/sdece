import {populateEditForm, getPartnersArray } from './firestore.js';
import {
  getDocIdByPartnerName,
  getDocByID,
  setCollection,
  getCollection,
  DB,
  addEntry,
  BUKLOD_RULES_TEST,
} from '/js/firestore_UNIV.js';
import { addListeners, map } from '/js/index_UNIV.js';
import {
  getFirestore,
  collection,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';
import evacCenters from '/hardcode/evac-centers.json' with {type: 'json'};


console.log("index");

var colRef = getCollection();

map.panTo(new L.LatLng(14.673, 121.11215));


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

var searchControl = L.esri.Geocoding.geosearch().addTo(map);

var results = L.layerGroup().addTo(map);
var popup = L.popup();

var partnersArray = getPartnersArray();

// function to store the html for info display on pin click
function onPinClick(doc) {
  function riskBadge(level) {
    if (!level) return '';
    const l = level.trim().toUpperCase();
    if (l === 'HIGH') return '<span class="risk-badge risk-high">HIGH RISK</span>';
    if (l === 'MEDIUM') return '<span class="risk-badge risk-medium">MEDIUM RISK</span>';
    if (l === 'LOW') return '<span class="risk-badge risk-low">LOW RISK</span>';
    return `<span class=\"risk-badge\">${l}</span>`;
  }
  function parseRisk(risk) {
    if (!risk) return {level: '', desc: ''};
    const parts = risk.split(':');
    return {level: (parts[0]||'').replace('RISK','').replace(/_/g,'').trim(), desc: (parts[1]||'').trim()};
  }
  const eq = parseRisk(doc.earthquake_risk);
  const fire = parseRisk(doc.fire_risk);
  const flood = parseRisk(doc.flood_risk);
  const landslide = parseRisk(doc.landslide_risk);
  const storm = parseRisk(doc.storm_risk);
  let leaflet_html = `
  <div class="popup-card">
    <div class="popup-title">${doc.household_name||''}</div>
    <div class="popup-phone">
      <span style="display:inline-flex;align-items:center;">
        <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\" style=\"width:1.1em;height:1.1em;color:#888ea8;fill:#888ea8;vertical-align:middle;\"><path d=\"M9.36556 10.6821C10.302 12.3288 11.6712 13.698 13.3179 14.6344L14.2024 13.3961C14.4965 12.9845 15.0516 12.8573 15.4956 13.0998C16.9024 13.8683 18.4571 14.3353 20.0789 14.4637C20.599 14.5049 21 14.9389 21 15.4606V19.9234C21 20.4361 20.6122 20.8657 20.1022 20.9181C19.5723 20.9726 19.0377 21 18.5 21C9.93959 21 3 14.0604 3 5.5C3 4.96227 3.02742 4.42771 3.08189 3.89776C3.1343 3.38775 3.56394 3 4.07665 3H8.53942C9.0611 3 9.49513 3.40104 9.5363 3.92109C9.66467 5.54288 10.1317 7.09764 10.9002 8.50444C11.1427 8.9484 11.0155 9.50354 10.6039 9.79757L9.36556 10.6821ZM6.84425 10.0252L8.7442 8.66809C8.20547 7.50514 7.83628 6.27183 7.64727 5H5.00907C5.00303 5.16632 5 5.333 5 5.5C5 12.9558 11.0442 19 18.5 19C18.667 19 18.8337 18.997 19 18.9909V16.3527C17.7282 16.1637 16.4949 15.7945 15.3319 15.2558L13.9748 17.1558C13.4258 16.9425 12.8956 16.6915 12.3874 16.4061L12.3293 16.373C10.3697 15.2587 8.74134 13.6303 7.627 11.6707L7.59394 11.6126C7.30849 11.1044 7.05754 10.5742 6.84425 10.0252Z\"></path></svg>
      </span>
      ${doc.contact_number||''}
    </div>
    <div class="popup-section">
      <div class="popup-label">Residency Status</div>
      <div class="popup-value">${doc.residency_status||''}</div>
      <div class="popup-label">Part of HOA/NOA</div>
      <div class="popup-value">${doc.is_hoa_noa||''}</div>
      <div class="popup-label">Evacuation Area</div>
      <div class="popup-value">${doc.nearest_evac||doc.nearest_evac_area||''}</div>
    </div>
    <div class="popup-section" style="margin-top:1.2rem;">
      <div class="popup-label risk-header">
        <span style="display:inline-flex;align-items:center;">
          <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\" style=\"width:1.1em;height:1.1em;color:#181c26;fill:#181c26;vertical-align:middle;\"><path d=\"M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z\"></path></svg>
        </span>
        Risk Levels
      </div>
      <div class="risk-cards">
        <div class="risk-card ${eq.level ? 'risk-'+eq.level.toLowerCase() : ''}"><div class="risk-type">Earthquake</div><div>${riskBadge(eq.level)}</div><div class="risk-desc">${eq.desc}</div></div>
        <div class="risk-card ${fire.level ? 'risk-'+fire.level.toLowerCase() : ''}"><div class="risk-type">Fire</div><div>${riskBadge(fire.level)}</div><div class="risk-desc">${fire.desc}</div></div>
        <div class="risk-card ${flood.level ? 'risk-'+flood.level.toLowerCase() : ''}"><div class="risk-type">Flood</div><div>${riskBadge(flood.level)}</div><div class="risk-desc">${flood.desc}</div></div>
        <div class="risk-card ${landslide.level ? 'risk-'+landslide.level.toLowerCase() : ''}"><div class="risk-type">Landslide</div><div>${riskBadge(landslide.level)}</div><div class="risk-desc">${landslide.desc}</div></div>
        <div class="risk-card ${storm.level ? 'risk-'+storm.level.toLowerCase() : ''}"><div class="risk-type">Storm</div><div>${riskBadge(storm.level)}</div><div class="risk-desc">${storm.desc}</div></div>
      </div>
    </div>
  </div>`;
  return leaflet_html;
}

/*
// Loads art the start
getDocs(colRef)
  .then((querySnapshot) => {
    querySnapshot.forEach((entry) => {
      var doc = entry.data();
      
      if (doc.location_coordinates != null) {
        var marker = L.marker([0, 0]);
        marker = L.marker([
          parseFloat(doc.location_coordinates._lat),
          parseFloat(doc.location_coordinates._long),
        ]);
        // shows partner info on pin click
      var popupContent = onPinClick(doc);
      marker.bindPopup(popupContent);
      marker.on('popupopen', function(e) {
        var editBtn = document.getElementById('editHouseholdPopup')
        if (editBtn) {
          editBtn.addEventListener('click', function() {
            const modal = document.getElementById('partnerModal');
            var editFormModal = document.getElementById('editModal');
            editFormModal.style.display = 'block';
            modal.style.display = 'none';
            populateEditForm(doc, editFormModal)
          })
        }
      })
      results.addLayer(marker);
      }
      
    });
  }).catch((error) => {
    console.error('Error getting documents: ', error);
  });
*/
evacCenters.forEach(center => {
  const marker = L.marker(
    [center.latitude, center.longitude],
    {icon: L.icon({
      iconUrl: "/hardcode/evac.svg",
      iconSize: [39,39],
      popupAnchor: [0.5, -15]
    })}
  ).addTo(map);

  marker.bindPopup(`
    <div class = "evac-marker-header">${center.type}</div>
    <div style = "text-align:center;">
      <b>${center.name}</b>
      <br>Location: ${center.latitude}, ${center.longitude}
    </div>`);
});

partnersArray.forEach((partner) => {
    var doc = partner;
    if (doc.location_coordinates != null) {
      var this_marker = partner.marker;
      //console.log(doc.location_coordinates);
      this_marker = L.marker([
        parseFloat(doc.location_coordinates._lat),
        parseFloat(doc.location_coordinates._long),
      ]);

      // shows partner info on pin click
      var popupContent = onPinClick(doc);
      this_marker.bindPopup(popupContent);
      this_marker.on('popupopen', function(e) {
        var editBtn = document.getElementById('editHouseholdPopup')
        if (editBtn) {
          editBtn.addEventListener('click', function() {
            const modal = document.getElementById('partnerModal');
            var editFormModal = document.getElementById('editModal');
            editFormModal.style.display = 'block';
            modal.style.display = 'none';
            populateEditForm(doc, editFormModal)
          })
        }
      })
      results.addLayer(this_marker);
      Object.defineProperty(partner, "marker", {value:this_marker, configurable: true});
    }
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
    <button id="mainButton" class="addButton p-5" data-lat="${lat}" data-lng="${lng}">Add Household</button>`;

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

    // Set the coordinates based on the pin drop
    modal.getElementsByTagName('iframe')[0].contentWindow.document.getElementById('location_coordinates').value = lat + '+' + lng;

 // Handle form submission
  var addHouseholdFrom = document.getElementById('addHouseholdForm')
  if (addHouseholdFrom) {
    addHouseholdFrom.addEventListener('submit', function (event) {
      event.preventDefault();

      const householdData = {
        household_name: document.getElementById('household_name').value,
        contact_number: document.getElementById('contact_number').value,
        household_address: document.getElementById('household_address').value,
        residency_status: document.getElementById('residency_status').value,
        is_hoa_noa: document.getElementById('is_hoa_noa').value,
        nearest_evac: document.getElementById('nearest_evac').value,
        earthquake_risk: document.getElementById('earthquake_risk').value,
        fire_risk: document.getElementById('fire_risk').value,
        flood_risk: document.getElementById('flood_risk').value,
        landslide_risk: document.getElementById('landslide_risk').value,
        storm_risk: document.getElementById('storm_risk').value,
        number_residents: document.getElementById('number_residents').value,
        number_minors: document.getElementById('number_minors').value,
        number_seniors: document.getElementById('number_seniors').value,
        number_pwd: document.getElementById('number_pwd').value,
        number_sick: document.getElementById('number_sick').value,
        number_pregnant: document.getElementById('number_pregnant').value,
        location_coordinates: new firebase.firestore.GeoPoint(parseFloat(lat), parseFloat(lng))
      };

      addDoc(colRef, householdData)
        .then(() => {
          alert('Household added successfully!');
          modal.classList.add('hidden');
          modal.classList.remove('flex');
          location.reload(); // Reload the map to show the new marker
        })
        .catch((error) => {
          console.error('Error adding document: ', error);
        });
    });
  }


    // Close the modal when the user clicks anywhere outside of it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    };
  });
}

map.on('click', onMapClick);

//// Event Listeners
searchControl.on('results', function (data) {
  console.log(data);
  results.clearLayers();
  for (var i = data.results.length - 1; i >= 0; i--) {
    var marker = L.marker(data.results[i].latlng);
    //console.log(marker);
    results.addLayer(marker);
  }
});

//script for add household modal

// modal
var formModal = document.getElementById('addModal');

// open modal
var openForm = document.getElementById('mainButton');

// Get the <span> element that closes the modal
var closeForm = document.getElementsByClassName('closeForm')[0];

// When the user clicks the button, open the modal
if(openForm) {
  openForm.onclick = function() {
    formModal.style.display = "block";
  }

  openForm.addEventListener('click', function () {
    formModal.style.display = 'block';
  });
}

if(closeForm) {
  closeForm.addEventListener('click', function () {
    formModal.style.display = 'none';
  });
}

// Closing the modal if the user clicks outside of it
window.onclick = function (event) {
  if (event.target == formModal) {
    formModal.style.display = 'none';
  }
  if (event.target == partnerModal) {
    partnerModal.style.display = 'none';
  }
};

function addMainButtonText() {
  var mainButtonText = document.getElementById('mainButtonText');
  if(mainButtonText) {
    mainButtonText.innerHTML = 'Add a household';
  }
}

addMainButtonText();
