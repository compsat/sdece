import {
	rule_reference,
	getDocByID,
	getDocIdByPartnerName,
	getCollection,
} from '../js/firestore_UNIV.js';

// Global Map Variable (the map shown)
export var map = window.L.map('map').setView([14.5995, 120.9842], 10);

function panLocation(doc, map) {
	if (getCollection().id === rule_reference['collection_name']) {
		var coordinates;
		for (let i = 0; i < rule_reference['fields'].length; i++) {
			if (rule_reference['fields'][i].includes('location_coordinates')) {
				coordinates = doc[rule_reference['fields'][i]];
				if(coordinates != null) {
					map.panTo(
						new L.LatLng(
							coordinates.latitude,
							coordinates.longitude
						)
					);
				}
				break;
			}
		}
	}
}

function searchLocation(name, map) {
  getDocIdByPartnerName(name).then((docId) => {
    if (!docId) {
      console.warn("No document ID found for", name);
      return;
    }

    getDocByID(docId).then((doc) => {
      if (!doc) {
        console.warn("No document data found for ID:", docId);
        return;
      }
      panLocation(doc, map); // ✅ only called when doc is not null
    });
  });
}

/**
 * Checks if all required parameters are defined.
 * @param {Array<[boolean, string]>} checks An array where each element is a tuple [isInvalid, errorString] where isInvalid is a boolean indicating if the parameter is invalid and errorString is the error message to display.
 * @returns {boolean} True if all parameters are defined, false otherwise.
 */
export function requireParameters(checks) {
	for (const [isInvalid, errorString] of checks) {
		if (isInvalid) {
				console.error(errorString);
				return false;
		}
	}
	return true;
}

// Utility Function for Front-end (remove underscores from a string)
export function removeUnderscoresFromField(field) {
	const words = field.replace('_', ` `);
	return words;
}

// Utility function for Front-end (Capitalize Like This)
// USE AFTER removeUnderscoresFromField
export function capitalizeFirstLetters(field) {
	const words = field.split(' ');
	for (let i = 0; i < words.length; i++) {
		words[i] = words[i].charAt(0).toUpperCase() + words[i].substr(1);
	}
	return words.join(' ');
}

// Utility function for Front-end
export function readyField(field) {
	field = removeUnderscoresFromField(field);
	field = capitalizeFirstLetters(field);
	return field;
}

// Listeners
export function addListeners() {
	var locationList = document.getElementById(`locationList`);
	locationList.addEventListener('click', (event) => {
		
		const li = event.target.closest('li');
		if (!li) return;

		const partnerName = li.dataset.name;
		searchLocation(partnerName, map);

	});
}

export function clearMarkers() {
	map.eachLayer((layer) => {
		if (layer instanceof L.Marker) {
			layer.remove();
		}
	});
}

export function clearLocationList() {
	console.log("[clearLocationList] Called.");
	var locationList = document.getElementById(`locationList`);
	locationList.innerHTML = '';
}


// creates the JS CSS Files
export function createJsCssFiles(file_path) {
	// Essentially makes a script object with a src of the file provided by the Rules Engine
	if (file_path.includes('.js')) {
		var fileref = document.createElement('script');
		fileref.setAttribute('type', 'module');
		fileref.setAttribute('src', file_path + '?');
	}
	if (file_path.includes('.css')) {
		var fileref = document.createElement('link');
		fileref.setAttribute('rel', 'stylesheet');
		fileref.setAttribute('type', 'text/css');
		fileref.setAttribute('href', file_path + '?');
	}

	return fileref;
}

// Loads the JS CSS Files
export function loadJsCssFiles() {
	// script if javascript, css if link or none;
	if (rule_reference['collection_name'] == getCollection().id) {
		for (let i = 0; i < rule_reference['identifier'].length; i++) {
			var new_element = createJsCssFiles(rule_reference['identifier'][i]);
			new_element.setAttribute('id', 'jscss' + i);
			document
				.getElementsByTagName('head')[0]
				.appendChild(new_element);
		}
	}
}

/**
 * Helper function for standardizing a date into a format that works for prefilling HTML inputs.
 * Used for partner_date since it is stored as a number locally.
 * @param {Timestamp, number} date 
 * @returns {string} A string in the YYYY-MM-DD format. If the date is invalid, return '' instead.
 */
export function toDateString(date) {
	let old = date;
	let val;
  if (!date || date === 0) val = '';
  else if (typeof date === 'number') val = new Date(date * 1000).toLocaleDateString('en-CA');
  else if (typeof date === 'string') val = date;
  else if (date.toDate) val = date.toDate().toLocaleDateString('en-CA');
	console.log(`[toDateString] ${old} -> ${val}`);
  return val ?? '';
}

/**
 * Turns a sequence of integers into a more readable format. Used for printing out invalid rows from parseData().
 * @param {Array} rows - An array of integers
 * @returns An array of strings.
 * @example
 * let range = [1,2,3,4,6,8,9,10]
 * let out = getRanges(range));
 * // out = ["1-4","6","8-10"]
 */
export function getRanges(rows) {
  if (!rows.length) return [];
  const sorted = [...rows].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    const current = sorted[i];
    const prev = sorted[i - 1];
    if (current !== prev + 1 || i === sorted.length) {
      ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = current;
    }
  }

  return ranges;
}

/**
 * Pluralizes a word given a number. This does not work for complex plural nouns.
 * @param {*} count - The amount of the given noun
 * @param {*} noun - The noun to be pluralized
 * @param {*} [suffix] - The suffix that will be added to the base noun when it is plural
 * @returns {string} The singular or plural version of the word
 */
export const pluralize = (count, noun, suffix = 's') => 
  `${noun}${count !== 1 ? suffix : ''}`;
