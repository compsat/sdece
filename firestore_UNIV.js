import {
    getDocs,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    getDoc,
  } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";

import {
    getFirestore,
    collection,
  } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

console.log("UNIVERSAL JS LOADING ");
  
export const firebaseConfig = {
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
export const DB = getFirestore();

var col_ref = null; // collrection reference

export let partnersArray = [];

// General format of the rule engine
const DB_RULES_AND_DATA = [
    // ["collection_name", "identifier", 
		//     ["field1", ... ,"fieldN"] ]; 
    ["buklod-official", "household_name", 
	    [
        "contact_number",
        "earthquake_risk",
        "fire_risk",
        "flood_risk",
        "household_address",
        "household_material",
        "household_name",
        "household_phase",
        "is_hoa_noa",
        "landslide_risk",
        "location_latitude",
        "location_longitude",
        "location_link",
        "nearest_evac",
        "number_minors",
        "number_pregnant",
        "number_pwd",
        "number_residents",
        "number_seniors",
        "number_sick",
        "residency_status",
        "sickness_present",
        "status",
        "storm_risk", ],
    ],
    ["sdece-final", "partner_name", 
	    [
		    "partner_latitude",
		    "partner_longitude",
		    "partner_location",
		    "partner_city",
		    "partner_name",
		    "additional_partnership",
		    "partner_contact",
		    "partner_number",
		    "partner_email",
		    "activity_date",
		    "activity_nature",
		    "activity_name",
		    "organization_unit",
		    "admu_office",
		    "admu_contact",
		    "admu_email",
	    ],
    ]
	    
];

export function setCollection(collection_name){
    console.log("collection name: " + collection_name);
    
    for( let rule of DB_RULES_AND_DATA ){
        console.log("rule[0]: " + rule[0]);
        if (rule[0] === collection_name){
            console.log("IS EQUAL");
            col_ref = collection( DB, collection_name );
        }
    }

    console.log(col_ref);
}

export function getCollection(){
    return col_ref;
}

export function getDocIdByPartnerName(partner_name) {
    console.log("GET_DOC_ID_BY_PARTNER_NAME " + partner_name + " in " + col_ref.id);
    const endName = partner_name.replace(/\s/g, "\uf8ff");

    //rule loop
    for ( let rule of DB_RULES_AND_DATA ){
        if (col_ref.id === rule[0]){
            return getDocs(
                query(
                    col_ref,
                    where(rule[1], ">=", partner_name), // let's wait for Luigi's standardization. IF_ELSE nalang muna 
                    where(rule[1], "<=", partner_name + endName)
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
    }
}

export function getDocsByPartnerName(partner_name){
    console.log("GET_DOC_ID_BY_PARTNER_NAME " + partner_name + " in " + col_ref.id);
    const endName = partner_name.replace(/\s/g, "\uf8ff");

    //rule loop
    for ( let rule of DB_RULES_AND_DATA ){
        if (col_ref.id === rule[0]){
            return getDocs(
                query(
                    col_ref,
                    where(rule[1], ">=", rule[1]), // let's wait for Luigi's standardization. IF_ELSE nalang muna 
                    where(rule[1], "<=", rule[1] + endName)
                )
            )
            .then((querySnapshot) => {
                console.log(querySnapshot);
                if (!querySnapshot.empty) {
                // Assuming there is only one document with the given partner name
                const docs = querySnapshot.docs;
                return docs;
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
    }
}


export function getDocByID(docId) {

    console.log("GET_DOC_ID");

    for (let rule of DB_RULES_AND_DATA){
        console.log(col_ref.id)
        if (col_ref.id === rule[0]){
            const docReference = doc(DB, rule[0], docId);
            let docObj = {};
            return getDoc(docReference).then(
                (doc) => {
                    docObj = doc.data();
                    return docObj;
                }
            );
        }
        
    }    
}

export function addEntry(inp_array){ //addDoc is a builtin function
    console.log("add Entry");

    for (let rule of DB_RULES_AND_DATA){
        if(rule[0] === col_ref.id){
            let input = {}; // contents depend on the rule engine
            for(let i = 0; i < inp_array.length; i++){
                input[rule[2][i]] = inp_array[i];
            }
            addDoc(col_ref, input).then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
              })
              .catch((error) => {
                console.error("Error adding document: ", error);
              });
            break;
        }
    }
}

export function editEntry(inp_array, docId){
    console.log("edit entry with id "+docId);
    
    for (let rule of DB_RULES_AND_DATA){
        if(rule[0] === col_ref.id){
            const docReference = doc(DB, rule[0], docId);

            let input = {}; // contents depend on the rule engine
            for(let i = 0; i < inp_array.length; i++){
                input[rule[2][i]] = inp_array[i];
            }
            updateDoc(docReference, input).then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
              })
              .catch((error) => {
                console.error("Error adding document: ", error);
              });
            break;
        }
    }
}