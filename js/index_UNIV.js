import {
	DB_RULES_AND_DATA,
	getDocByID,
	getDocIdByPartnerName,
	getCollection,
} from '/js/firestore_UNIV.js';

// Global Map Variable (the map shown)
export var map = L.map('map').setView([14.5995, 120.9842], 10);

function panLocation(doc, map) {
	for (let rule of DB_RULES_AND_DATA) {
		if (getCollection().id === rule[0]) {
			var coordinates;
			for (let i = 0; i < rule[2].length; i++) {
				if (rule[2][i].includes('location_coordinates')) {
					coordinates = doc[rule[2][i]];
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

// code for the switching of maps
export const JS_CS_ENGINE = [
	[
		'buklod-official',
		[
			'/app_buklod-tao/js/index.js',
			'/app_buklod-tao/js/firestore.js',
			'/app_buklod-tao/css/form.css',
			//   'buklod-tao-branch/css/login.css',
			'/app_buklod-tao/css/main.css',
		],
	],
	[
		'buklod-official-TEST',
		[
			'/app_buklod-tao/js/index.js',
			'/app_buklod-tao/js/firestore.js',
			'/app_buklod-tao/css/form.css',
			//   'buklod-tao-branch/css/login.css',
			'/app_buklod-tao/css/main.css',
		],
	],
	[
		// TO BE RENAMED TO 'seeds-official'
		'seeds-official',
		[
			'/app_seeds/js/index.js',
			'/app_seeds/js/firestore.js',
			'/app_seeds/css/form.css',
			'/app_seeds/css/modal.css',
		],
	],
	[
		// TO BE RENAMED TO 'seeds-official-TEST'
		'seeds-official-TEST',
		[
			'/app_seeds/js/index.js',
			'/app_seeds/js/firestore.js',
			'/app_seeds/css/form.css',
			'/app_seeds/css/modal.css',
		],
	],

];

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
	for (let rule of JS_CS_ENGINE) {
		if (rule[0] == getCollection().id) {
			for (let i = 0; i < rule[1].length; i++) {
				var new_element = createJsCssFiles(rule[1][i]);
				new_element.setAttribute('id', 'jscss' + i);
				document
					.getElementsByTagName('head')[0]
					.appendChild(new_element);
			}
		}
	}
}
