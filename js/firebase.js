import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, query, where, orderBy, doc, updateDoc, deleteDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Note: Using 10.9.0 for stability, API is identical to 12.x for these core functions
const firebaseConfig = {
  apiKey: "AIzaSyAHFXWqfIWE0KV74crZ9zFRZ3zY2me6UBY",
  authDomain: "medical-store-app-379b0.firebaseapp.com",
  projectId: "medical-store-app-379b0",
  storageBucket: "medical-store-app-379b0.firebasestorage.app",
  messagingSenderId: "858745180405",
  appId: "1:858745180405:web:ed982b37f0b8eb17af75bc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.firebaseClient = {
  app,
  auth,
  db,
  authOps: { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile },
  dbOps: { collection, getDocs, addDoc, query, where, orderBy, doc, updateDoc, deleteDoc, getDoc, setDoc }
};

window.dispatchEvent(new Event('firebase-ready'));
