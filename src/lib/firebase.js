// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAa4tDz396woxHTKxucccsQ67v3SGObjEg",
  authDomain: "balello.firebaseapp.com",
  projectId: "balello",
  storageBucket: "balello.appspot.com",
  messagingSenderId: "721759265208",
  appId: "1:721759265208:web:ee859d937510ec3b08af4d",
  measurementId: "G-8JSEQ7C44T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const _db = getFirestore(app);
if (process.env.NODE_ENV === "development")
  connectFirestoreEmulator(_db, "localhost", 8080);
export const db = _db;
