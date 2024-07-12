import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js';

const SECRETS_PATH = "/secrets.json";
const SECRETS_REQ = new Request(SECRETS_PATH);
const SECRETS_RES = await fetch(SECRETS_REQ);
const SECRETS = await SECRETS_RES.json();

export const firebaseConfig = SECRETS.firebaseConfig; 

initializeApp(firebaseConfig);
const AUTH = getAuth();

// Sign in function
export function signIn(email, password) {
    signInWithEmailAndPassword(AUTH, email, password)
        .then((userCredential) => {
            // Signed in successfully
            const USER = userCredential.user;
            window.location.replace("index.html");
        })
        .catch((error) => {
            // Handle errors
            console.error("Error signing in:", error);
            console.log("SIGN IN ERROR. TRY AGAIN");
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

export function getCurrentUser(thing) {
    return AUTH.user;
}

onAuthStateChanged(AUTH, (user) => {
        if(user) {
            console.log("User signed in:", user.email);           
        }
        else {
            console.log("User not signed in");  
        }
   })