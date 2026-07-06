import { VALIDATION_RULES } from "/js/firestore_UNIV.js";
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
 * Exports current data into an Excel (.xlsx) file, with activity per row. Grouped and sorted by partner name.
 * 
 * @example 
 * document.getElementById('download-report').addEventListener("click", exportData);
 * 
 * @global
 * @requires XLSX - SheetJS Library
 * @requires VALIDATION_RULES - Rule Engine for SEEDS documents
 * @requires window.partners - JS Object mapping partner names to an array of activities
 */
export function exportData() {
	let partners = window.partners;

  const workbook = XLSX.utils.book_new();
	const ruleset = VALIDATION_RULES['seeds-official']
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