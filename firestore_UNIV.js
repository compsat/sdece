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

export const DB_RULES_AND_DATA = [
    // ["param1", "param2",...,"paramN",["key1", "key2",...,"keyN"]]
    ["partner-2", ["partner"]],
    ["nstp-3", ["household_name"]],
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

export function getDocIdByPartnerName(partnerName) {
    const endName = partnerName.replace(/\s/g, "\uf8ff");

    //rule loop
    for ( let rule of DB_RULES_AND_DATA){
        if (col_ref.id === rule[0]){
            return getDocs(
                query(
                    col_ref,
                    where(rule[1][0], ">=", partnerName), // let's wait for Luigi's standardization. IF_ELSE nalang muna 
                    where(rule[1][0], "<=", partnerName + endName)
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
    }
}

export function getDocByID(docId) {
    for (let rule of DB_RULES_AND_DATA){
        if (col_ref.id === rule[0]){
            const docReference = doc(DB, rule[0], docId);
            let docObj = {};
            return getDoc(docReference).then(
                (doc) => {
                    docObj = doc;
                    return docObj;
                }
            );
        }
    }    
}

