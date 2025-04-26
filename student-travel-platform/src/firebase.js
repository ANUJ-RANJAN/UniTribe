import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getAuth } from "firebase/auth"; // Import Auth (if needed)
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3bhk7aPxFUPWIL_0mZtor-6HYtfn-u1U",
  authDomain: "trip-project-86805.firebaseapp.com",
  databaseURL: "https://trip-project-86805-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "trip-project-86805",
  storageBucket: "trip-project-86805.firebasestorage.app",
  messagingSenderId: "104977526170",
  appId: "1:104977526170:web:69523c2548a6467bfade23",
  measurementId: "G-DJPXMXET0J"
};
const app = initializeApp(firebaseConfig);

// Get Firestore and Auth references
const db = getFirestore(app);
const auth = getAuth(app);

// Export db and auth
export { db, auth };