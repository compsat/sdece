import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { signOutUser, AUTH } from "/js/auth.js";
import { 
  removeDatabase, 
  initDatabase,
	createSubscriptions,
	getSeedsCollection,
	getActivities,
	getPartners
} from '../js/dexie.js';
import { showModal, getTempActivities } from "./firestore.js";
import { getAllPartnerCoordinatesInRxDB, hasDatabase, getFieldInRxDB, migrateActivityDates } from '../../js/dexie_UNIV.js';
import { map, requireParameters } from '../../js/index_UNIV.js';
import { addMissingFields, deleteNumericIds, migrateDates } from "../../js/firestore_UNIV.js";

const L = window.L;
const loginURL = "/html/seeds-login.html";
const btn = document.getElementById("authBtn");

let markers = L.layerGroup().addTo(map);


onAuthStateChanged(AUTH, async (user) => {
	if (user) {
		document.body.style.visibility = 'visible'; 
		btn.textContent = "Logout";
		await startApp(user.uid);
		btn.onclick = () => signOutUser();
	} else {
		if (hasDatabase()) {
			try {
				removeDatabase();
				console.log("Local database destroyed on logout.");
			} catch (err) {
				console.error("Error removing database on logout:", err);
			}
		}
		window.location.replace(loginURL); // redirect if not logged in
	}
});

async function startApp(uid) {
	if (hasDatabase()) return;

	console.log('Initializing database...')
	await initDatabase(uid); 
	attachFunctions(window);
	createSubscriptions();
	createMarkersAndSidebar(await getPartners());

	map.setView(new L.LatLng(14.651, 121.052), 14);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);
}

/**
 * Attaches functions to the window for debug purposes.
 * @param {*} window 
 */
function attachFunctions(window) {
	const checks = [
		[!window, "window is null or undefined."]
	]
	if (!requireParameters(checks)) {
		return;
	}
	window.getAllPartnerCoordinatesInRxDB = getAllPartnerCoordinatesInRxDB;
	window.addMissingFields = addMissingFields;
	window.migrateDates = migrateDates;
	window.getTempActivities = getTempActivities;
	window.getFieldInRxDB = getFieldInRxDB;
	window.migrateActivityDates = migrateActivityDates;
	window.getSeedsCollection = getSeedsCollection;
	window.getActivities = getActivities;
	window.getPartners = getPartners;
	window.deleteNumericIds = deleteNumericIds;
}

import { SEEDS_RULES } from '/js/firestore_UNIV.js';
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs";

export function showMainModal() {
	var mainModal = document.getElementById('mainModal');
	mainModal.style.display = 'flex';
}

export function showAddModal() {
	var addModal = document.getElementById('addModal');
	addModal.style.display = 'flex';
}

/**
 * Creates map markers and sidebar entries for each partner.
 * @param {Object} partners - An object where each key is a partner name and the value is an array of activities associated with that partner. 
 */
export function createMarkersAndSidebar(partners) {
	for (const [partnerName, activities] of Object.entries(partners)) {
		let firstActivity = activities[0];
		let partnerCoordinates = firstActivity['partner_coordinates'];
		if (partnerCoordinates == null) {
			continue;
		}

		let lat = parseFloat(partnerCoordinates._lat ?? partnerCoordinates.latitude);
		let long = parseFloat(partnerCoordinates._long ?? partnerCoordinates.longitude);
		let marker;
		try {
			marker = L.marker([lat, long]);
		} catch (e) {
			console.log(firstActivity)
			console.log(partnerCoordinates);
			console.error(e);
		}

		// Bind popup to marker
		let popupContent = `
			<div class="partner-popup" id="${partnerName}">
			${partnerName}
			</div>`;
		marker.bindPopup(popupContent);
		markers.addLayer(marker);

		// Marker hover and click events
		marker.on('mouseover', () => marker.openPopup());
		marker.on('click', () => {
				map.panTo(new L.LatLng(lat, long));
				handleMarkerClick(partnerName, activities);
		});

		// Build sidebar item for this partner
		createSidebarItem(partnerName, activities, lat, long, marker);
	};
}

// Handle marker click: highlight sidebar and show modal
function handleMarkerClick(partnerName, activities) {
    clearAllHighlights();

    // Highlight sidebar item
    const sidebarItems = document.querySelectorAll('.partnerDiv');
    sidebarItems.forEach((item) => {
        const nameDiv = item.querySelector('.name');
        if (nameDiv?.textContent === partnerName) {
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            item.classList.add('highlight');
        }
    });

    showModal(activities);
}

// Create sidebar list item for a partner
export function createSidebarItem(partner, activities, lat, long, marker) {
    const containerDiv = document.createElement('div');
    const img = document.createElement('svg');
    const listItem = document.createElement('li');
    const anchor = document.createElement('a');
    const nameDiv = document.createElement('div');
    const addressDiv = document.createElement('div');
    const activityDiv = document.createElement('div');

    containerDiv.classList.add('partnerDiv');
    listItem.classList.add('accordion');
    nameDiv.classList.add('name');
    addressDiv.classList.add('address');
    activityDiv.classList.add('activity');

    nameDiv.textContent = partner;
    addressDiv.textContent = activities[0]['partner_address'];

    // Append activity names
    activityDiv.innerHTML = getActivitiesString(activities);

    // Add click behavior for sidebar item
    containerDiv.addEventListener('click', () => {
        marker.openPopup();
        map.panTo(new L.LatLng(lat, long));
        clearAllHighlights();
        containerDiv.classList.add('highlight');
        showModal(activities);
    });

    // Assemble DOM elements
    anchor.append(nameDiv, addressDiv, activityDiv);
    listItem.appendChild(anchor);
    containerDiv.append(img, listItem);
    document.getElementById('locationList').appendChild(containerDiv);
}

// Clears Highlight on the Side Bar when transitioning
export function clearAllHighlights() {
	const sidebarItems = document.querySelectorAll('.partnerDiv');
	sidebarItems.forEach((item) => {
		item.classList.remove('highlight');
	});
}

/**
 * Gets the string representation of an activity. 
 * Uses the activity name by default, but falls back to the activity nature otherwise.
 * If there is no activity name and activity nature, it returns "Unnamed Activity".
 * @param {Object} activity - An activity object 
 * @returns {string} A string
 */
export function getActivityString(activity) {
	return activity?.activity_name?.trim() || activity?.activity_nature?.trim() || "Unnamed Activity";
}

/**
 * Gets a string representation of an array of activities.
 * Each activity is separated by a <br>.
 * @param {*} activities 
 * @returns A string
 */
function getActivitiesString(activities) {
    return activities.map(activity => getActivityString(activity)).join('<br>');
}

/**
 * Exports current data into an Excel (.xlsx) file, with activity per row. Grouped and sorted by partner name.
 * 
 * @example 
 * document.getElementById('download-report').addEventListener("click", exportData);
 * 
 * @global
 * @requires XLSX - SheetJS Library
 * @requires SEEDS_RULES - Ruleset for SEEDS documents
 * @requires window.partners - JS Object mapping partner names to an array of activities
 */
export function exportData() {
	let partners = window.partners;

  const workbook = XLSX.utils.book_new();
	const ruleset = SEEDS_RULES['validations']
	const fields = Object.keys(ruleset).sort();
	const sheetData = [["Partner", ...fields.map(field => ruleset[field].label ?? field)]]
	for (const [partnerName, activities] of Object.entries(partners).sort((a, b) => a[0].localeCompare(b[0]))) {
		activities.forEach(activity => {
			sheetData.push([
				partnerName,
				...fields.map(field => {
					let val;
					if (field === "partner_coordinates" 
						&& activity[field])
						val = `${activity[field]._lat}, ${activity[field]._long}`;
					else if (field === "activity_date"
						&& activity[field])
						val = new Date(activity[field].seconds * 1000).toLocaleString();
					else val = activity[field] ?? "";
					return val;
				})
			])
		})
	}
	XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheetData), 'Master Sheet');
	const now = new Date()
    XLSX.writeFile(workbook, `Seeds_Report-${now.toLocaleDateString().replaceAll('/','-')}.xlsx`);
}

document.getElementById('download-report').addEventListener("click", exportData);