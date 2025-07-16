// CODE LOGIC FOR IMPORTING OF FUNCTIONS
// ------------------------------------------
import {populateEditForm, getPartnersArray } from './firestore.js';
import {
  getDocIdByPartnerName,
  getDocByID,
  setCollection,
  getCollection,
  DB,
  BUKLOD_RULES_TEST,
} from '../../js/firestore_UNIV.js';
import { addListeners, clearMarkers, map } from '../../js/index_UNIV.js';
import {
  getFirestore,
  collection,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';
import evacCenters from '../hardcode/evac-centers.json' with {type: 'json'};
// ------------------------------------------


// CODE LOGIC FOR SET-UP
// ------------------------------------------
// Pans map to Banaba area upon loading the page
map.panTo(new L.LatLng(14.673, 121.11215));

// Load Map Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
  
// Get list of households
var partnersArray = getPartnersArray();

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
    filtered_partners = partnersArray;
  }

  // Update the household count
  const partnersCount = document.getElementById('partners-count');
  if (partnersCount) {
    partnersCount.textContent = `HOUSEHOLDS (${filtered_partners.length})`;
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

      map.setView(partner.marker.getLatLng()); // change zoom: 1, you can see america and europe. 18, banaba area
      onPinClick(doc).then(popupHTML => {
        partner.marker.bindPopup(popupHTML).openPopup(); // this replaces fire('popupopen')
      });
    });


    // Adding classes and setting text content
    nameDiv.classList.add('name');
    addressDiv.classList.add('address');
    
    nameDiv.textContent = partner.household_name;
    addressDiv.textContent =
    partner.household_address + ' ' + partner.household_phase;
    
    listItem.classList.add('accordion');
    anchor.classList.add('accordion', 'link');
    containerDiv.classList.add('container-entry');
    
    // Append elements to the DOM
    anchor.appendChild(nameDiv);
    anchor.appendChild(addressDiv);
    
    listItem.appendChild(anchor);
    containerDiv.appendChild(img);
    containerDiv.appendChild(listItem);
    locationList.appendChild(containerDiv);
  });
}
populateNavBar();
// ------------------------------------------


// CODE LOGIC FOR OPENING MAIN MODAL
// ------------------------------------------
// Function to access the main_modal.html and populate it with data
async function onPinClick(doc) {
  const modal = await fetch('/app_buklod-tao/html/main_modal.html');
  const html = await modal.text();

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

  // Risk card color display dependent on rosk level
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

  const closeBtn = wrapper.querySelector('#close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.parent.postMessage('closeMainModal', '*');
    });
  }

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
    <button class="addButton" data-lat="${lat}" data-lng="${lng}">Add Household</button>
  `;

  // Custom popup for add household
  var customPopup = L.popup({
    className: 'add-household-popup-compact'
  });
  
  customPopup.setLatLng(e.latlng).setContent(popupContent).openOn(map);
  //popup = customPopup;

  // Event listener for the Add Household button using event delegation
  setTimeout(() => {
    var addButton = document.querySelector('.addButton');
    if (addButton) {
      addButton.addEventListener('click', function () {
        const lat = this.getAttribute('data-lat');
        const lng = this.getAttribute('data-lng');

        var modal = document.getElementById('addModal');

        // Display the modal
        modal.style.display = 'flex';

        // Set the coordinates in the iframe form
        var iframe = modal.getElementsByTagName('iframe')[0];
        var iframeDocument = iframe.contentWindow.document;
        
        // Wait for iframe to load then set coordinates
        iframe.onload = function() {
          var locationField = iframeDocument.getElementById('location_coordinates');
          if (locationField) {
            locationField.value = lat + ',' + lng;
          }
        };
        
        // If iframe is already loaded, set coordinates immediately
        if (iframe.contentWindow.document.readyState === 'complete') {
          var locationField = iframeDocument.getElementById('location_coordinates');
          if (locationField) {
            locationField.value = lat + ',' + lng;
          }
        }

        // Close the popup after opening modal
        map.closePopup();
      });
    }
  }, 100);
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
    formModal.style.display = 'none';
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

addListeners();
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
		const sheetData = [['Household Name', 'Address', 'Phase', 'Contact Number', 'Number of Residents', 'Residency Status', 'Risk Level', 'Risk Description', 'House Material']];

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
				h.phase || '',
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

// Function for displaying of pins and its switching colors depending on risk type
function updateRiskIcons() {
  const riskType = document.getElementById('risk-sort').value.replace('-sort', '');
  // Remove all current markers
  
  clearMarkers();

  partnersArray.forEach((partner) => {
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
      marker.bindPopup(popupContent);
    });

    partner.marker = marker; // store reference here
    map.addLayer(marker);

    marker.on('popupopen', () => {
      // Use setTimeout to defer this to after the popup DOM is actually rendered
      setTimeout(() => {
        const edit_button = document.querySelectorAll(".popup-edit-btn");

        edit_button.forEach((btn) => {
          btn.addEventListener('click', function() {
            
            const modal = document.getElementById('partnerModal');
            var editFormModal = document.getElementById('editModal');
            editFormModal.style.display = 'flex';
            modal.style.display = 'none';
            populateEditForm(partner, editFormModal);
          });
        });

        const close_button = document.getElementById("close-btn");
        if (close_button) {
          close_button.addEventListener('click', () => {
            marker.closePopup();
          });
        }
      }, 0); 
      
    });

    map.addLayer(marker);
  });


  // Code logic for displaying evac centers
  evacCenters.forEach(center => {
    
    const marker_icon = L.icon({
      iconUrl: "/app_buklod-tao/hardcode/evac_center_v2.svg",
      iconSize: [39,39],
      popupAnchor: [0.5, -15]
    })
    
    const marker = L.marker([center.latitude, center.longitude], {icon: marker_icon})

    marker.bindPopup(`
      <div class = "evac-marker-header">${center.type}</div>
      <div style = "text-align:center;">
      <b>${center.name}</b>
      <br>Location: ${center.latitude}, ${center.longitude}
      </div>`);
      map.addLayer(marker);
      
    });
}

// Code logic for automatically changing pin color depending on selected option on dropbox 
document.getElementById('risk-sort').addEventListener('change', updateRiskIcons);
updateRiskIcons();
// ------------------------------------------

// CODE LOGIC FOR FILTER MODAL UI
// ------------------------------------------
// Initialize filter modal functionality when DOM is loaded
function initializeFilterModal() {
  // Filter Modal Controls
  const filterBtn = document.getElementById('filterBtn');
  const filterModal = document.getElementById('filterModal');
  const filterClose = document.getElementById('filterClose');
  const applyFilters = document.getElementById('applyFilters');
  const clearFilters = document.getElementById('clearFilters');

  if (!filterBtn || !filterModal) {
    console.error('Filter elements not found');
    return;
  }

  // Open filter modal
  filterBtn.addEventListener('click', () => {
    filterModal.style.display = 'flex';
  });

  // Close filter modal
  function closeFilterModal() {
    filterModal.style.display = 'none';
  }

  filterClose.addEventListener('click', closeFilterModal);
  filterModal.addEventListener('click', (e) => {
    if (e.target === filterModal) {
      closeFilterModal();
    }
  });

  // Apply filters
  applyFilters.addEventListener('click', () => {
    
    updateFilterButtonState();
    closeFilterModal();
  });

  // Clear all filters
  clearFilters.addEventListener('click', () => {
    // Reset all checkboxes
    document.querySelectorAll('#filterModal input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Reset risk type dropdown
    const riskTypeFilter = document.getElementById('riskTypeFilter');
    if (riskTypeFilter) {
      riskTypeFilter.value = '';
    }
    
    // Reset visual state
    updateFilterButtonState();
    closeFilterModal();
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
    house_material: getCheckedValuesByFilter('house_material'),
    is_hoa_noa: getCheckedValuesByFilter('is_hoa_noa'),
    risk_level: getCheckedValuesByFilter('risk_level'),
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

// Initialize filter modal when DOM is ready
document.addEventListener('DOMContentLoaded', initializeFilterModal);

// Also initialize after a short delay to ensure all elements are loaded
setTimeout(initializeFilterModal, 1000);