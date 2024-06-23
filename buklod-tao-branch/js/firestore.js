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
const colRef = collection(db, "buklod-official");
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
      console.log(querySnapshot);
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
      addressDiv.textContent = partner.address + " " + partner.phase;
      
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
  const modalContent = document.getElementById("modalContent");

  // Clear previous content
  modalContent.innerHTML = "";
  modalHeader.innerHTML = "";

  // Create div elements for each piece of information
  const nameDiv = document.createElement("div");
  const addressDiv = document.createElement("div");
  const contactNumberDiv = document.createElement("div");
  const evacAreaDiv = document.createElement("div");
  const riskDiv = document.createElement("div");
  const houseMaterialDiv = document.createElement("div");
  const isHOANOADiv = document.createElement("div");
  const residentsDiv = document.createElement("div");

  nameDiv.classList.add("modal-name");
  addressDiv.classList.add("modal-address");
  

  riskDiv.classList.add("modal-activity");

  // Set the content of each div
  nameDiv.textContent = partner.household_name;
  addressDiv.textContent = partner.address + " " + partner.phase;
  contactNumberDiv.innerHTML = "<b>Contact number: </b>" + partner.contact_number;
  evacAreaDiv.innerHTML = "<b>Nearest evacuation area: </b>" + partner.nearest_evac_area;
  riskDiv.innerHTML = "<h3>Risks:</h3>";
  riskDiv.innerHTML += "<p><b>Earthquake: </b>" + partner.risk_level_earthquake;
  riskDiv.innerHTML += "<p><b>Fire: </b>" + partner.risk_level_fire;
  riskDiv.innerHTML += "<p><b>Flood: </b>" + partner.risk_level_flood;
  riskDiv.innerHTML += "<p><b>Landslide: </b>" + partner.risk_level_landslide;
  riskDiv.innerHTML += "<p><b>Storm: </b>" + partner.risk_level_storm;

  residentsDiv.innerHTML = "<h3>Residents:</h3>";
  residentsDiv.innerHTML += "<div><b>Residency status: </b>" + partner.residency_status + "</div>";
  houseMaterialDiv.innerHTML = "<div><b>House material: </b> " + partner.house_material + "</div>";
  isHOANOADiv.innerHTML = "<div><b>Parte ng HOA/NOA: </b>" + partner.is_hoa_noa + "</div>";
  residentsDiv.innerHTML += "<div><b>Number of residents: </b>" + partner.num_residents + 
    "<ul>" 
    + "<li><b>Minors: </b>" + partner.num_residents_minor + "</li>"
    + "<li><b>Seniors: </b>" + partner.num_residents_senior + "</li>"
    + "<li><b>PWD: </b>" + partner.num_residents_pwd + "</li>"
    + "<li><b>Sick: </b>" + partner.num_residents_sick
    + "</li><li><b>Pregnant: </b>" + partner.num_residents_preg + "</li>"
    + "</ul></div>";
  
  // Append the div elements to the modal content
  modalHeader.appendChild(nameDiv);
  modalHeader.appendChild(addressDiv);
  modalContent.appendChild(contactNumberDiv);
  modalContent.appendChild(evacAreaDiv);
  modalContent.appendChild(riskDiv);
  modalContent.appendChild(residentsDiv);
  modalContent.appendChild(houseMaterialDiv);
  modalContent.appendChild(isHOANOADiv);

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