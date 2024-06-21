import {
	DB_RULES_AND_DATA,
	getDocByID,
	getDocIdByPartnerName,
	getCollection,
} from '/firestore_UNIV.js';


/// Will need to change how we do this if we ever restructure again
export var map = L.map("map").setView([0, 0], 21);

// Takes in a name to determine all field values which should be displayed
// Current Issue: it doesn't display all the added things, could be due to the async nature of these functions
export function getDivContent(name) {
    var div_content = ``; // This isn't affected, this is the one getting printed
    return getDocIdByPartnerName(name).then((docId) => {
      if (docId) {
        // console.log("is this seen")
        return getDocByID(docId).then((doc) => {
          // Insert the partner details into the div with class "partner-contact"
          for(let rule of DB_RULES_AND_DATA){
            if(getCollection().id === rule[0]){    
              div_content += `<div class="partner-contact"> <div class="partner-label"> ${doc.get(rule[1])} </div>`;
              for(let i = 0; i < rule[2].length; i++){
                if(rule[2][i].includes("coordinates")){
                  div_content += `<div class="partner-activity"> ${readyField(rule[2][i])}: ${doc.get(rule[2][i]).latitude 
                    + " + " + doc.get(rule[2][i]).longitude}`;
                  continue 
                }
                div_content += `<div class="partner-activity"> ${readyField(rule[2][i])}: ${doc.get(rule[2][i])}`;
              }
              div_content += `</div>`;
              break;
            }
          }            
          return div_content;
        });
      } else{
          console.log("No matching partner found.");
          div_content = "no partner";
        return div_content;
      }
    });
  }

function panLocation(doc, map) {
  for(let rule of DB_RULES_AND_DATA){
    if(getCollection().id === rule[0]){
      var coordinates;
      for(let i = 0; i < rule[2].length; i++){
        if(rule[2][i].includes("coordinates")){
          coordinates = doc.get(rule[2][i]);
          console.log(coordinates);
	        map.panTo(new L.LatLng(coordinates.latitude, coordinates.longitude));
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
export function addListeners(){
  var locationList = document.getElementById(`locationList`);
  locationList.addEventListener('click', (event) => {
    searchLocation(event.target.innerHTML, map);
    console.log('Calling searchLocation()');
  });
  console.log("added");
}

export function clearMarkers(){
  console.log("test");
  map.eachLayer((layer) => {
    if(layer instanceof L.Marker) {
      layer.remove();
    }
  })
}

export function clearLocationList(){
  console.log("test2");
  var locationList = document.getElementById(`locationList`);
  locationList.innerHTML = "";
}