import { map } from '/index_UNIV.js';

// Show Main modal
const element = document.getElementById('mainButton');
element.addEventListener('click', showMainModal);

function showMainModal() {
	console.log("'Add an activity' button was clicked!");

	var mainModal = document.getElementById('mainModal');
	mainModal.style.display = 'flex';

	window.onclick = function (event) {
		if (event.target == mainModal) {
			mainModal.style.display = 'none';
		}
	};
}

// Close Main modal
const elementCloseButton = document.getElementById('closeButton');
elementCloseButton.addEventListener('click', closeModal);

function closeModal() {
	var mainModal = document.getElementById('mainModal');
	mainModal.style.display = 'none';
}

// Fuction for filtering results upon searching partners
const newButton = document.getElementById('addModalButton');
newButton.addEventListener('click', showAddModal);

export function showAddModal() {
	console.log("The user clicked the '+' button within the Main Modal");
	var addModal = document.getElementById('addModal');
	addModal.style.display = 'flex';

	window.onclick = function (event) {
		if (event.target == addModal) {
			addModal.style.display = 'none';
		}
	};
}

function addMainButtonText() {
	var mainButtonText = document.getElementById('mainButtonText');
	mainButtonText.innerHTML = 'Add an activity';
}
addMainButtonText();
