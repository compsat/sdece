import {
	getCollection,
	getDocMap,
} from '/firestore_UNIV_v2_mirror.js';

export var map = L.map('map').setView([14.5995, 120.9842], 10);

let document_map = getDocMap();
console.log("Document map of index_UNIV_v2: ", document_map);

export function panLocation(coordinates, map){ // just a geopoint object
    map.panTo(
        new L.LatLng(
            coordinates.latitude,
            coordinates.longitude
        )
    );
}

export function searchLocation(search_key, desired_value, location_key, map){ // take the geopoint out of a query
    // assume the coordinates can be narrowed down to a single key
    console.log("searching: ", search_key, desired_value, location_key);
    // iterates through all documents
    Object.keys(document_map).every((entry) => {
        if (desired_value == document_map[entry][search_key]){
            panLocation(document_map[entry][location_key], map);
            console.log("panning to: ", document_map[entry][location_key] );
            return false;
        }

        return true; // to continue iteration. This is how .every() works
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
export function addListeners(search_key, location_key) {
	var locationList = document.getElementById(`locationList`);
	locationList.addEventListener('click', (event) => {
        let name = event.target.textContent;
		searchLocation(search_key, name, location_key, map);
		console.log('Calling searchLocation()');
	});
	console.log('added');
}

export function clearMarkers() {
	console.log('removing markers');
	map.eachLayer((layer) => {
		if (layer instanceof L.Marker) {
			layer.remove();
		}
	});
}

export function clearLocationList() {
	console.log('remove location list');
	var locationList = document.getElementById(`locationList`);
	locationList.innerHTML = '';
}

// code for the switching of maps
export const JS_CS_ENGINE = 
    [
      ["buklod-official",
        [
          'buklod-tao-branch/js/index.js',
          'buklod-tao-branch/js/firestore.js',
          'buklod-tao-branch/css/form.css',
          'buklod-tao-branch/css/login.css',
          'buklod-tao-branch/css/main.css',
        ],
      ],
      ["sdece-official",
        [
          '/js/index.js',
          '/js/firestore.js',
          '/css/form.css',
          '/css/login.css',
          '/css/main.css',
        ]    
      ],
    ];

// creates the JS CSS Files
export function createJsCssFiles(file_path){
    // Essentially makes a script object with a src of the file provided by the Rules Engine
  if(file_path.includes(".js")){
    var fileref = document.createElement('script');
    fileref.setAttribute("type","module");
    fileref.setAttribute("src", file_path + "?");
  }
  if(file_path.includes(".css")){
    var fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", file_path + "?");
  }

  return fileref;
}

// Loads the JS CSS Files
export function loadJsCssFiles(file_path){
    // script if javascript, css if link or none;
    for(let rule of JS_CS_ENGINE){
        if(rule[0] == getCollection().id){
            for(let i = 0; i < rule[1].length; i++){
            var new_element = createJsCssFiles(rule[1][i]);
            new_element.setAttribute('id', 'jscss' + i);
            document.getElementsByTagName('head')[0].appendChild(new_element);
            }
        }
    }

    console.log("appended js css files");
}
