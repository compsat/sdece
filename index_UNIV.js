import {
	DB_RULES_AND_DATA,
	getDocByID,
	getDocIdByPartnerName,
	getCollection,
} from '/firestore_UNIV.js';

// Global Map Variable (the map shown)
export var map = L.map('map').setView([14.5995, 120.9842], 10);

function panLocation(doc, map) {
	for (let rule of DB_RULES_AND_DATA) {
		if (getCollection().id === rule[0]) {
			var coordinates;
			for (let i = 0; i < rule[2].length; i++) {
				if (rule[2][i].includes('coordinates')) {
					coordinates = doc.get(rule[2][i]);
					console.log(coordinates);
					map.panTo(
						new L.LatLng(
							coordinates.latitude,
							coordinates.longitude
						)
					);
					break;
				}
			}
		}
	}
}

function searchLocation(name, map) {
	console.log('Calling searchLocation() on ' + name);
	getDocIdByPartnerName(name).then((docId) => {
		getDocByID(docId).then((doc) => {
			panLocation(doc, map);
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
		searchLocation(event.target.innerHTML, map);
		console.log('Calling searchLocation()');
	});
	console.log('added');
}

export function clearMarkers() {
	console.log('test');
	map.eachLayer((layer) => {
		if (layer instanceof L.Marker) {
			layer.remove();
		}
	});
}

export function clearLocationList() {
	console.log('test2');
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
    ]

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
}




