// CODE LOGIC FOR IMPORTING OF FUNCTIONS
// ------------------------------------------
import {populateEditForm, getPartnersArray } from './firestore.js';
import {
  getDocIdByPartnerName,
  getDocByID,
  setCollection,
  getCollection,
  filterData,
  deleteEntry,
  DB,
  BUKLOD_RULES,
} from '../../js/firestore_UNIV.js';
import { addListeners, clearMarkers, map } from '../../js/index_UNIV.js';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';
// Evacuation centers are loaded exclusively from the `buklod-evac-centers` Firestore collection.
let evacCenters = [];

async function loadEvacCentersFromFirestore() {
  try {
    const snapshot = await getDocs(collection(DB, 'buklod-evac-centers'));
    snapshot.forEach(snap => {
      const d = snap.data();
      if (!d || d.latitude == null || d.longitude == null || !d.name || !d.type) return;
      evacCenters.push({
        id: snap.id,
        name: d.name,
        latitude: Number(d.latitude),
        longitude: Number(d.longitude),
        type: d.type,
      });
    });
  } catch (err) {
    console.warn('Failed to load evacuation centers from Firestore:', err);
  }
}

await loadEvacCentersFromFirestore();
// ------------------------------------------


// CODE LOGIC FOR SET-UP
// ------------------------------------------
// Pans map to Banaba area upon loading the page
map.setView([14.674043754743689, 121.11081361770631], 18);

// Load Map Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
  
// Get list of households
var partnersArray = getPartnersArray();

// Handle close button clicks for all popups (event delegation)
document.addEventListener('click', function(event) {
  if (event.target.matches('#close-btn, #close-btn *')) {
    event.preventDefault();
    event.stopPropagation();
    map.closePopup();
  }
});

// Handle Add Household / Add Evacuation Center button clicks from the map popup (event delegation)
document.addEventListener('click', function(event) {
  if (event.target.matches('.addButton')) {
    event.preventDefault();
    event.stopPropagation();

    const lat = event.target.getAttribute('data-lat');
    const lng = event.target.getAttribute('data-lng');
    const target = event.target.getAttribute('data-target') || 'household';
    const osmLink = `https://www.openstreetmap.org/#map=19/${lat}/${lng}`;

    var modal = document.getElementById('addModal');
    var iframe = modal.getElementsByTagName('iframe')[0];

    // Switch the iframe to the right form before showing the modal.
    iframe.src = target === 'evac' ? 'html/addevac.html' : 'html/addloc.html';

    modal.style.display = 'flex';
    modal.classList.remove('closing');

    function populateAddLocationFields() {
      var iframeDocument = iframe.contentWindow.document;
      var locationField = iframeDocument.getElementById('location_coordinates');
      var locationLinkField = iframeDocument.getElementById('location_link');
      var latField = iframeDocument.getElementById('latitude');
      var lngField = iframeDocument.getElementById('longitude');

      if (locationField) locationField.value = `${lat},${lng}`;
      if (latField) latField.value = lat;
      if (lngField) lngField.value = lng;

      if (locationLinkField) {
        locationLinkField.value = osmLink;
        locationLinkField.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // The iframe.src was just reassigned, so onload always fires fresh.
    iframe.onload = populateAddLocationFields;

    // Close the popup after opening modal
    map.closePopup();
  }
});

// Function for populating the navbar entries with households entries
function populateNavBar(condition){
  // Clear the current list
  const locationList = document.getElementById('locationList');
  locationList.innerHTML = '';
  
  var filtered_partners;

  if (condition == null){
    filtered_partners = partnersArray;
  } else {
    // Filter logic implementation goes here
    filtered_partners = condition;
  }

  // Update the household count
  const partnersCount = document.getElementById('partners-count');
  if (partnersCount) {
    partnersCount.textContent = `HOUSEHOLDS (${filtered_partners.size})`;
  }

  filtered_partners.forEach((partner) => {
    // Creating DOM elements
    const containerDiv = document.createElement('div');
    const img = document.createElement('svg');
    const listItem = document.createElement('li');
    const anchor = document.createElement('a');
    const nameDiv = document.createElement('div');
    const addressDiv = document.createElement('div');

    listItem.setAttribute('data-name', partner.household_name);

    // Set attributes
    anchor.href = '#';

    listItem.addEventListener('click', async () => {
      const docId = await getDocIdByPartnerName(partner.household_name);
      const doc = await getDocByID(docId);

      map.setView(partner.marker.getLatLng());
      onPinClick(doc).then(popupHTML => {
        partner.marker.bindPopup(popupHTML, {
          className: 'household-popup'
        }).openPopup();
      });
    });

    // Adding classes and setting text content
    nameDiv.classList.add('name');
    addressDiv.classList.add('address');

    nameDiv.textContent = partner.household_name;
    addressDiv.textContent = [partner.household_address, partner.household_phase].filter(Boolean).join(' ');

    listItem.classList.add('accordion');
    anchor.classList.add('accordion', 'link');
    containerDiv.classList.add('container-entry');

    // Inline edit button (pencil icon, top-right of card)
    const editBtn = document.createElement('button');
    editBtn.classList.add('sidebar-edit-btn');
    editBtn.title = 'Edit household';
    editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
    // Force positioning inline so browser button defaults can't override
    editBtn.style.cssText = 'position:absolute;top:8px;right:8px;width:28px;height:28px;border:none;background:transparent;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6b7280;padding:0;opacity:0;transition:opacity 0.15s ease,background-color 0.15s ease,color 0.15s ease;';
    listItem.style.position = 'relative';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // don't trigger the listItem map-open click
      const editFormModal = document.getElementById('editModal');
      editFormModal.style.display = 'flex';
      editFormModal.classList.remove('closing');
      populateEditForm(partner, editFormModal);
    });
    editBtn.addEventListener('mouseenter', () => {
      editBtn.style.backgroundColor = '#e5e7eb';
      editBtn.style.color = '#1a357b';
    });
    editBtn.addEventListener('mouseleave', () => {
      editBtn.style.backgroundColor = 'transparent';
      editBtn.style.color = '#6b7280';
    });
    listItem.addEventListener('mouseenter', () => { editBtn.style.opacity = '1'; });
    listItem.addEventListener('mouseleave', () => { editBtn.style.opacity = '0'; });

    // Append elements to the DOM
    anchor.appendChild(nameDiv);
    anchor.appendChild(addressDiv);

    listItem.appendChild(anchor);
    listItem.appendChild(editBtn);
    containerDiv.appendChild(img);
    containerDiv.appendChild(listItem);
    locationList.appendChild(containerDiv);
  });
}

// Sidebar entries for evacuation centers — only used when the shelter-type filter is active.
function populateNavBarWithEvacCenters(centers) {
  const locationList = document.getElementById('locationList');
  locationList.innerHTML = '';

  const partnersCount = document.getElementById('partners-count');
  if (partnersCount) {
    partnersCount.textContent = `EVACUATION CENTERS (${centers.length})`;
  }

  centers.forEach((center) => {
    const containerDiv = document.createElement('div');
    const listItem = document.createElement('li');
    const anchor = document.createElement('a');
    const nameDiv = document.createElement('div');
    const addressDiv = document.createElement('div');

    listItem.setAttribute('data-name', center.name);
    anchor.href = '#';

    listItem.addEventListener('click', () => {
      if (center.marker) {
        map.setView(center.marker.getLatLng());
        center.marker.openPopup();
      }
    });

    nameDiv.classList.add('name');
    addressDiv.classList.add('address');
    nameDiv.textContent = center.name;
    addressDiv.textContent = center.type;

    listItem.classList.add('accordion');
    anchor.classList.add('accordion', 'link');
    containerDiv.classList.add('container-entry');

    const editBtn = document.createElement('button');
    editBtn.classList.add('sidebar-edit-btn');
    editBtn.title = 'Edit evacuation center';
    editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
    editBtn.style.cssText = 'position:absolute;top:8px;right:8px;width:28px;height:28px;border:none;background:transparent;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6b7280;padding:0;opacity:0;transition:opacity 0.15s ease,background-color 0.15s ease,color 0.15s ease;';
    listItem.style.position = 'relative';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditEvacModal(center.id);
    });
    editBtn.addEventListener('mouseenter', () => {
      editBtn.style.backgroundColor = '#e5e7eb';
      editBtn.style.color = '#1a357b';
    });
    editBtn.addEventListener('mouseleave', () => {
      editBtn.style.backgroundColor = 'transparent';
      editBtn.style.color = '#6b7280';
    });
    listItem.addEventListener('mouseenter', () => { editBtn.style.opacity = '1'; });
    listItem.addEventListener('mouseleave', () => { editBtn.style.opacity = '0'; });

    anchor.appendChild(nameDiv);
    anchor.appendChild(addressDiv);
    listItem.appendChild(anchor);
    listItem.appendChild(editBtn);
    containerDiv.appendChild(listItem);
    locationList.appendChild(containerDiv);
  });
}

populateNavBar();
if (window.reapplySort) window.reapplySort(); // reapply current sorting if any
// ------------------------------------------


// CODE LOGIC FOR OPENING MAIN MODAL
// ------------------------------------------
let cachedModalHtml = null;

// Function to access the main_modal.html and populate it with data
async function onPinClick(doc) {
  if (!cachedModalHtml) {
    const modal = await fetch('/app_buklod-tao/html/main_modal.html');
    cachedModalHtml = await modal.text();
  }
  const html = cachedModalHtml;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  // Populate modal based on doc values
  wrapper.querySelectorAll('[data-bind]').forEach(ul => {
    const key = ul.getAttribute('data-bind');

    switch (key) {
      case 'household_name':
        ul.textContent = doc.household_name || '';
        break;
      case 'contact_number':
        ul.textContent = doc.contact_number || '';
        break;
      case 'number_residents':
        ul.textContent = doc.number_residents || 0;
        break;
      case 'residency_status':
        ul.textContent = doc.residency_status || '';
        break;
      case 'is_hoa_noa':
        ul.textContent = doc.is_hoa_noa || 'N/A';
        break;
      case 'risk_level':
        ul.textContent = doc.risk_level || 'N/A';
        break;
      case 'nearest_evac':
        ul.textContent = doc.nearest_evac || '';
        break;
      case 'household_material':
        ul.textContent = doc.household_material || '';
        break;
      case 'earthquake_risk':
        ul.textContent = doc.earthquake_risk || '';
        break;
      case 'earthquake_risk_description':
        ul.textContent = doc.earthquake_risk_description || 'No description found';
        break;
      case 'fire_risk':
        ul.textContent = doc.fire_risk || '';
        break;
      case 'fire_risk_description':
        ul.textContent = doc.fire_risk_description || 'No description found';
        break;
      case 'flood_risk':
        ul.textContent = doc.flood_risk || '';
        break;
      case 'flood_risk_description':
        ul.textContent = doc.flood_risk_description || 'No description found';
        break;
      case 'landslide_risk':
        ul.textContent = doc.landslide_risk || '';
        break;
      case 'landslide_risk_description':
        ul.textContent = doc.landslide_risk_description || 'No description found';
        break;
      case 'storm_risk':
        ul.textContent = doc.storm_risk || '';
        break;
      case 'storm_risk_description':
        ul.textContent = doc.storm_risk_description || 'No description found';
        break;
      case 'number_minors':
        ul.textContent = doc.number_minors || 0;
        break;

      case 'number_adult': {
        const total = doc.num_residents || doc.number_residents || 0;
        const minors = doc.num_residents_minor || doc.number_minors || 0;
        const seniors = doc.num_residents_senior || doc.number_seniors || 0;
        const adults = total - minors - seniors;
        ul.textContent = adults >= 0 ? adults : 0;
        break;
      }

      case 'number_seniors':
        ul.textContent = doc.number_seniors || 0;
        break;
      case 'number_pwd':
        ul.textContent = doc.number_pwd || 0;
        break;
      case 'number_sick':
        ul.textContent = doc.number_sick || 0;
        break;
      case 'number_pregnant':
        ul.textContent = doc.number_pregnant || 0;
        break;
      case 'sickness_present':
        ul.textContent = doc.sickness_present || 'None';
        break;

      case 'risk-section':
        ul.innerHTML = generateRiskSection(doc); // You already have logic to do this
        break;
      default:
        ul.textContent = doc[key] || '';
    }
  });

  // Risk card color display dependent on risk level
  wrapper.querySelectorAll('[data-risk-card]').forEach(ul => {
    const key = ul.getAttribute('data-risk-card');
    const raw = doc[key] || '';
    const level = raw.split(':')[0]?.replace('RISK', '').replace(/_/g, '').trim().toUpperCase();

    ul.classList.remove('risk-high', 'risk-medium', 'risk-low');
    switch (level) {
      case 'HIGH':
        ul.classList.add('risk-high');
        break;
      case 'MEDIUM':
        ul.classList.add('risk-medium');
        break;
      case 'LOW':
        ul.classList.add('risk-low');
        break;
    }
  });

  // Show only the risk card matching the active risk type filter
  const activeRiskType = riskSortEl.value.replace('-sort', '_risk');
  wrapper.querySelectorAll('.risk-card').forEach(card => {
    card.style.display = card.getAttribute('data-risk-card') === activeRiskType ? '' : 'none';
  });

  return wrapper.innerHTML;
}
// ------------------------------------------


// CODE LOGIC FOR OPENING "ADD HOUSEHOLD" MODAL 
// ------------------------------------------
// Function for opening modal on clicking on a point in the map
function onMapClick(e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  // This is the popup for when the user clicks on a spot on the map
  var popupContent = `
    <div class="partner-geolocation">
      Latitude: ${lat}<br>
      Longitude: ${lng}
    </div>
    <button class="addButton" data-target="household" data-lat="${lat}" data-lng="${lng}">Add Household</button>
    <button class="addButton" data-target="evac" data-lat="${lat}" data-lng="${lng}">Add Evacuation Center</button>
  `;

  // Custom popup for add household
  var customPopup = L.popup({
    className: 'add-household-popup-compact'
  });
  
  customPopup.setLatLng(e.latlng).setContent(popupContent).openOn(map);
}

// Function for add household button
function addMainButtonText() {
  var mainButtonText = document.getElementById('mainButtonText');
  if(mainButtonText) {
    mainButtonText.innerHTML = 'Add a household';
  }
}

map.on('click', onMapClick);
addMainButtonText();
// ------------------------------------------


// CODE LOGIC FOR OPENING & CLOSING ADD MODAL
// ------------------------------------------
// Add Household Form Modal
var formModal = document.getElementById('addModal');

// Open modal
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
    hideModalContainer('addModal');
  }
  if (event.target == partnerModal) {
    partnerModal.style.display = 'none';
  }
};

// Add message listener for iframe communication
window.addEventListener('message', function(event) {
  if (event.data === 'closeAddModal') {
    var modal = document.getElementById('addModal');
    modal.style.display = 'none';
  }
  if (event.data === 'closeEditModal') {
    var modal = document.getElementById('editModal');
    modal.style.display = 'none';
  }
});

// ------------------------------------------


// CODE LOGIC FOR EXPORTING OF DATA
// ------------------------------------------
document.getElementById('download-report').addEventListener('click', async () => {
  const colRef = getCollection();
	const snapshot = await getDocs(colRef);

	const allHouseholds = [];
	snapshot.forEach(doc => allHouseholds.push(doc.data()));

	// Sort by household name (for later use)
	const sortByHouseholdName = (a, b) =>
		(a.household_name || '').localeCompare(b.household_name || '');

	// Sort risk levels HIGH > MEDIUM > LOW
	const sortByRiskLevel = level => {
		if (level === 'HIGH RISK') return 0;
		if (level === 'MEDIUM RISK') return 1;
		if (level === 'LOW RISK') return 2;
		return 3; // unknown
	};

	const workbook = XLSX.utils.book_new();

	const riskTypes = ['earthquake_risk', 'fire_risk', 'flood_risk', 'landslide_risk', 'storm_risk'];
	const riskLabels = {
		earthquake_risk: 'Earthquake',
		fire_risk: 'Fire',
		flood_risk: 'Flood',
		landslide_risk: 'Landslide',
		storm_risk: 'Storm'
	};

	// Generate risk sheets
	for (const riskType of riskTypes) {
		const sheetData = [['Household Name', 'Address', 'Contact Number', 'Number of Residents', 'Residency Status', 'Risk Level', 'Risk Description', 'House Material']];

		const households = [...allHouseholds].sort((a, b) => sortByHouseholdName(a, b));

		const sortedHouseholds = households.sort((a, b) => {
			const riskA = a[riskType];
			const riskB = b[riskType];
			return sortByRiskLevel(riskA) - sortByRiskLevel(riskB);
		});

		sortedHouseholds.forEach(h => {
			sheetData.push([
				h.household_name || '',
				h.household_address || '',
				h.contact_number || '',
				h.number_residents || 0,
				h.residency_status || '',
				h[riskType] || '',
				h[riskType + '_description'] || '',
				h.household_material || ''
			]);
		});

		const ws = XLSX.utils.aoa_to_sheet(sheetData);
		XLSX.utils.book_append_sheet(workbook, ws, riskLabels[riskType]);
	}

	// Residency Demographic Sheet
	const residencyData = [['Household Name', 'Address', 'Phase', 'Contact Number', 'Residency Status', 'HOA/NOA/Others', 'Total Residents', 'Minors', 'Seniors', 'PWD', 'Sick', 'Pregnant']];

	allHouseholds.sort(sortByHouseholdName).forEach(h => {
		residencyData.push([
			h.household_name || '',
			h.household_address || '',
			h.phase || '',
			h.contact_number || '',
			h.residency_status || '',
			h.is_hoa_noa || '',
      h.risk_level || '',
			h.number_residents || 0,
			h.number_minors || 0,
			h.number_seniors || 0,
			h.number_pwd || 0,
			h.number_sick || 0,
			h.number_pregnant || 0
		]);
	});

	const residencySheet = XLSX.utils.aoa_to_sheet(residencyData);
	XLSX.utils.book_append_sheet(workbook, residencySheet, 'Residency Demographics');

	// Master Sheet
	const masterHeaders = [
		'Household Name',
		'Address',
		'Phase',
		'Contact Number',
		'Residency Status',
		'HOA/NOA/Others',
		'Number of Residents',
		'Minors',
		'Seniors',
		'PWD',
		'Sick',
		'Pregnant',
		// Risk levels and descriptions
		...riskTypes.flatMap(r => [r, r + '_description']),
		'House Material'
	];

	const masterData = [masterHeaders];

	allHouseholds.forEach(h => {
		const row = [
			h.household_name || '',
			h.household_address || '',
			h.phase || '',
			h.contact_number || '',
			h.residency_status || '',
			h.is_hoa_noa || '',
      h.risk_level || '',
			h.number_residents || 0,
			h.number_minors || 0,
			h.number_seniors || 0,
			h.number_pwd || 0,
			h.number_sick || 0,
			h.number_pregnant || 0,
			...riskTypes.map(r => h[r] || ''),
			...riskTypes.map(r => h[r + '_description'] || ''),
			h.household_material || ''
		];
		masterData.push(row);
	});

	const masterSheet = XLSX.utils.aoa_to_sheet(masterData);
	XLSX.utils.book_append_sheet(workbook, masterSheet, 'Master Sheet');

	// Export
	XLSX.writeFile(workbook, 'Buklod_Tao_Household_Report.xlsx');
});

addListeners();
// ------------------------------------------

function attachMarkers(partners) {
  const riskType = document.getElementById('risk-sort').value.replace('-sort', '');

  partners.forEach(partner => {
    const coord = partner.location_coordinates;
    if (!coord) return;

    const riskLevel = partner[`${riskType}_risk`] || 'LOW RISK';
    const iconPath = getRiskIcon(riskLevel);

    const icon = L.icon({
      iconUrl: iconPath,
      iconSize: [39, 39],
      popupAnchor: [0.5, -15]
    });

    const marker = L.marker([coord._lat, coord._long], { icon });

    // Optional: bind popup
    onPinClick(partner).then(popupContent => {
      marker.bindPopup(popupContent);
    });

    partner.marker = marker;
    map.addLayer(marker);

    marker.on('popupopen', () => {
      setTimeout(() => {
        const edit_button = document.querySelectorAll(".popup-edit-btn:not(.popup-delete-btn)");

        edit_button.forEach((btn) => {
          btn.addEventListener('click', function() {
            const modal = document.getElementById('partnerModal');
            var editFormModal = document.getElementById('editModal');
            editFormModal.style.display = 'flex';
            modal.style.display = 'none';
            populateEditForm(partner, editFormModal);
          });
        });

        const delete_button = document.getElementById("delete-household-popup");
        if (delete_button) {
          delete_button.addEventListener('click', async function() {
            if (!confirm(`Delete "${partner.household_name}"? This cannot be undone.`)) return;
            const docId = await getDocIdByPartnerName(partner.household_name);
            if (docId) deleteEntry(docId);
          });
        }

        const close_button = document.getElementById("close-btn");
        if (close_button) {
          close_button.addEventListener('click', () => {
            marker.closePopup();
          });
        }

      }, 0);
    });

  });

  return partners;
}


// CODE LOGIC FOR PIN DISPLAY ON MAP
// ------------------------------------------
// Function for getting svg file according to risk type
function getRiskIcon(riskLevel) {
  const basePath = '/app_buklod-tao/hardcode/';
  switch (riskLevel.toUpperCase()) {
    case 'HIGH RISK':
      // debugger;
      return `${basePath}high_risk.svg`;
    case 'MEDIUM RISK':
      return `${basePath}mid_risk.svg`;
    case 'LOW RISK':
      return `${basePath}low_risk.svg`;
    default:
      return `${basePath}low_risk.svg`; // fallback
  }
}

// Function for removing the highlights
function clearAllHighlights() {
  const highlightedItems = document.querySelectorAll('.highlight');
  highlightedItems.forEach(item => item.classList.remove('highlight'));
}

// Function for displaying of pins and its switching colors depending on risk type
function updateRiskIcons() {
  
  const riskType = document.getElementById('risk-sort').value.replace('-sort', '');
  // Remove all current markers
  
  clearMarkers();

  partnersArray.forEach((partner, docId) => {
    // Respect active filter: skip partners excluded by the last applied filter
    if (activeFilteredIds !== null && !activeFilteredIds.has(docId)) {
      partner.marker = null;
      return;
    }

    const coord = partner.location_coordinates;
    if (!coord) return;   // Skip household entry if no coordinates were listed

    const riskLevel = partner[`${riskType}_risk`];
    const iconPath = getRiskIcon(riskLevel || 'LOW RISK');

    // Icon class standards
    const icon = L.icon({
      iconUrl: iconPath,
      iconSize: [39, 39],
      popupAnchor: [0.5, -15]
    });
    const marker = L.marker([coord._lat, coord._long], { icon });
    // Place pin accordingly on map according to icon class standards

    // Shows partner info on pin click
    onPinClick(partner).then(popupContent => {
      marker.bindPopup(popupContent, {
        className: 'household-popup'
      });
    });

    partner.marker = marker; // store reference here
    map.addLayer(marker); // add marker once

    marker.on('popupopen', () => {
      // Use setTimeout to defer this to after the popup DOM is actually rendered
      setTimeout(() => {
        const edit_button = document.querySelectorAll(".popup-edit-btn:not(.popup-delete-btn)");

        edit_button.forEach((btn) => {
          btn.addEventListener('click', function() {

            const modal = document.getElementById('partnerModal');
            var editFormModal = document.getElementById('editModal');
            editFormModal.style.display = 'flex';
            editFormModal.classList.remove('closing');
            modal.style.display = 'none';
            populateEditForm(partner, editFormModal);
          });
        });

        const delete_button = document.getElementById("delete-household-popup");
        if (delete_button) {
          delete_button.addEventListener('click', async function() {
            if (!confirm(`Delete "${partner.household_name}"? This cannot be undone.`)) return;
            const docId = await getDocIdByPartnerName(partner.household_name);
            if (docId) deleteEntry(docId);
          });
        }

        
        // Function for sidebar scrolling and highlighting when clicking from sidebar or pin
        const listItems = document.querySelectorAll('li.accordion');
        const listItem = Array.from(listItems).find(
          li => li.dataset.name === partner.household_name
        );
        if (listItem) {
        listItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        listItem.classList.add('highlight');
        }
      }, 0);
    });
  });

  // Add popup close handler
  map.on('popupclose', (e) => {
    clearAllHighlights();
  });

  addEvacCenters();

  // Re-apply active search so only searched households are visible on the map
  if (window.activeSearchQuery && window.filterMarkersBySearch) {
    window.filterMarkersBySearch(window.activeSearchQuery);
  }
}

let appliedShelterTypes = []; // empty = show all types
let activeFilteredIds = null; // null = no filter active; Set<docId> = only show these

function addEvacCenters() {
  evacCenters.forEach(center => {
    if (appliedShelterTypes.length > 0 && !appliedShelterTypes.includes(center.type)) {
      center.marker = null;
      return;
    }

    const marker_icon = L.icon({
      iconUrl: "/app_buklod-tao/hardcode/evac_center_v2.svg",
      iconSize: [39,39],
      popupAnchor: [0.5, -15]
    });

    const marker = L.marker([center.latitude, center.longitude], { icon: marker_icon });
    const popupHtml = `
      <div class="evac-marker-header">${center.type}</div>
      <div style="text-align:center;">
        <b>${center.name}</b>
        <br>Location: ${center.latitude}, ${center.longitude}
      </div>
      <div class="evac-popup-actions" style="display:flex;gap:8px;justify-content:center;margin-top:10px;">
        <button class="evac-edit-btn" data-evac-id="${center.id}" style="flex:1;padding:6px 12px;border:1px solid #1a357b;background:#fff;color:#1a357b;border-radius:6px;cursor:pointer;font-weight:500;">Edit</button>
        <button class="evac-delete-btn" data-evac-id="${center.id}" style="flex:1;padding:6px 12px;border:1px solid #dc2626;background:#fff;color:#dc2626;border-radius:6px;cursor:pointer;font-weight:500;">Delete</button>
      </div>`;
    marker.bindPopup(popupHtml, { className: 'evacuation-center-popup' });

    marker.on('popupopen', () => {
      setTimeout(() => {
        const editBtn = document.querySelector(`.evac-edit-btn[data-evac-id="${center.id}"]`);
        const deleteBtn = document.querySelector(`.evac-delete-btn[data-evac-id="${center.id}"]`);

        if (editBtn) {
          editBtn.addEventListener('click', () => openEditEvacModal(center.id));
        }
        if (deleteBtn) {
          deleteBtn.addEventListener('click', async () => {
            if (!confirm(`Delete "${center.name}"? This cannot be undone.`)) return;
            try {
              await deleteDoc(doc(DB, 'buklod-evac-centers', center.id));
              window.location.reload();
            } catch (err) {
              console.error('Error deleting evacuation center:', err);
              alert('Error deleting evacuation center. Please try again.');
            }
          });
        }
      }, 0);
    });

    center.marker = marker;
    map.addLayer(marker);
  });
}

function openEditEvacModal(docId) {
  const addModal = document.getElementById('addModal');
  const iframe = addModal.querySelector('iframe');
  iframe.src = `html/editevac.html?id=${encodeURIComponent(docId)}`;
  addModal.style.display = 'flex';
  addModal.classList.remove('closing');
  map.closePopup();
}

// Code logic for automatically changing pin color depending on selected option on dropbox
// and keeping the filter modal's Risk Type in sync
const riskSortEl = document.getElementById('risk-sort');
const riskTypeFilterEl = document.getElementById('riskTypeFilter');

function syncRiskTypeFilter(sidebarValue) {
  if (riskTypeFilterEl) {
    riskTypeFilterEl.value = sidebarValue.replace('-sort', '_risk');
  }
}

function syncRiskSort(filterValue) {
  riskSortEl.value = filterValue.replace('_risk', '-sort');
}

riskSortEl.addEventListener('change', async () => {
  syncRiskTypeFilter(riskSortEl.value);
  // If risk level checkboxes are active, re-apply the filter for the new risk type
  const activeRiskLevels = getCheckedValuesByFilter('risk_level');
  if (activeRiskLevels.length > 0) {
    await applyFilterAndUpdate();
  } else {
    updateRiskIcons();
  }
});

// riskTypeFilter changes only take effect when Apply Filters is clicked

// Initialize filter modal in sync with sidebar on load
syncRiskTypeFilter(riskSortEl.value);
updateRiskIcons();
// ------------------------------------------

// CODE LOGIC FOR FILTER MODAL UI
// ------------------------------------------

// Capture the current modal UI into a state object (module-level so sidebar can access)
function captureFilterState() {
  const checkboxes = {};
  document.querySelectorAll('#filterModal input[type="checkbox"]').forEach(cb => {
    checkboxes[`${cb.getAttribute('data-filter')}::${cb.value}`] = cb.checked;
  });
  return { checkboxes, riskType: riskTypeFilterEl.value };
}

// Tracks what was last applied — module-level so sidebar changes can update it
let appliedFilterState = null; // initialized after DOM is ready in initializeFilterModal

// Core filter-apply logic shared by the Apply button and sidebar risk type changes
async function applyFilterAndUpdate() {
  appliedFilterState = captureFilterState();
  appliedShelterTypes = getCheckedValuesByFilter('shelter_type');
  syncRiskSort(riskTypeFilterEl.value);
  const filteredData = await presentFilteredData();
  clearMarkers();
  const filteredWithMarkers = attachMarkers(filteredData);

  // Track which doc IDs passed the filter so updateRiskIcons and
  // filterMarkersBySearch both respect the active filter.
  activeFilteredIds = new Set(filteredWithMarkers.keys());

  // Sync new marker references back into partnersArray so filterMarkersBySearch
  // operates on correct markers and can't reveal filter-excluded partners.
  partnersArray.forEach((partner) => { partner.marker = null; });
  filteredWithMarkers.forEach((filteredPartner, docId) => {
    const original = partnersArray.get(docId);
    if (original) original.marker = filteredPartner.marker;
  });

  addEvacCenters();
  if (appliedShelterTypes.length > 0) {
    const shownCenters = evacCenters.filter(c => appliedShelterTypes.includes(c.type));
    populateNavBarWithEvacCenters(shownCenters);
  } else {
    populateNavBar(filteredWithMarkers);
  }
  if (window.reapplySort) window.reapplySort();
  if (window.reapplySearch) window.reapplySearch();
  updateFilterButtonState();
}

// Initialize filter modal functionality when DOM is loaded
function initializeFilterModal() {
  const filterBtn = document.getElementById('filterBtn');
  const filterModal = document.getElementById('filterModal');
  const filterClose = document.getElementById('filterClose');
  const applyFilters = document.getElementById('applyFilters');
  const clearFilters = document.getElementById('clearFilters');

  if (!filterBtn || !filterModal) {
    console.error('Filter elements not found');
    return;
  }

  // Restore the modal UI to a previously captured state
  function restoreFilterState(state) {
    document.querySelectorAll('#filterModal input[type="checkbox"]').forEach(cb => {
      const key = `${cb.getAttribute('data-filter')}::${cb.value}`;
      cb.checked = state.checkboxes[key] || false;
    });
    riskTypeFilterEl.value = state.riskType;
  }

  // Initialize applied state now that DOM is ready
  appliedFilterState = captureFilterState();

  // Open: restore to last applied state so unapplied changes don't persist
  filterBtn.addEventListener('click', () => {
    restoreFilterState(appliedFilterState);
    filterModal.style.display = 'flex';
    filterModal.classList.remove('closing');
  });

  // Close with animation; optionally discard unapplied changes
  function closeFilterModal(discardChanges = true) {
    if (discardChanges) restoreFilterState(appliedFilterState);
    filterModal.classList.add('closing');
    setTimeout(() => {
      filterModal.style.display = 'none';
      filterModal.classList.remove('closing');
    }, 300);
  }

  filterClose.addEventListener('click', () => closeFilterModal(true));
  filterModal.addEventListener('click', (e) => {
    if (e.target === filterModal) closeFilterModal(true);
  });

  // Apply: run shared apply logic then close modal
  applyFilters.addEventListener('click', async () => {
    await applyFilterAndUpdate();
    closeFilterModal(false); // already saved — don't discard
  });

  // Clear All: resets UI only, not saved until Apply is clicked
  clearFilters.addEventListener('click', () => {
    document.querySelectorAll('#filterModal input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });
    riskTypeFilterEl.value = riskTypeFilterEl.options[0]?.value || '';
    updateFilterButtonState();
  });
}

// Get checked values by filter type
function getCheckedValuesByFilter(filterType) {
  const checkboxes = document.querySelectorAll(`input[data-filter="${filterType}"]:checked`);
  return Array.from(checkboxes).map(checkbox => checkbox.value);
}

// Collect all filter selections
function collectAllFilterSelections() {
  return {
    residency_status: getCheckedValuesByFilter('residency_status'),
    household_material: getCheckedValuesByFilter('household_material'),
    is_hoa_noa: getCheckedValuesByFilter('is_hoa_noa'),
    risk_level: getCheckedValuesByFilter('risk_level'),
    risk_type: document.getElementById('riskTypeFilter')?.value || null, // ✅ FIXED
  };
}


// Update filter button visual state based on selected filters
function updateFilterButtonState() {
  const filterBtn = document.getElementById('filterBtn');
  
  // Check if any filters are selected
  const hasCheckboxFilters = document.querySelectorAll('#filterModal input[type="checkbox"]:checked').length > 0;
  const riskTypeFilter = document.getElementById('riskTypeFilter');
  const hasRiskTypeFilter = riskTypeFilter && riskTypeFilter.value !== '';
  
  const hasActiveFilters = hasCheckboxFilters || hasRiskTypeFilter;
  
  if (hasActiveFilters) {
    filterBtn.classList.add('filter-active');
  } else {
    filterBtn.classList.remove('filter-active');
  }
}

const STANDARD_MATERIALS = ['Concrete', 'Semi-Concrete', 'Light materials', 'Makeshift', 'Natural'];

export async function presentFilteredData() {
  const rawInput = collectAllFilterSelections();
  const selectedShelterTypes = getCheckedValuesByFilter('shelter_type');

  const riskType = (rawInput.risk_type && rawInput.risk_type !== 'all' && rawInput.risk_type !== '')
    ? rawInput.risk_type
    : null;
  const riskLevels = rawInput.risk_level; // always an array

  // Separate "Other" catchall from standard material selections
  const rawMaterials = rawInput.household_material || [];
  const hasOtherMaterial = rawMaterials.includes('__other__');
  const standardMaterialsSelected = rawMaterials.filter(m => m !== '__other__');

  // Build transformedData without risk_type and risk_level
  const transformedData = {
    residency_status: rawInput.residency_status,
    // If "Other" is checked, skip material filter in Firestore — handle client-side below
    household_material: hasOtherMaterial ? [] : standardMaterialsSelected,
    is_hoa_noa: rawInput.is_hoa_noa,
  };

  if (riskLevels.length > 0) {
    if (riskType) {
      // Specific risk type selected
      transformedData[riskType] = riskLevels;
    } else {
      // No risk type
      transformedData._riskLevelAny = riskLevels;
    }
  }

  const needsAnyRiskFilter = riskLevels.length > 0 && !riskType;

  let finalData;

  if (needsAnyRiskFilter) {
    const baseData = await filterData("buklod-tao", transformedData);
    const riskFields = ['earthquake_risk', 'fire_risk', 'flood_risk', 'landslide_risk', 'storm_risk'];

    finalData = new Map();
    baseData.forEach((doc, id) => {
      const matchesRisk = riskFields.some(field => riskLevels.includes(doc[field]));
      if (matchesRisk) finalData.set(id, doc);
    });
  } else {
    finalData = await filterData("buklod-tao", transformedData);
  }

  // Client-side pass: apply "Other" material catchall
  if (hasOtherMaterial) {
    const filtered = new Map();
    finalData.forEach((doc, id) => {
      const mat = doc.household_material || '';
      const isNonStandard = !STANDARD_MATERIALS.includes(mat);
      const isSelectedStandard = standardMaterialsSelected.includes(mat);
      if (isNonStandard || isSelectedStandard) filtered.set(id, doc);
    });
    finalData = filtered;
  }

  // Shelter type options map to dedicated shelter markers, not household docs.
  // When a shelter type is selected, hide all households and let addEvacCenters()
  // render only the chosen shelter markers.
  if (selectedShelterTypes.length > 0) {
    finalData = new Map();
  }

  return finalData;
}



// Module scripts run after DOM is parsed, so call directly
initializeFilterModal();

window.filterMarkersBySearch = function(query) {
  const input = query.trim();
  const escaped = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = escaped ? new RegExp('\\b' + escaped + '\\b', 'i') : null;

  partnersArray.forEach((partner) => {
    if (!partner.marker) return;
    if (!regex) {
      map.addLayer(partner.marker);
    } else {
      const nameMatch = regex.test(partner.household_name || '');
      const addressMatch = regex.test(partner.household_address || '');
      if (nameMatch || addressMatch) {
        map.addLayer(partner.marker);
      } else {
        map.removeLayer(partner.marker);
      }
    }
  });
};
