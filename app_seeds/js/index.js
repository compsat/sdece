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

function initializeFilterModal() {
	
}

function showFilterModal() {
	var filterModal = document.getElementById('filterModal');
	filterModal.style.display = 'flex';
	setUpFilterModal()
	console.log("showing filter modal");
}

function setUpFilterModal() {
	getOffices(window.partners);
	const filterOptionHtml = `<label><input type="checkbox" value="field_option_b" data-filter="field_name"> Field Option B</label>`;
}

function getOffices(partners) {
	const offices = []
	Object.keys(partners).forEach((partner) => {
			const office = partners[partner][0]["ADMU_office"];
			if (!offices.includes(office)) {offices.push(office);}
	});

	offices.sort();
	return offices;
}