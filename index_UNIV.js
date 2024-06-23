
import { DB_RULES_AND_DATA, getDocByID, getDocIdByPartnerName, getCollection } from "/firestore_UNIV.js";
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
              div_content += `<div class="partner-contact"> <div class="partner-label"> partner-label </div>`;
              for(let i = 0; i < rule[2].length; i++){
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
 
export function searchLocation(name, map) {
  console.log("PANNNNNN to " + name);   
  getDocIdByPartnerName(name).then((docId) => {
    getDocByID(docId).then((doc) => {
      panLocation(doc, map);
    });
  });     
}

export function panLocation(doc, map) {
    console.log("Search location of "+ doc.id);
    doc = doc.data();
    console.log(typeof(map));   
    map.panTo(new L.LatLng(doc.location_latitude, doc.location_longitude));
}

// function onMapClick(e) {
//   const lat = e.latlng.lat;
//   const lng = e.latlng.lng;

//   var popupContent = `
//       <div class="partner-geolocation">
//             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
//             <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C11.337 11.5 10.7011 11.2366 10.2322 10.7678C9.76339 10.2989 9.5 9.66304 9.5 9C9.5 8.33696 9.76339 7.70107 10.2322 7.23223C10.7011 6.76339 11.337 6.5 12 6.5C12.663 6.5 13.2989 6.76339 13.7678 7.23223C14.2366 7.70107 14.5 8.33696 14.5 9C14.5 9.66304 14.2366 10.2989 13.7678 10.7678C13.2989 11.2366 12.663 11.5 12 11.5Z" fill="#91C9DB"/>
//             </svg>
//             ${lat} + ${lng}
//             <br>
//         </div>
//     <button class="addButton" data-lat="${lat}" data-lng="${lng}">Add Location</button>
//   `;

//   popup.setLatLng(e.latlng).setContent(popupContent).openOn(map);

//   var addButton = document.querySelector(".addButton");
//   addButton.addEventListener("click", function () {
//     const lat = this.getAttribute("data-lat");
//     const lng = this.getAttribute("data-lng");

//     window.open(
//       `addloc.html?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(
//         lng
//       )}`,
//       "_blank"
//     );
//   });
// }
// ////




// Utility Function for Front-end (remove underscores from a string)
export function removeUnderscoresFromField(field) {
  const words = field.replace("_", ` `);
  return words;
}

// Utility function for Front-end (Capitalize Like This)
// USE AFTER removeUnderscoresFromField 
export function capitalizeFirstLetters(field) { 
  const words = field.split(" ");
  for(let i = 0; i < words.length; i++){  
    words[i] = words[i].charAt(0).toUpperCase() + words[i].substr(1);
  }
  return words.join(" ");
}

// Utility function for Front-end
export function readyField(field){
  field = removeUnderscoresFromField(field);
  field = capitalizeFirstLetters(field);
  return field;
}





