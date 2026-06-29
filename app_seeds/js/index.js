import { filterData, getCollection } from "../../js/firestore_UNIV.js";

import { loadActivities,
		groupActivities,
		getActivity,
		getActivitiesString,
		clearAllHighlights,
		createSidebarItem,
		handleMarkerClick,
		createMarkersAndSidebar
 } from "./firestore.js";

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

const filterModalIframe = document.getElementById('filter-modal-id');
const filterModal = filterModalIframe.contentDocument;

var filterModalClose = filterModal.getElementById("filterClose");
filterModalClose.addEventListener("click", function(event) {
              window.parent.postMessage('closeFilterModal', '*');
			  clearFilterModal();  
            });

var filterModalApply = filterModal.getElementById("applyFilters");
filterModalApply.addEventListener("click", function(event){
	console.log("Filter States:")
	console.log(captureFilterState());
	console.log(buildQueryArray(captureFilterState()));
	console.log(applyFilterAndUpdate(buildQueryArray(captureFilterState())));
	// captureFilterState();
});

var filterModalClear = filterModal.getElementById("clearFilters");

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
	var filterSection = filterModal.getElementById('admu-offices');
	if (filterSection) {
		offices.forEach((office) => {
		const filterOptions = `<label><input type="checkbox" value="${office}" data-filter="office"> ${office} </label>`;
		filterSection.innerHTML += filterOptions;
	});
	}	
}

function clearFilterModal() {
	var officeSection = filterModal.getElementById('admu-offices');
	officeSection.innerHTML = "";
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

function captureFilterState() {
  const checkboxes = {};
  filterModal.querySelectorAll('.filter-content input[type="checkbox"]').forEach(cb => {
	// console.log(cb);
    // checkboxes[`${cb.getAttribute('data-filter')}::${cb.value}`] = cb.checked;
    checkboxes[`${cb.value}`] = cb.checked;
  });
  return checkboxes;
}

function buildQueryArray(filterState) {	//temp hardcode
	const queryArray = {};
	for (let filter in filterState) {
		if (filterState[filter] == true) {
			queryArray["ADMU_office"] = filter;
		}
	}

	return queryArray;
}

async function applyFilterAndUpdate(queryArray) {
	return filterData('seeds-official', queryArray);	
}

// CODE LOGIC FOR SORTING
// const sortBtn = document.getElementById