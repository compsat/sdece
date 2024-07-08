import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAcs4DxFX0knEEloIjN_sK6iMugGM7kGmM",
    authDomain: "angelo-authtest.firebaseapp.com",
    projectId: "angelo-authtest",
    storageBucket: "angelo-authtest.appspot.com",
    messagingSenderId: "876214232341",
    appId: "1:876214232341:web:ccd742f75679419933f51c"
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