import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    inMemoryPersistence,
    browserSessionPersistence,
    setPersistence,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

import { } from "/firestore_UNIV_v2_mirror.js"; 

const AUTH = getAuth();

export function getCurrentUser(){
    return AUTH.currentUser;
}
// Sign in function
export function signIn(email, password) {
    signInWithEmailAndPassword(AUTH, email, password)
        .then((userCredential) => {
            // Signed in successfully
            const USER = userCredential.user;
                
            onAuthStateChanged(AUTH, (user) => {
                if(user) {
                    console.log("User signed in:", USER);
                    window.location.replace("index.html");
                }
                else {
                    console.log("User not signed in");
                }
            })
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
