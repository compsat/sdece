import { SEEDS_RULES } from '/js/firestore_UNIV.js';
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs";
import { filterData, getCollection } from "../../js/firestore_UNIV.js";
import { FILTER_RULES } from "../../js/ruleEngines.js";

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
// CODE LOGIC FOR FILTERING
var filterBtn = document.getElementById('filter-btn');
filterBtn.addEventListener('click', () => showFilterModal());

const filterModalIframe = document.getElementById('filter-modal-id');
const filterModal = filterModalIframe.contentDocument;

var filterModalClose = filterModal.getElementById("filterClose");
filterModalClose.addEventListener("click", function(event) {
              window.parent.postMessage('closeFilterModal', '*');
			  clearFilterModal();  
            });

var filterModalApply = filterModal.getElementById("applyFilters");
filterModalApply.addEventListener("click", function(event){
	console.log("Filter Fields:");
	console.log(getFilterFields(window.partners));

	console.log("captured filters:");
	console.log(captureFilterState());

	console.log("query array:");
	console.log(buildQueryArray(captureFilterState()));

	console.log("applied filters:");
	console.log(applyFilterAndUpdate(buildQueryArray(captureFilterState())));

});

var filterModalClear = filterModal.getElementById("clearFilters");

function showFilterModal() {
	var filterModal = document.getElementById('filterModal');
	filterModal.style.display = 'flex';
	setUpFilterModal();
	console.log("showing filter modal");
}

function setUpFilterModal() { 
	const filters = getFilterFields(window.partners);
	const filterSection = filterModal.getElementById('filter-section');
	Object.keys(filters).forEach((field) => {
		const filterHeader = `<h3>${field}</h3>`
		filterSection.innerHTML += filterHeader;

		filters[field].forEach((filter) => {
			const filterOptions = `<label><input type="checkbox" value="${filter}" data-filter="${field}"> ${filter} </label>`;
			filterSection.innerHTML += filterOptions;
		})
	});
}

function clearFilterModal() {
	var officeSection = filterModal.getElementById('admu-offices');
	officeSection.innerHTML = "";
}


function getFilterFields(partners) {
	const filterFields = {};
	const ruleEngineFields = FILTER_RULES["seeds-official"]
	for (const key in ruleEngineFields) {
		filterFields[key] = [];

		Object.keys(partners).forEach((partner) => {
			const entry = partners[partner][0][key];
			if (!filterFields[key].includes(entry)) {
				filterFields[key].push(entry);
			}
		});
	};

	return filterFields;
}

function captureFilterState() {
  const checkboxes = {};
  const ruleEngineFields = FILTER_RULES["seeds-official"];
  for (const key in ruleEngineFields) {
	checkboxes[key] = {};

	//this no longer checks specifically for checkboxes
	filterModal.querySelectorAll(`.filter-content [data-filter="${key}"]`).forEach(cb => {
		checkboxes[key][`${cb.value}`] = cb.checked;
	});
  }
  return checkboxes;
}

function buildQueryArray(filterState) {	//temp hardcode
	const queryArray = {};
	for (let field in FILTER_RULES["seeds-official"]) {
		queryArray[`${field}`] = [];
	}

	for (let field in filterState) {
		Object.keys(filterState[field]).forEach((filter) => {
			if ( filterState[field][filter] == true ) {
				queryArray[field].push(`${filter}`);
			}
		});
	}

	return queryArray;
}

async function applyFilterAndUpdate(queryArray) {
	return filterData('seeds-official', queryArray);	
}

// CODE LOGIC FOR SORTING
// const sortBtn = document.getElementById
