import {
	rule_reference,
	getDocByID,
	getDocIdByPartnerName,
	getCollection,
} from '/js/firestore_UNIV.js';

// Global Map Variable (the map shown)
export var map = L.map('map').setView([14.5995, 120.9842], 10);

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
