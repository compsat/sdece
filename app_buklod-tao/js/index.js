// CODE LOGIC FOR IMPORTING OF FUNCTIONS
// ------------------------------------------
import { populateEditForm } from './firestore.js';
import { initDb, startFirestoreSync, deleteDoc } from '../../js/dexie.js'; 
import { 
  setDatabase, 
  getDatabase,
  parseData,
  importData,
  removeDatabase, 
  createSubscriptions,
  dbExists,
  getHouseholdCollection,
  getHouseholds,
  getEvacCentersCollection,
  getEvacCenters,
  setAsOffline,
  hasDatabase,
} from '../js/dexie.js'; 
import { addListeners, clearMarkers, map } from '../../js/index_UNIV.js';

import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js';
import { AUTH } from '../../js/auth.js';

const partnersArray = () => { return getHouseholds() }; // Map of partner ID to partner data
const evacCenters = () => { return getEvacCenters() };

onAuthStateChanged(AUTH, async (user) => {
  if (user) {
    await main(user.uid);
  } else {
    console.log("No user signed in. Redirecting...");
    
    // Destroy local DB if it exists to protect privacy
    if (dbExists()) {
      try {
        removeDatabase();
        console.log("Local database destroyed on logout.");
      } catch (err) {
        console.error("Error removing database on logout:", err);
      }
    }
    
    window.location.href = '../../html/login.html'; 
  }
});

async function main(uid) {
  if (dbExists()) return;

  setDatabase(await initDb(uid)); 

  startFirestoreSync(getDatabase(), uid);

  createSubscriptions(window);

  map.setView([14.674043754743689, 121.11081361770631], 18);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  initializeFilterModal();
  addListeners();
}
// ------------------------------------------


// OPENING API TO MODALS (e.g. addevac.html, editloc.html, etc.)
// ------------------------------------------

window.api = {
  hasDatabase,
  getEvacCentersCollection,
  getHouseholdCollection
}


// CODE LOGIC FOR SET-UP
// ------------------------------------------

// Handle close button clicks for all popups (event delegation)
document.addEventListener('click', function(event) {
  if (event.target.matches('#close-btn, #close-btn *')) {
    event.preventDefault();
    event.stopPropagation();
    map.closePopup();
  }
});

// Handle Add Household / Add Evacuation Center button clicks from the map popup
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
    var targetSrc = target === 'evac' ? 'html/addevac.html' : 'html/addloc.html';

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

    modal.style.display = 'flex';
    modal.classList.remove('closing');

    if (iframe.src.endsWith(targetSrc)) {
      iframe.style.visibility = 'visible';
      populateAddLocationFields();
    } else {
      iframe.style.visibility = 'hidden';
      iframe.onload = function() {
        iframe.style.visibility = 'visible';
        populateAddLocationFields();
      };
      iframe.src = targetSrc;
    }

    map.closePopup();
  }
});

// Function for populating the navbar entries with households entries
export function populateNavBar(households){
  const locationList = document.getElementById('locationList');
  locationList.innerHTML = '';
  
  var filtered_partners = households;

  const partnersCount = document.getElementById('partners-count');
  if (partnersCount) {
    partnersCount.textContent = `HOUSEHOLDS (${filtered_partners.size})`;
  }

  filtered_partners.forEach((partner) => {
    const containerDiv = document.createElement('div');
    const img = document.createElement('svg');
    const listItem = document.createElement('li');
    const anchor = document.createElement('a');
    const nameDiv = document.createElement('div');
    const addressDiv = document.createElement('div');

    listItem.setAttribute('data-name', partner.household_name);
    anchor.href = '#';

    listItem.addEventListener('click', async () => {
      const doc = await getHouseholdCollection().findOne(partner.id).exec();
      if (!doc) return;
  
      map.setView(partner.marker.getLatLng());
      
      if (!map.hasLayer(partner.marker)) {
        map.addLayer(partner.marker);
        partner.marker.once('popupclose', () => {
          if (!window.pinsVisible) map.removeLayer(partner.marker);
        });
      }
      
      onPinClick(doc).then(popupHTML => {
        partner.marker.bindPopup(popupHTML, { className: 'household-popup' }).openPopup();
      });
    });

    nameDiv.classList.add('name');
    addressDiv.classList.add('address');
    nameDiv.textContent = partner.household_name;
    addressDiv.textContent = [partner.household_address, partner.household_phase].filter(Boolean).join(' ');

    listItem.classList.add('accordion');
    anchor.classList.add('accordion', 'link');
    containerDiv.classList.add('container-entry');

    const editBtn = document.createElement('button');
    editBtn.classList.add('sidebar-edit-btn');
    editBtn.title = 'Edit household';
    editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
    editBtn.style.cssText = 'position:absolute;top:8px;right:8px;width:28px;height:28px;border:none;background:transparent;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6b7280;padding:0;opacity:0;transition:opacity 0.15s ease,background-color 0.15s ease,color 0.15s ease;';
    listItem.style.position = 'relative';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation(); 
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

    anchor.appendChild(nameDiv);
    anchor.appendChild(addressDiv);
    listItem.appendChild(anchor);
    listItem.appendChild(editBtn);
    containerDiv.appendChild(img);
    containerDiv.appendChild(listItem);
    locationList.appendChild(containerDiv);
  });
}

// Sidebar entries for evacuation centers
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
        if (!map.hasLayer(center.marker)) {
          map.addLayer(center.marker);
          center.marker.once('popupclose', () => {
            if (!window.pinsVisible) map.removeLayer(center.marker);
          });
        }
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
    editBtn.addEventListener('mouseenter', () => { editBtn.style.backgroundColor = '#e5e7eb'; editBtn.style.color = '#1a357b'; });
    editBtn.addEventListener('mouseleave', () => { editBtn.style.backgroundColor = 'transparent'; editBtn.style.color = '#6b7280'; });
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
// ------------------------------------------


// CODE LOGIC FOR OPENING MAIN MODAL
// ------------------------------------------
let cachedModalHtml = null;

async function onPinClick(doc) {
  if (!cachedModalHtml) {
    const modal = await fetch('/app_buklod-tao/html/main_modal.html');
    cachedModalHtml = await modal.text();
  }
  const html = cachedModalHtml;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  wrapper.querySelectorAll('[data-bind]').forEach(ul => {
    const key = ul.getAttribute('data-bind');
    switch (key) {
      case 'household_name': ul.textContent = doc.household_name || ''; break;
      case 'contact_number': ul.textContent = doc.contact_number || ''; break;
      case 'number_residents': ul.textContent = doc.number_residents || 0; break;
      case 'residency_status': ul.textContent = doc.residency_status || ''; break;
      case 'is_hoa_noa': ul.textContent = doc.is_hoa_noa || 'N/A'; break;
      case 'risk_level': ul.textContent = doc.risk_level || 'N/A'; break;
      case 'nearest_evac': ul.textContent = doc.nearest_evac || ''; break;
      case 'household_material': ul.textContent = doc.household_material || ''; break;
      case 'earthquake_risk': ul.textContent = doc.earthquake_risk || ''; break;
      case 'earthquake_risk_description': ul.textContent = doc.earthquake_risk_description || 'No description found'; break;
      case 'fire_risk': ul.textContent = doc.fire_risk || ''; break;
      case 'fire_risk_description': ul.textContent = doc.fire_risk_description || 'No description found'; break;
      case 'flood_risk': ul.textContent = doc.flood_risk || ''; break;
      case 'flood_risk_description': ul.textContent = doc.flood_risk_description || 'No description found'; break;
      case 'landslide_risk': ul.textContent = doc.landslide_risk || ''; break;
      case 'landslide_risk_description': ul.textContent = doc.landslide_risk_description || 'No description found'; break;
      case 'storm_risk': ul.textContent = doc.storm_risk || ''; break;
      case 'storm_risk_description': ul.textContent = doc.storm_risk_description || 'No description found'; break;
      case 'number_minors': ul.textContent = doc.number_minors || 0; break;
      case 'number_adult': {
        const total = doc.num_residents || doc.number_residents || 0;
        const minors = doc.num_residents_minor || doc.number_minors || 0;
        const seniors = doc.num_residents_senior || doc.number_seniors || 0;
        ul.textContent = (total - minors - seniors) >= 0 ? (total - minors - seniors) : 0;
        break;
      }
      case 'number_seniors': ul.textContent = doc.number_seniors || 0; break;
      case 'number_pwd': ul.textContent = doc.number_pwd || 0; break;
      case 'number_sick': ul.textContent = doc.number_sick || 0; break;
      case 'number_pregnant': ul.textContent = doc.number_pregnant || 0; break;
      case 'sickness_present': ul.textContent = doc.sickness_present || 'None'; break;
      case 'risk-section': ul.innerHTML = generateRiskSection(doc); break;
      default: ul.textContent = doc[key] || '';
    }
  });

  wrapper.querySelectorAll('[data-risk-card]').forEach(ul => {
    const key = ul.getAttribute('data-risk-card');
    const raw = doc[key] || '';
    const level = raw.split(':')[0]?.replace('RISK', '').replace(/_/g, '').trim().toUpperCase();
    ul.classList.remove('risk-high', 'risk-medium', 'risk-low');
    if (level === 'HIGH') ul.classList.add('risk-high');
    else if (level === 'MEDIUM') ul.classList.add('risk-medium');
    else if (level === 'LOW') ul.classList.add('risk-low');
  });

  const activeRiskType = riskSortEl.value.replace('-sort', '_risk');
  wrapper.querySelectorAll('.risk-card').forEach(card => {
    card.style.display = card.getAttribute('data-risk-card') === activeRiskType ? '' : 'none';
  });

  return wrapper.innerHTML;
}
// ------------------------------------------


// CODE LOGIC FOR OPENING "ADD HOUSEHOLD" MODAL 
// ------------------------------------------
function onMapClick(e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;
  var popupContent = `
    <div class="partner-geolocation">
      Latitude: ${lat}<br>
      Longitude: ${lng}
    </div>
    <button class="addButton" data-target="household" data-lat="${lat}" data-lng="${lng}">Add Household</button>
    <button class="addButton" data-target="evac" data-lat="${lat}" data-lng="${lng}">Add Evacuation Center</button>
  `;
  L.popup({ className: 'add-household-popup-compact' })
    .setLatLng(e.latlng)
    .setContent(popupContent)
    .openOn(map);
}

function addMainButtonText() {
  var mainButtonText = document.getElementById('mainButtonText');
  if(mainButtonText) mainButtonText.innerHTML = 'Add a household';
}

map.on('click', onMapClick);
addMainButtonText();

// Modal Open/Close Logic
var formModal = document.getElementById('addModal');
var openForm = document.getElementById('mainButton');
var closeForm = document.getElementsByClassName('closeForm')[0];

if(openForm) {
  openForm.onclick = () => formModal.style.display = "block";
  openForm.addEventListener('click', () => formModal.style.display = 'block');
}
if(closeForm) {
  closeForm.addEventListener('click', () => formModal.style.display = 'none');
}

window.onclick = function (event) {
  if (event.target == formModal) hideModalContainer('addModal');
  if (event.target == partnerModal) partnerModal.style.display = 'none';
};

window.addEventListener('message', function(event) {
  if (event.data === 'closeAddModal') document.getElementById('addModal').style.display = 'none';
  if (event.data === 'closeEditModal') document.getElementById('editModal').style.display = 'none';
});
// ------------------------------------------


// CODE LOGIC FOR EXPORTING OF DATA
// ------------------------------------------
document.getElementById('download-report').addEventListener('click', async () => {
    const allHouseholds = Array.from(partnersArray().values());
    const sortByHouseholdName = (a, b) => (a.household_name || '').localeCompare(b.household_name || '');
    const sortByRiskLevel = level => {
        if (level === 'HIGH RISK') return 0;
        if (level === 'MEDIUM RISK') return 1;
        if (level === 'LOW RISK') return 2;
        return 3;
    };

    const workbook = XLSX.utils.book_new();
    const riskTypes = ['earthquake_risk', 'fire_risk', 'flood_risk', 'landslide_risk', 'storm_risk'];
    const riskLabels = { earthquake_risk: 'Earthquake', fire_risk: 'Fire', flood_risk: 'Flood', landslide_risk: 'Landslide', storm_risk: 'Storm' };

    for (const riskType of riskTypes) {
        const sheetData = [['Household Name', 'Address', 'Contact Number', 'Number of Residents', 'Residency Status', 'Risk Level', 'Risk Description', 'House Material', 'Important Notes']];
        const sortedHouseholds = [...allHouseholds]
            .sort(sortByHouseholdName)
            .sort((a, b) => sortByRiskLevel(a[riskType] || '') - sortByRiskLevel(b[riskType] || ''));

        sortedHouseholds.forEach(h => {
            sheetData.push([h.household_name || '', h.household_address || '', h.contact_number || '', h.number_residents || 0, h.residency_status || '', h[riskType] || '', h[riskType + '_description'] || '', h.household_material || '', h.important_notes || '']);
        });
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheetData), riskLabels[riskType]);
    }

    // Residency Demographics Sheet
    const residencyHeaders = [
        'Household Name', 'Address', 'Phase', 'Contact Number', 'Residency Status',
        'HOA/NOA/Others', 'Overall Risk Level', 'Total Residents', 'Minors', 'Seniors',
        'PWD', 'Sick', 'Pregnant', 'Nearest Evacuation Center', 'Disaster Response Plan',
        'Before Disaster Actions', 'During Disaster Actions', 'After Disaster Actions',
        'Knowledge Readiness', 'Exit Points',
    ];
    const residencyData = [residencyHeaders];
    allHouseholds.sort(sortByHouseholdName).forEach(h => {
        residencyData.push([
            h.household_name || '', h.household_address || '', h.phase || '',
            h.contact_number || '', h.residency_status || '', h.is_hoa_noa || '',
            h.risk_level || '', h.number_residents || 0, h.number_minors || 0,
            h.number_seniors || 0, h.number_pwd || 0, h.number_sick || 0,
            h.number_pregnant || 0, h.nearest_evac || '', h.disaster_response_plan || '',
            h.before_disaster_actions || '', h.during_disaster_actions || '',
            h.after_disaster_actions || '', h.knowledge_readiness || '', h.exit_points || '',
        ]);
    });
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(residencyData), 'Residency Demographics');

    // Master Sheet
    const masterHeaders = [
        'Household Name', 'Address', 'Street', 'Phase', 'Contact Number',
        'Residency Status', 'HOA/NOA/Others', 'Source Dataset',
        'Location Link', 'Latitude', 'Longitude',
        'Nearest Evacuation Center', 'Disaster Response Plan',
        'Before Disaster Actions', 'During Disaster Actions', 'After Disaster Actions',
        'Knowledge Readiness', 'Exit Points',
        'Overall Risk Level', 'Number of Families', 'Number of Residents',
        'Healthy', 'Minors', 'Seniors', 'PWD', 'Sick', 'Pregnant', 'Sickness Present',
        ...riskTypes.flatMap(r => [riskLabels[r] + ' Risk', riskLabels[r] + ' Description']),
        'House Material', 'Important Notes', 'Notes'
    ];
    const masterData = [masterHeaders];
    allHouseholds.sort(sortByHouseholdName).forEach(h => {
        masterData.push([
            h.household_name || '', h.household_address || '', h.street || '',
            h.phase || '', h.contact_number || '', h.residency_status || '',
            h.is_hoa_noa || '', h.source_dataset || '',
            h.location_link || '',
            h.location_coordinates?._lat || '',
            h.location_coordinates?._lng || '',
            h.nearest_evac || '', h.disaster_response_plan || '',
            h.before_disaster_actions || '', h.during_disaster_actions || '',
            h.after_disaster_actions || '', h.knowledge_readiness || '',
            h.exit_points || '',
            h.risk_level || '', h.number_families || 0, h.number_residents || 0,
            h.number_healthy || 0, h.number_minors || 0, h.number_seniors || 0,
            h.number_pwd || 0, h.number_sick || 0, h.number_pregnant || 0,
            h.sickness_present || '',
            ...riskTypes.flatMap(r => [h[r] || '', h[r + '_description'] || '']),
            h.household_material || '', h.important_notes || '', h.notes || ''
        ]);
    });
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(masterData), 'Master Sheet');

    XLSX.writeFile(workbook, 'Buklod_Tao_Household_Report.xlsx');
});
// ------------------------------------------

// CODE LOGIC FOR IMPORTING OF DATA
// ------------------------------------------
document.getElementById('import-report').addEventListener('click', async () => {
  document.getElementById('import-report-input').click()
});

document.getElementById('import-report-input').addEventListener('change', async function(e) {
  console.log('You selected ' + e.target.files?.[0].name);
  try {
    const docs = await parseData(e.target.files?.[0])
    if (docs.length === 0) throw new Error("No valid rows found.");

    await importData(docs);
    setAsOffline();
    localStorage.setItem("viewingLocal", "1");
    alert(`Imported ${docs.length} households. Refresh to return to online mode.`)
  } catch (err) {
    console.error("Import failed:", err);
    alert("Import failed.")
  }
});
// ------------------------------------------


function attachMarkers(partners) {
  const riskType = document.getElementById('risk-sort').value.replace('-sort', '');
  partners.forEach(partner => {
    const coord = partner.location_coordinates;
    if (!coord) return;

    const riskLevel = partner[`${riskType}_risk`] || 'LOW RISK';
    const icon = L.icon({ iconUrl: getRiskIcon(riskLevel), iconSize: [39, 39], popupAnchor: [0.5, -15] });
    const marker = L.marker([coord._lat, coord._lng], { icon }); 

    onPinClick(partner).then(popupContent => marker.bindPopup(popupContent));
    partner.marker = marker;
    
    if (window.pinsVisible) map.addLayer(marker);

    marker.on('popupopen', () => {
      setTimeout(() => {
        document.querySelectorAll(".popup-edit-btn:not(.popup-delete-btn)").forEach(btn => {
          btn.addEventListener('click', function() {
            document.getElementById('partnerModal').style.display = 'none';
            const editFormModal = document.getElementById('editModal');
            editFormModal.style.display = 'flex';
            editFormModal.classList.remove('closing');
            populateEditForm(partner, editFormModal);
          });
        });

        const delete_button = document.getElementById("delete-household-popup");
        if (delete_button) {
          delete_button.addEventListener('click', async function() {
            if (!confirm(`Delete "${partner.household_name}"? This cannot be undone.`)) return;
            await deleteDoc(getHouseholdCollection(), partner.id);
          });
        }

        document.getElementById("close-btn")?.addEventListener('click', () => marker.closePopup());
      }, 0);
    });
  });
  return partners;
}

// CODE LOGIC FOR PIN DISPLAY ON MAP
// ------------------------------------------
function getRiskIcon(riskLevel) {
  const basePath = '/app_buklod-tao/hardcode/';
  switch (riskLevel.toUpperCase()) {
    case 'HIGH RISK': return `${basePath}high_risk.svg`;
    case 'MEDIUM RISK': return `${basePath}mid_risk.svg`;
    default: return `${basePath}low_risk.svg`;
  }
}

function clearAllHighlights() {
  document.querySelectorAll('.highlight').forEach(item => item.classList.remove('highlight'));
}

export function updateRiskIcons() {
  const riskType = document.getElementById('risk-sort').value.replace('-sort', '');
  clearMarkers();

  partnersArray().forEach((partner, docId) => {
    if (activeFilteredIds !== null && !activeFilteredIds.has(docId)) {
      partner.marker = null;
      return;
    }

    const coord = partner.location_coordinates;
    if (!coord) return;

    const riskLevel = partner[`${riskType}_risk`];
    const icon = L.icon({ iconUrl: getRiskIcon(riskLevel || 'LOW RISK'), iconSize: [39, 39], popupAnchor: [0.5, -15] });
    const marker = L.marker([coord._lat, coord._lng], { icon });

    onPinClick(partner).then(popupContent => marker.bindPopup(popupContent, { className: 'household-popup' }));

    partner.marker = marker;
    if (window.pinsVisible) map.addLayer(marker);

    marker.on('popupopen', () => {
      setTimeout(() => {
        document.querySelectorAll(".popup-edit-btn:not(.popup-delete-btn)").forEach(btn => {
          btn.addEventListener('click', function() {
            document.getElementById('partnerModal').style.display = 'none';
            const editFormModal = document.getElementById('editModal');
            editFormModal.style.display = 'flex';
            editFormModal.classList.remove('closing');
            populateEditForm(partner, editFormModal);
          });
        });

        const delete_button = document.getElementById("delete-household-popup");
        if (delete_button) {
          delete_button.addEventListener('click', async function() {
            if (!confirm(`Delete "${partner.household_name}"? This cannot be undone.`)) return;
            await deleteDoc(getHouseholdCollection(), partner.id);
          });
        }

        const listItems = document.querySelectorAll('li.accordion');
        const listItem = Array.from(listItems).find(li => li.dataset.name === partner.household_name);
        if (listItem) {
          listItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          listItem.classList.add('highlight');
        }
      }, 0);
    });
  });

  map.on('popupclose', (e) => {
    clearAllHighlights();
    if (!window.pinsVisible && e.popup._source) map.removeLayer(e.popup._source);
  });

  addEvacCenters();
  if (window.activeSearchQuery && window.filterMarkersBySearch) window.filterMarkersBySearch(window.activeSearchQuery);
}

let appliedShelterTypes = [];
let activeFilteredIds = null;

export function addEvacCenters() {
  evacCenters().forEach(center => {
    if (appliedShelterTypes.length > 0 && !appliedShelterTypes.includes(center.type)) {
      center.marker = null;
      return;
    }
    const marker_icon = L.icon({ iconUrl: "/app_buklod-tao/hardcode/evac_center_v2.svg", iconSize: [39,39], popupAnchor: [0.5, -15] });
    const marker = L.marker([center.latitude, center.longitude], { icon: marker_icon });
    
    const popupHtml = `
      <div class="evac-marker-header">${center.type}</div>
      <div style="text-align:center;"><b>${center.name}</b><br>Location: ${center.latitude}, ${center.longitude}</div>
      <div class="evac-popup-actions" style="display:flex;gap:8px;justify-content:center;margin-top:10px;">
        <button class="evac-edit-btn" data-evac-id="${center.id}" style="flex:1;padding:6px 12px;border:1px solid #1a357b;background:#fff;color:#1a357b;border-radius:6px;cursor:pointer;font-weight:500;">Edit</button>
        <button class="evac-delete-btn" data-evac-id="${center.id}" style="flex:1;padding:6px 12px;border:1px solid #dc2626;background:#fff;color:#dc2626;border-radius:6px;cursor:pointer;font-weight:500;">Delete</button>
      </div>`;
    marker.bindPopup(popupHtml, { className: 'evacuation-center-popup' });

    marker.on('popupopen', () => {
      setTimeout(() => {
        document.querySelector(`.evac-edit-btn[data-evac-id="${center.id}"]`)?.addEventListener('click', () => openEditEvacModal(center.id));
        document.querySelector(`.evac-delete-btn[data-evac-id="${center.id}"]`)?.addEventListener('click', async () => {
          if (!confirm(`Delete "${center.name}"? This cannot be undone.`)) return;
          await deleteDoc(getEvacCentersCollection(), center.id);
        });
      }, 0);
    });

    center.marker = marker;
    if (window.pinsVisible) map.addLayer(marker);
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

const riskSortEl = document.getElementById('risk-sort');
const riskTypeFilterEl = document.getElementById('riskTypeFilter');

function syncRiskTypeFilter(sidebarValue) { if (riskTypeFilterEl) riskTypeFilterEl.value = sidebarValue.replace('-sort', '_risk'); }
function syncRiskSort(filterValue) { riskSortEl.value = filterValue.replace('_risk', '-sort'); }

riskSortEl.addEventListener('change', async () => {
  syncRiskTypeFilter(riskSortEl.value);
  const activeRiskLevels = getCheckedValuesByFilter('risk_level');
  if (activeRiskLevels.length > 0) await applyFilterAndUpdate();
  else updateRiskIcons();
});

syncRiskTypeFilter(riskSortEl.value);
// ------------------------------------------

// CODE LOGIC FOR FILTER MODAL UI
// ------------------------------------------
function captureFilterState() {
  const checkboxes = {};
  document.querySelectorAll('#filterModal input[type="checkbox"]').forEach(cb => {
    checkboxes[`${cb.getAttribute('data-filter')}::${cb.value}`] = cb.checked;
  });
  return { checkboxes, riskType: riskTypeFilterEl.value };
}

let appliedFilterState = null;

async function applyFilterAndUpdate() {
  appliedFilterState = captureFilterState();
  appliedShelterTypes = getCheckedValuesByFilter('shelter_type');
  syncRiskSort(riskTypeFilterEl.value);
  const filteredData = await presentFilteredData();
  clearMarkers();
  const filteredWithMarkers = attachMarkers(filteredData);

  activeFilteredIds = new Set(filteredWithMarkers.keys());
  partnersArray().forEach((partner) => { partner.marker = null; });
  filteredWithMarkers.forEach((filteredPartner, docId) => {
    const original = partnersArray().get(docId);
    if (original) original.marker = filteredPartner.marker;
  });

  addEvacCenters();
  if (appliedShelterTypes.length > 0) {
    populateNavBarWithEvacCenters(evacCenters().filter(c => appliedShelterTypes.includes(c.type)));
  } else {
    populateNavBar(filteredWithMarkers);
  }
  if (window.reapplySort) window.reapplySort();
  if (window.reapplySearch) window.reapplySearch();
  updateFilterButtonState();
}

function initializeFilterModal() {
  const filterBtn = document.getElementById('filterBtn');
  const filterModal = document.getElementById('filterModal');
  const filterClose = document.getElementById('filterClose');
  const applyFilters = document.getElementById('applyFilters');
  const clearFilters = document.getElementById('clearFilters');

  if (!filterBtn || !filterModal) return;

  function restoreFilterState(state) {
    document.querySelectorAll('#filterModal input[type="checkbox"]').forEach(cb => {
      cb.checked = state.checkboxes[`${cb.getAttribute('data-filter')}::${cb.value}`] || false;
    });
    riskTypeFilterEl.value = state.riskType;
  }

  appliedFilterState = captureFilterState();

  filterBtn.addEventListener('click', () => {
    restoreFilterState(appliedFilterState);
    filterModal.style.display = 'flex';
    filterModal.classList.remove('closing');
  });

  function closeFilterModal(discardChanges = true) {
    if (discardChanges) restoreFilterState(appliedFilterState);
    filterModal.classList.add('closing');
    setTimeout(() => { filterModal.style.display = 'none'; filterModal.classList.remove('closing'); }, 300);
  }

  filterClose.addEventListener('click', () => closeFilterModal(true));
  filterModal.addEventListener('click', (e) => { if (e.target === filterModal) closeFilterModal(true); });
  applyFilters.addEventListener('click', async () => { await applyFilterAndUpdate(); closeFilterModal(false); });
  clearFilters.addEventListener('click', () => {
    document.querySelectorAll('#filterModal input[type="checkbox"]').forEach(cb => cb.checked = false);
    riskTypeFilterEl.value = riskTypeFilterEl.options[0]?.value || '';
    updateFilterButtonState();
  });
}

function getCheckedValuesByFilter(filterType) {
  return Array.from(document.querySelectorAll(`input[data-filter="${filterType}"]:checked`)).map(cb => cb.value);
}

function collectAllFilterSelections() {
  return {
    residency_status: getCheckedValuesByFilter('residency_status'),
    household_material: getCheckedValuesByFilter('household_material'),
    is_hoa_noa: getCheckedValuesByFilter('is_hoa_noa'),
    risk_level: getCheckedValuesByFilter('risk_level'),
    risk_type: document.getElementById('riskTypeFilter')?.value || null,
  };
}

function updateFilterButtonState() {
  const filterBtn = document.getElementById('filterBtn');
  const hasCheckboxFilters = document.querySelectorAll('#filterModal input[type="checkbox"]:checked').length > 0;
  const riskTypeFilter = document.getElementById('riskTypeFilter');
  const hasRiskTypeFilter = riskTypeFilter && riskTypeFilter.value !== '';
  if (hasCheckboxFilters || hasRiskTypeFilter) filterBtn.classList.add('filter-active');
  else filterBtn.classList.remove('filter-active');
}

const STANDARD_MATERIALS = ['Concrete', 'Semi-Concrete', 'Light materials', 'Makeshift', 'Natural'];

export async function presentFilteredData() {
  const rawInput = collectAllFilterSelections();
  const selectedShelterTypes = getCheckedValuesByFilter('shelter_type');
  const riskType = (rawInput.risk_type && rawInput.risk_type !== 'all' && rawInput.risk_type !== '') ? rawInput.risk_type : null;
  const riskLevels = rawInput.risk_level;
  const rawMaterials = rawInput.household_material || [];
  const hasOtherMaterial = rawMaterials.includes('__other__');
  const standardMaterialsSelected = rawMaterials.filter(m => m !== '__other__');

  // --- NEW: Build Local RxDB Query ---
  const selector = { _deleted: { $eq: false } };

  if (rawInput.residency_status.length > 0) selector.residency_status = { $in: rawInput.residency_status };
  if (!hasOtherMaterial && standardMaterialsSelected.length > 0) selector.household_material = { $in: standardMaterialsSelected };
  if (rawInput.is_hoa_noa.length > 0) selector.is_hoa_noa = { $in: rawInput.is_hoa_noa };
  if (riskLevels.length > 0 && riskType) selector[riskType] = { $in: riskLevels };

  let docs = await getHouseholdCollection().find({ selector }).exec();
  
  let finalData = new Map();
  const needsAnyRiskFilter = riskLevels.length > 0 && !riskType;

  if (needsAnyRiskFilter) {
    const riskFields = ['earthquake_risk', 'fire_risk', 'flood_risk', 'landslide_risk', 'storm_risk'];
    docs.forEach(doc => {
      if (riskFields.some(field => riskLevels.includes(doc[field]))) finalData.set(doc.id, doc.toJSON());
    });
  } else {
    docs.forEach(doc => finalData.set(doc.id, doc.toJSON()));
  }

  if (hasOtherMaterial) {
    const filtered = new Map();
    finalData.forEach((doc, id) => {
      const mat = doc.household_material || '';
      if (!STANDARD_MATERIALS.includes(mat) || standardMaterialsSelected.includes(mat)) filtered.set(id, doc);
    });
    finalData = filtered;
  }

  if (selectedShelterTypes.length > 0) finalData = new Map();
  return finalData;
}

initializeFilterModal();

window.filterMarkersBySearch = function(query) {
  const input = query.trim();
  const escaped = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = escaped ? new RegExp('\\b' + escaped + '\\b', 'i') : null;

  partnersArray().forEach((partner) => {
    if (!partner.marker) return;
    if (!regex) {
      if (window.pinsVisible) map.addLayer(partner.marker);
      else map.removeLayer(partner.marker);
      return;
    }
    const nameMatch = regex ? regex.test(partner.household_name || '') : true;
    const addressMatch = regex ? regex.test(partner.household_address || '') : true;
    if (nameMatch || addressMatch || window.pinsVisible) map.addLayer(partner.marker);
    else map.removeLayer(partner.marker);
  });
};

window.pinsVisible = false; 
const togglePinsBtn = document.getElementById('togglePinsBtn');
const togglePinsText = document.getElementById('togglePinsText');

togglePinsBtn.addEventListener('click', () => {
  window.pinsVisible = !window.pinsVisible;
  if (window.pinsVisible) {
    togglePinsBtn.classList.add('filter-active');
    togglePinsText.textContent = 'Hide Pins';
  } else {
    togglePinsBtn.classList.remove('filter-active');
    togglePinsText.textContent = 'Show Pins';
  }
  partnersArray().forEach((partner) => {
    if (partner.marker) {
      if (window.pinsVisible) map.addLayer(partner.marker);
      else map.removeLayer(partner.marker);
    }
  });
  evacCenters().forEach((center) => {
    if (center.marker) {
      if (window.pinsVisible) map.addLayer(center.marker);
      else map.removeLayer(center.marker);
    }
  });
});