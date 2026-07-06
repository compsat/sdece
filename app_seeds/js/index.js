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
import {
	createSidebarItem
} from '../js/firestore.js'
import { getAllPartnerCoordinatesInRxDB, hasDatabase } from '../../js/dexie_UNIV.js';
import { map, requireParameters } from '../../js/index_UNIV.js';

const loginURL = "/html/seeds-login.html";
const btn = document.getElementById("authBtn");

let results = L.layerGroup().addTo(map);


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
	createSubscriptions(window);
	createMarkersAndSidebar(await getPartners());

	map.setView(new L.LatLng(14.651, 121.052), 14);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);
}

function attachFunctions(window) {
	const checks = [
		[!window, "window is null or undefined."]
	]
	if (!requireParameters(checks)) {
		return;
	}
	window.getAllPartnerCoordinatesInRxDB = getAllPartnerCoordinatesInRxDB;
	window.getSeedsCollection = getSeedsCollection;
	window.getActivities = getActivities;
	window.getPartners = getPartners;
}

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
function createMarkersAndSidebar(partners) {
	Object.keys(partners).forEach((partner) => {
		let firstActivity = partners[partner][0];
		let partnerCoordinates = firstActivity['partner_coordinates'];

		if (partnerCoordinates == null) {
			return;
		}
		let { _lat, _long} = partnerCoordinates;
		let lat = parseFloat(_lat);
		let long = parseFloat(_long);
		let marker = L.marker([lat, long]);

		// Bind popup to marker
		let popupContent = `
			<div class="partner-popup" id="${partner}">
			${partner}
			</div>`;
		marker.bindPopup(popupContent);
		results.addLayer(marker);

		// Marker hover and click events
		marker.on('mouseover', () => marker.openPopup());
		marker.on('click', () => {
				map.panTo(new L.LatLng(lat, long));
				handleMarkerClick(partner, partners);
		});

		// Build sidebar item for this partner
		createSidebarItem(partner, partners[partner], lat, long, marker);
	});
}
