import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js';

const SECRETS_PATH = "/js/secrets.json";
const SECRETS_REQ = new Request(SECRETS_PATH);
const SECRETS_RES = await fetch(SECRETS_REQ);
const SECRETS = await SECRETS_RES.json();

export const FIREBASE_CONFIG = SECRETS.FIREBASE_CONFIG; 

initializeApp(FIREBASE_CONFIG);
export const AUTH = getAuth();

// Sign in function
export function signIn(email, password) {
    return signInWithEmailAndPassword(AUTH, email, password)
        .then((userCredential) => {
            const USER = userCredential.user;
            alert("Login Successful");
            window.location.replace("/index.html");
        })
        .catch((error) => {
            console.error("Error signing in:", error);
            alert("Error Signing in. Please check username and password");
            throw error;
        });
}

export function signUp({ firstName, lastName, email, password }) {
    return createUserWithEmailAndPassword(AUTH, email, password)
        .then(async (userCredential) => {
            const USER = userCredential.user;
            const displayName = `${firstName} ${lastName}`.trim();
            if (displayName) {
                await updateProfile(USER, { displayName });
            }
            alert("Account created successfully");
            return USER;
        })
        .catch((error) => {
            console.error("Error signing up:", error);
            alert("Error creating account. Please try again.");
            throw error;
        });
}

// Sign out function
export function signOutUser() {
    signOut(AUTH)
        .then(() => {
            console.log("User signed out");
            window.location.replace("/html/login.html");
        })
        .catch((error) => {
            console.error("Error signing out:", error);
        });
}   

export function getCurrentUser() {
    return AUTH.currentUser;
}

onAuthStateChanged(AUTH, (user) => {
        if(user) {
            console.log("User signed in:", user.email);           
        }
        else {
            console.log("User not signed in");  
        }
   })
