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
const colRef = collection(db, "partners-2");
let partnersArray = [];

export function getDocIdByPartnerName(partnerName) {
  const endName = partnerName.replace(/\s/g, "\uf8ff");
  return getDocs(
    query(
      colRef,
      where("partnerName", ">=", partnerName),
      where("partnerName", "<=", partnerName + endName)
    )
  )
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
  const docReference = doc(db, "partners-2", docId);
  console.log(docReference);
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
      console.log(partner);

      // Creating DOM elements
      const containerDiv = document.createElement("div");
      const img = document.createElement("svg");
      const listItem = document.createElement("li");
      const anchor = document.createElement("a");
      const nameDiv = document.createElement("div");
      const addressDiv = document.createElement("div");
      const activityDiv = document.createElement("div");

      // Set attributes
      anchor.href = "#";

      anchor.addEventListener("click", () => {
        showModal(partner);
      });

      // Adding classes and setting text content
      nameDiv.classList.add("name");
      addressDiv.classList.add("address");
      activityDiv.classList.add("activity");

      nameDiv.textContent = partner.partnerName;
      addressDiv.textContent = partner.partnerAddress;
      activityDiv.textContent = "";

      if (partner.activities.length > 0)      // check if list of activities is present, otherwise is skipped to avoid errors
      {
        partner.activities.forEach( (activity) => {
          activityDiv.textContent = activityDiv.textContent + activity.activityName + "\n";
        });
      }
      

      listItem.classList.add("accordion");
      anchor.classList.add("accordion", "link");

      // Append elements to the DOM
      anchor.appendChild(nameDiv);
      anchor.appendChild(addressDiv);
      anchor.appendChild(activityDiv);

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
  const modalContent = document.getElementById("modalContent");

  // Clear previous content
  modalContent.innerHTML = "";

  // Create div elements for each piece of information
  const nameDiv = document.createElement("div");
  const addressDiv = document.createElement("div");
  const contactPersonDiv = document.createElement("div");
  const activityDiv = document.createElement("div");
  const admuContactDiv = document.createElement("div");
  const admuEmailDiv = document.createElement("div");
  const admuOfficeDiv = document.createElement("div");
  const orgDiv = document.createElement("div");
  const datesDiv = document.createElement("div");

  nameDiv.classList.add("modal-name");
  addressDiv.classList.add("modal-address");

  activityDiv.classList.add("modal-activity");

  // Set the content of each div
  nameDiv.textContent = partner.partnerName;
  addressDiv.textContent =
    "Latitude: " + partner.location.latitude + " Longitude: " + partner.location.longitude;
    contactPersonDiv.textContent = "Contact Person: " + activity['partnerContact'];

  partner.activities.forEach((activity) => {
    activityDiv.textContent = "Activity: " + activity['activityName'];
    admuContactDiv.textContent = "AdMU Contact: " + activity['ateneoContactEmail'];
    admuEmailDiv.textContent = "AdMU Email: " + activity['ateneoOverseeingOfficeEmail'];
    admuOfficeDiv.textContent = "AdMU Office: " + partner["`ateneoOverseeingOfficeEmail`"];
    orgDiv.textContent = "Organization: " + partner.org;
  });
  

  // Append the div elements to the modal content
  modalContent.appendChild(nameDiv);
  modalContent.appendChild(addressDiv);
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
  activity,
  admuContact,
  admuEmail,
  admuOffice,
  org,
  partnerContact,
  dates,
  latitude,
  longitude
) {
  addDoc(colRef, {
    name: name,
    activity: activity,
    "`admu-contact`": admuContact,
    "`admu-email`": admuEmail,
    "`admu-office`": admuOffice,
    org: org,
    "`partner-contact`": partnerContact,
    dates: dates,
    Latitude: latitude,
    Longitude: longitude,
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
  activity,
  admuContact,
  admuEmail,
  admuOffice,
  org,
  partnerContact,
  dates
) {
  const docReference = doc(db, "partners-2", docId);
  const updateData = {
    name: name,
    activity: activity,
    "`admu-contact`": admuContact,
    "`admu-email`": admuEmail,
    "`admu-office`": admuOffice,
    org: org,
    "`partner-contact`": partnerContact,
    dates: dates,
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
