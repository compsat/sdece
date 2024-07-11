import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { } from "/firestore_UNIV_v2_mirror.js"; 

const AUTH = getAuth();

// Sign in function
export function signIn(email, password) {
    signInWithEmailAndPassword(AUTH, email, password)
        .then((userCredential) => {
            // Signed in successfully
            const USER = userCredential.user;
            console.log("User signed in:", USER);
            window.location.replace("index.html");
        })
        .catch((error) => {
            // Handle errors
            console.error("Error signing in:", error);
        });
}

// Sign out function
export function signOutUser() {
    signOut(AUTH)
        .then(() => {
            // Signed out successfully
            console.log("User signed out");
            window.location.replace("login.html");
        })
        .catch((error) => {
            // Handle errors
            console.error("Error signing out:", error);
        });
}   
