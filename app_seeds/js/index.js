export function showMainModal() {
	var mainModal = document.getElementById('mainModal');
	mainModal.style.display = 'flex';
}

export function showAddModal() {
	var addModal = document.getElementById('addModal');
	addModal.style.display = 'flex';
}

// CODE LOGIC FOR FILTERING
var filterBtn = document.getElementById('filter-btn');
filterBtn.addEventListener('click', () => showFilterModal())

var filterCloseBtn = document.getElementById

function showFilterModal() {
	var filterModal = document.getElementById('filterModal');
	filterModal.style.display = 'flex';
	setUpFilterModal()
	console.log("showing filter modal");
}

function setUpFilterModal() {
	getOffices(window.partners);
}

function getOffices(partners) {
	const offices = []
	Object.keys(partners).forEach((partner) => {
			const office = partners[partner][0]["ADMU_office"];
			// console.log(typeof(office));
			if (!offices.includes(office)) {
				offices.push(office);	
			}
	});
	offices.sort();
	console.log("ADMU Offices:");
	console.log(offices);
	return offices;
}