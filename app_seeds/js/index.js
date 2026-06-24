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
	setUpFilterModal();
	console.log("showing filter modal");
}

function setUpFilterModal() {
	var offices = getOffices(window.partners);
	// const filterSection = document.getElementById('admu-offices');
	const filterModalIframe = document.getElementById('filter-modal-id');
	const filterModal = filterModalIframe.contentDocument;
	var filterSection = filterModal.getElementById('admu-offices');
	if (filterSection) {
		offices.forEach((office) => {
		const filterOptions = `<label><input type="checkbox" value="${office}" data-filter="office"> ${office} </label>`;
		filterSection.innerHTML += filterOptions;
	});
	}
	

}

function getOffices(partners) {
	const offices = []
	Object.keys(partners).forEach((partner) => {
			const office = partners[partner][0]["ADMU_office"];
			if (!offices.includes(office)) {offices.push(office);}
	});

	offices.sort();
	console.log(offices);
	return offices;
}

//
// CODE LOGIC FOR SORTING
const sortBtn = document.getElementById