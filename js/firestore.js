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
  apiKey: "AIzaSyAeo2wTJFotROMNPa4UHXo2MqPaW8k07us",
  authDomain: "compsat-sdece.firebaseapp.com",
  databaseURL:
    "https://compsat-sdece-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "compsat-sdece",
  storageBucket: "compsat-sdece.appspot.com",
  messagingSenderId: "46954820322",
  appId: "1:46954820322:web:c19499507632da09a2a4bb",
  measurementId: "G-RPZYTFB5KC",
};
initializeApp(firebaseConfig);
const db = getFirestore();
const colRef = collection(db, "partners2");
let partnersArray = [];

export function getDocIdByPartnerName(partnerName) {
  return getDocs(query(colRef, where("partnerName", "==", partnerName)))
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        // Assuming there is only one document with the given partner name
        const doc = querySnapshot.docs[0];
        return doc.id;
      } else {
        console.log("No matching document found.");
        return null;
      }
    })
    .catch((error) => {
      console.error("Error getting documents: ", error);
      return null;
    });
}

export function getDocByID(docId) {
  const docReference = doc(db, "partners2", docId);
  let docObj = {};
  return getDoc(docReference).then((doc) => {
    docObj = doc.data();
    return docObj;
  });
}

// get docs from firestore

getDocs(colRef)
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (doc.data().name !== "Test 2" || doc.data().name !== "Test2") {
        partnersArray.push(doc.data());
      }
    });

    // populate ul with partners
    partnersArray.forEach((partner) => {
      console.log(partner.name);
      const containerDiv = document.createElement("div");
      const img = document.createElement("svg");
      const listItem = document.createElement("li");
      const anchor = document.createElement("a");

      // set attributes
      anchor.href = "#";
      anchor.textContent = partner.name;
      anchor.addEventListener("click", () => {
        showModal(partner);
      });

      // add class to variables
      containerDiv.classList.add("accordion");
      img.classList.add("accordion");
      listItem.classList.add("accordion");
      anchor.classList.add("accordion");
      anchor.classList.add("link");

      // append to DOM
      containerDiv.appendChild(img);
      listItem.appendChild(anchor);
      containerDiv.appendChild(listItem);
      locationList.appendChild(containerDiv);
    });
  })
  .catch((error) => {
    console.error("Error getting documents: ", error);
  });

function showModal(partner) {
  const modal = document.getElementById("partnerModal");
  const modalContent = document.getElementById("modalContent");

  // Clear previous content
  modalContent.innerHTML = "";

  // Create div elements for each piece of information
  const nameDiv = document.createElement("div");
  const latitudeDiv = document.createElement("div");
  const longitudeDiv = document.createElement("div");
  const contactPersonDiv = document.createElement("div");
  const activityDiv = document.createElement("div");
  const admuContactDiv = document.createElement("div");
  const admuEmailDiv = document.createElement("div");
  const admuOfficeDiv = document.createElement("div");
  const orgDiv = document.createElement("div");
  const datesDiv = document.createElement("div");

  // Set the content of each div
  nameDiv.textContent = "Name: " + partner.name;
  latitudeDiv.textContent = "Latitude: " + partner.Latitude;
  longitudeDiv.textContent = "Longitude: " + partner.Longitude;
  contactPersonDiv.textContent =
    "Contact Person: " + partner["`partner-contact`"];
  activityDiv.textContent = "Activity: " + partner.activity;
  admuContactDiv.textContent = "AdMU Contact: " + partner["`admu-contact`"];
  admuEmailDiv.textContent = "AdMU Email: " + partner["`admu-email`"];
  admuOfficeDiv.textContent = "AdMU Office: " + partner["`admu-office`"];
  orgDiv.textContent = "Organization: " + partner.org;

  // Append the div elements to the modal content
  modalContent.appendChild(nameDiv);
  modalContent.appendChild(latitudeDiv);
  modalContent.appendChild(longitudeDiv);
  modalContent.appendChild(contactPersonDiv);
  modalContent.appendChild(activityDiv);
  modalContent.appendChild(admuContactDiv);
  modalContent.appendChild(admuEmailDiv);
  modalContent.appendChild(admuOfficeDiv);
  modalContent.appendChild(orgDiv);
  modalContent.appendChild(datesDiv);

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

export function addLocation(
  name,
  partnerContact,
  partnerAddress,
  pContactEmail,
  pContactNumber,
  activities,
  latitude,
  longitude
) {
  addDoc(colRef, {
    partnerName: name,
    partnerContact: partnerContact,
    partnerAddress: partnerAddress,
    pContactEmail: pContactEmail,
    pContactNumber: pContactNumber,
    location: new firebase.firestore.GeoPoint(latitude, longitude),
    activities: activities,
  })
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
}

export function editLocation(
  docId,
  name,
  partnerContact,
  partnerAddress,
  pContactEmail,
  pContactNumber,
  activities,
  latitude,
  longitude
) {
  const docReference = doc(db, "partners2", docId);
  const updateData = {
    partnerName: name,
    partnerContact: partnerContact,
    partnerAddress: partnerAddress,
    pContactEmail: pContactEmail,
    pContactNumber: pContactNumber,
    location: new firebase.firestore.GeoPoint(latitude, longitude),
    activities: activities,
  };
  return updateDoc(docReference, updateData)
    .then(() => {
      console.log("Document updated successfully");
      alert("Document updated successfully");
    })
    .catch((error) => {
      console.error("Error updating document: ", error);
    });
}
