// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";

import {
    getFirestore,
    collection,
  } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
  
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
export const COLREF = collection(db, "nstp-3");
export let partnersArray = [];