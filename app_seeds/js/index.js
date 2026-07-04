import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { signOutUser, AUTH } from "/js/auth.js";
import { 
  removeDatabase, 
  initDatabase,
	createSubscriptions,
	getSeedsCollection
} from '../js/dexie.js';
import { getAllPartnerCoordinatesInRxDB, hasDatabase } from '../../js/dexie_UNIV.js';
import { map } from '../../js/index_UNIV.js';

const loginURL = "/html/seeds-login.html";
const btn = document.getElementById("authBtn");

onAuthStateChanged(AUTH, async (user) => {
	if (user) {
		document.body.style.visibility = 'visible'; 
		btn.textContent = "Logout";
		await main(user.uid);
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

async function main(uid) {
	if (hasDatabase()) return;

	console.log('Initializing database...')
	await initDatabase(uid); 
	window.getAllPartnerCoordinatesInRxDB = getAllPartnerCoordinatesInRxDB;
	window.getSeedsCollection = getSeedsCollection;
	createSubscriptions(window);

	map.setView(new L.LatLng(14.651, 121.052), 14);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);
}

export function showMainModal() {
	var mainModal = document.getElementById('mainModal');
	mainModal.style.display = 'flex';
}

export function showAddModal() {
	var addModal = document.getElementById('addModal');
	addModal.style.display = 'flex';
}
