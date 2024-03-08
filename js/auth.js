import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

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
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// Sign in function
export function signIn(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in successfully
            const user = userCredential.user;
            console.log("User signed in:", user);
        })
        .catch((error) => {
            // Handle errors
            console.error("Error signing in:", error);
        });
}

// Sign out function
export function signOutUser() {
    signOut(auth)
        .then(() => {
            // Signed out successfully
            console.log("User signed out");
        })
        .catch((error) => {
            // Handle errors
            console.error("Error signing out:", error);
        });
}