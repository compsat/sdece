import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { } from "/firestore_UNIV_v2_mirror.js"; 

const auth = getAuth();

// Sign in function
export function signIn(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in successfully
            console.log(userCredential); 
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
