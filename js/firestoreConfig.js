// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
  export const db = getFirestore();
  export const colRef = collection(db, "partners-2");
  export let partnersArray = [];