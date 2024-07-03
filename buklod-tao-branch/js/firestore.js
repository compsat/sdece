// FIRESTORE DATABASE

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { getCollection, setCollection } from "/firestore_UNIV.js";
// Your Firestore code here

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8QWgic_hjbDL-EYIkvSRRII_yfTRdtOQ",
  authDomain: "discs-osci-prj.firebaseapp.com",
  projectId: "discs-osci-prj",
  storageBucket: "discs-osci-prj.appspot.com",
  messagingSenderId: "601571823960",
  appId: "1:601571823960:web:1f1278ecb86aa654e6152d",
  measurementId: "G-9N9ELDEMX9",
};
initializeApp(firebaseConfig);
const db = getFirestore();
setCollection("buklod-official");
const colRef = getCollection();
let partnersArray = [];

export function getDocIdByPartnerName(partnerName) {
  const endName = partnerName.replace(/\s/g, "\uf8ff");
  return getDocs(
    query(
      colRef,
      where("household_name", ">=", partnerName),
      where("household_name", "<=", partnerName + endName)
    )
  )
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        // Assuming there is only one document with the given partner name
        const doc = querySnapshot.docs[0];
        return doc.id;
      } else {
        console.log("EMPTY: No matching document found.");
        return null;
      }
    })
    .catch((error) => {
      console.error("Error getting documents: ", error);
      return null;
    });
}

export function getDocByID(docId) {
  const docReference = doc(db, "nstp-3", docId);
  let docObj = {};
  return getDoc(docReference)
    .then((doc) => {
    docObj = doc.data();
    return docObj;
  });
}

// get docs from firestore

export function getPartnersArray()
{
  return partnersArray;
}

getDocs(colRef)
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (doc.data().name !== "Test 2" || doc.data().name !== "Test2") {
        partnersArray.push(doc.data());
      }
    });

    // populate ul with partners
    partnersArray.forEach((partner) => {

      // Creating DOM elements
      const containerDiv = document.createElement("div");
      const img = document.createElement("svg");
      const listItem = document.createElement("li");
      const anchor = document.createElement("a");
      const nameDiv = document.createElement("div");
      const addressDiv = document.createElement("div");

      // Set attributes
      anchor.href = "#";

      anchor.addEventListener("click", () => {
        showModal(partner);
      });

      // Adding classes and setting text content
      nameDiv.classList.add("name");
      addressDiv.classList.add("address");

      nameDiv.textContent = partner.household_name;
      addressDiv.textContent = partner.household_address + " " + partner.household_phase;
      
      listItem.classList.add("accordion");
      anchor.classList.add("accordion", "link");
      containerDiv.classList.add("container-entry");

      // Append elements to the DOM
      anchor.appendChild(nameDiv);
      anchor.appendChild(addressDiv);

      listItem.appendChild(anchor);
      containerDiv.appendChild(img);
      containerDiv.appendChild(listItem);
      locationList.appendChild(containerDiv);
    });
  })
  .catch((error) => {
    console.error("Error getting documents: ", error);
  });



function showModal(partner) {
  const modal = document.getElementById("partnerModal");
  const modalHeader = document.getElementById("modalHeader");
  const modalContactNumber = document.getElementById("entry_contact_number");
  const modalAddress = document.getElementById("entry_address");
  const modalResidencyStatus = document.getElementById("entry_residency_status");
  const modalHOA = document.getElementById("entry_HOA/NOA");
  const modalEvacArea = document.getElementById("entry_nearest_evacuation_area");
  const modalEarthquakeRL = document.getElementById("entry_earthquake_risk_level");
  const modalEarthquakeDesc = document.getElementById("entry_earthquake_desc");
  const modalFireRL = document.getElementById("entry_fire_risk_level");
  const modalFireDesc = document.getElementById("entry_fire_desc");
  const modalFloodRL = document.getElementById("entry_flood_risk_level");
  const modalFloodDesc = document.getElementById("entry_flood_desc");
  const modalLandslideRL = document.getElementById("entry_landslide_risk_level");
  const modalLandslideDesc = document.getElementById("entry_landslide_desc");
  const modalStormRL = document.getElementById("entry_storm_risk_level");
  const modalStormDesc = document.getElementById("entry_storm_desc");
  const modalTotal = document.getElementById("entry_number_of_residents");
  const modalMinor = document.getElementById("entry_number_of_minor_residents");
  const modalSenior = document.getElementById("entry_number_of_senior_residents");
  const modalPWD = document.getElementById("entry_number_of_pwd_residents");
  const modalSick = document.getElementById("entry_number_of_sick_residents");
  const modalPregnant = document.getElementById("entry_number_of_pregnant_residents");

  // Clear previous content
  modalHeader.innerHTML = "";
  modalContactNumber.innerHTML = "";
  modalAddress.innerHTML = "";
  modalResidencyStatus.innerHTML = "";
  modalHOA.innerHTML = "";
  modalEvacArea.innerHTML = "";
  modalEarthquakeRL.innerHTML = "";
  modalEarthquakeDesc.innerHTML = "";
  modalFireRL.innerHTML = "";
  modalFireDesc.innerHTML = "";
  modalFloodRL.innerHTML = "";
  modalFloodDesc.innerHTML = "";
  modalLandslideRL.innerHTML = ""; 
  modalLandslideDesc.innerHTML = "";
  modalStormRL.innerHTML = "";
  modalStormDesc.innerHTML = "";
  modalTotal.innerHTML = "";
  modalMinor.innerHTML = "";
  modalSenior.innerHTML = "";
  modalPWD.innerHTML = "";
  modalSick.innerHTML = "";
  modalPregnant.innerHTML = "";
  document.getElementById("default_earthquake").innerHTML = "";
  document.getElementById("default_fire").innerHTML = "";
  document.getElementById("default_flood").innerHTML = "";
  document.getElementById("default_landslide").innerHTML = "";
  document.getElementById("default_storm").innerHTML = "";

  // Create div elements for each piece of information
  const nameDiv = document.createElement("div");
  const contactNumberDiv = document.createElement("div");
  const addressDiv = document.createElement("div");
  const residentsDiv = document.createElement("div");
  const isHOANOADiv = document.createElement("div");
  const evacAreaDiv = document.createElement("div");
  const earthquakeRiskLevelDiv = document.createElement("div");
  const earthquakeRiskDescDiv = document.createElement("div");
  const fireRiskLevelDiv = document.createElement("div");
  const fireRiskDescDiv = document.createElement("div");
  const floodRiskLevelDiv = document.createElement("div");
  const floodRiskDescDiv = document.createElement("div");
  const landslideRiskLevelDiv = document.createElement("div");
  const landslideRiskDescDiv = document.createElement("div");
  const stormRiskLevelDiv = document.createElement("div");
  const stormRiskDescDiv = document.createElement("div");
  const totalResidentsDiv = document.createElement("div");
  const minorResidentsDiv = document.createElement("div");
  const seniorResidentsDiv = document.createElement("div");
  const pwdResidentsDiv = document.createElement("div");
  const sickResidentsDiv = document.createElement("div");
  const pregnantResidentsDiv = document.createElement("div");

  var earthquake = partner.earthquake_risk;
  var earthquake_split = earthquake.split(' RISK: ');
  var earthquake1 = earthquake_split[0];
  var earthquake2 = earthquake_split[1];
  var fire = partner.fire_risk;
  var fire_split = fire.split(' RISK: ');
  var fire1 = fire_split[0];
  var fire2 = fire_split[1];
  var flood = partner.flood_risk;
  var flood_split = flood.split(' RISK: ');
  var flood1 = flood_split[0];
  var flood2 = flood_split[1];
  var landslide = partner.landslide_risk;
  var landslide_split = landslide.split(' RISK: ');
  var landslide1 = landslide_split[0];
  var landslide2 = landslide_split[1];
  var storm = partner.storm_risk;
  var storm_split = storm.split(' RISK: ');
  var storm1 = storm_split[0];
  var storm2 = storm_split[1];

  //styling
  //nameDiv.classList.add("modal-name");
  //addressDiv.classList.add("modal-address");
  //riskDiv.classList.add("modal-activity");

  // Set the content of each div
  nameDiv.textContent = partner.household_name;
  contactNumberDiv.innerHTML = partner.contact_number;
  addressDiv.textContent = partner.household_address;
  residentsDiv.innerHTML = partner.residency_status;
  isHOANOADiv.innerHTML = partner.is_hoa_noa;
  evacAreaDiv.innerHTML = partner.nearest_evac;
  earthquakeRiskLevelDiv.innerHTML = earthquake1 + " RISK";
  earthquakeRiskDescDiv.innerHTML = earthquake2;
  fireRiskLevelDiv.innerHTML = fire1  + " RISK";
  fireRiskDescDiv.innerHTML = fire2;
  floodRiskLevelDiv.innerHTML = flood1  + " RISK";
  floodRiskDescDiv.innerHTML = flood2;
  landslideRiskLevelDiv.innerHTML = landslide1  + " RISK";
  landslideRiskDescDiv.innerHTML = landslide2;
  stormRiskLevelDiv.innerHTML = storm1  + " RISK";
  stormRiskDescDiv.innerHTML = storm2;
  totalResidentsDiv.innerHTML = partner.number_residents;
  minorResidentsDiv.innerHTML = partner.number_minors;
  seniorResidentsDiv.innerHTML = partner.number_seniors;
  pwdResidentsDiv.innerHTML = partner.number_pwd;
  sickResidentsDiv.innerHTML = partner.number_sick;
  pregnantResidentsDiv.innerHTML = partner.number_pregnant;
  
  // Append the div elements to the modal content
  modalHeader.appendChild(nameDiv);
  modalContactNumber.appendChild(contactNumberDiv);
  modalAddress.appendChild(addressDiv);
  modalResidencyStatus.appendChild(residentsDiv);
  modalHOA.appendChild(isHOANOADiv);
  modalEvacArea.appendChild(evacAreaDiv);
  modalEarthquakeRL.appendChild(earthquakeRiskLevelDiv);
  modalEarthquakeDesc.appendChild(earthquakeRiskDescDiv);
  modalFireRL.appendChild(fireRiskLevelDiv);
  modalFireDesc.appendChild(fireRiskDescDiv);
  modalFloodRL.appendChild(floodRiskLevelDiv);
  modalFloodDesc.appendChild(floodRiskDescDiv);
  modalLandslideRL.appendChild(landslideRiskLevelDiv);
  modalLandslideDesc.appendChild(landslideRiskDescDiv);
  modalStormRL.appendChild(stormRiskLevelDiv);
  modalStormDesc.appendChild(stormRiskDescDiv);
  modalTotal.appendChild(totalResidentsDiv);
  modalMinor.appendChild(minorResidentsDiv);
  modalSenior.appendChild(seniorResidentsDiv);
  modalPWD.appendChild(pwdResidentsDiv);
  modalSick.appendChild(sickResidentsDiv);
  modalPregnant.appendChild(pregnantResidentsDiv);

  // Show the modal
  modal.style.display = "block";

  // Close the modal when the close button is clicked
  const closeButton = document.getElementsByClassName("close")[0];
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close the modal when the user clicks outside of it
  window.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

  //script for edit household modal

  // modal
  var editFormModal = document.getElementById("editForm-modal");
  
  // open modal
  var openEditForm = document.getElementById("editHousehold");
  
  // Get the <span> element that closes the modal
  var closeEditForm = document.getElementsByClassName("close-editForm")[0];
  
  // When the user clicks the button, open the modal 
  openEditForm.onclick = function() {
    editFormModal.style.display = "block";
    modal.style.display = "none";
    document.getElementById("edit_household_name").value = partner.household_name;
    document.getElementById("edit_address").value = partner.household_address;
    document.getElementById("edit_contact_number").value = partner.contact_number;
    document.getElementById("edit_residency_status").value = partner.residency_status;
    document.getElementById("edit_HOA/NOA").value = partner.is_hoa_noa;
    document.getElementById("edit_nearest_evacuation_area").value = partner.nearest_evac;
    document.getElementById("edit_number_of_residents").value = partner.number_residents;
    document.getElementById("edit_number_of_minor_residents").value = partner.number_minors;
    document.getElementById("edit_number_of_senior_residents").value = partner.number_seniors;
    document.getElementById("edit_number_of_pwd_residents").value = partner.number_pwd;
    document.getElementById("edit_number_of_sick_residents").value = partner.number_sick;
    document.getElementById("edit_number_of_pregnant_residents").value = partner.number_pregnant;
    document.getElementById("default_earthquake").append(earthquake1);
    document.getElementById("edit_earthquake_desc").value = earthquake2;
    document.getElementById("default_fire").append(fire1);
    document.getElementById("edit_fire_desc").value = fire2;
    document.getElementById("default_flood").append(flood1);
    document.getElementById("edit_flood_desc").value = flood2;
    document.getElementById("default_landslide").append(landslide1);
    document.getElementById("edit_landslide_desc").value = landslide2;
    document.getElementById("default_storm").append(storm1);
    document.getElementById("edit_storm_desc").value = storm2;
  }
  
  // When the user clicks on <span> (x), close the modal
  closeEditForm.onclick = function() {
    editFormModal.style.display = "none";
  }
}

export function addEntry(data){
  data.forEach( (entry) => {
    addDoc(colRef, entry)
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
  })   
}