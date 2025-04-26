import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD3bhk7aPxFUPWIL_0mZtor-6HYtfn-u1U",
  authDomain: "trip-project-86805.firebaseapp.com",
  projectId: "trip-project-86805",
  storageBucket: "trip-project-86805.appspot.com",
  messagingSenderId: "104977526170",
  appId: "1:104977526170:web:69523c2548a6467bfade23",
  measurementId: "G-DJPXMXET0J",
};

const app = initializeApp(firebaseConfig);

// Get Firestore and Auth references
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Helper functions for authentication
const signInWithGoogle = async () => {
  try {
    // Clear any previous authentication state
    await auth.signOut().catch(() => {});
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

const registerWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error registering with email", error);
    throw error;
  }
};

const loginWithEmail = async (email, password) => {
  try {
    // Clear any previous authentication state
    await auth.signOut().catch(() => {});
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error logging in with email", error);
    throw error;
  }
};

const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
    return true;
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

// Export db, auth, storage and auth helper functions
export {
  db,
  auth,
  storage,
  signInWithGoogle,
  registerWithEmail,
  loginWithEmail,
  signOutUser,
};
