import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA8QWgic_hjbDL-EYIkvSRRII_yfTRdtOQ",
    authDomain: "discs-osci-prj.firebaseapp.com",
    projectId: "discs-osci-prj",
    storageBucket: "discs-osci-prj.appspot.com",
    messagingSenderId: "601571823960",
    appId: "1:601571823960:web:1f1278ecb86aa654e6152d",
    measurementId: "G-9N9ELDEMX9"
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