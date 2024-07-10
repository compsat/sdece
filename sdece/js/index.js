import { map } from '/index_UNIV.js';

var searchControl = L.esri.Geocoding.geosearch().addTo(map);

// Show Main modal
const element = document.getElementById('mainButton');
element.addEventListener('click', showMainModal);

export function showMainModal() {
	console.log("'Add an activity' button was clicked!");

	var mainModal = document.getElementById('mainModal');
	mainModal.style.display = 'flex';

	window.onclick = function (event) {
		if (event.target == mainModal) {
			mainModal.style.display = 'none';
		}
	};
}

// Fuction for filtering results upon searching partners
const mainModalDocument = document.getElementById('mainModalIframe').contentDocument;
console.log(document.getElementById('mainModalIframe'));
const newButton = mainModalDocument.getElementById('addModalButton');
newButton.addEventListener('click', showAddModal);

/*
export function showAddModal() {
	console.log("The user clicked the '+' button within the Main Modal");
	var addModal = document.getElementById('addModal');
	addModal.style.display = 'flex';

	window.onclick = function (event) {
		if (event.target == addModal) {
			addModal.style.display = 'none';
		}
	};
}*/

function addMainButtonText() {
	var mainButtonText = document.getElementById('mainButtonText');
	mainButtonText.innerHTML = 'Add an activity';
}
addMainButtonText();
