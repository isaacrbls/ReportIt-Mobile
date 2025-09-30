import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOz81U2qnC2MEq-P1yMbUiQW8qAPTh9OU",
  authDomain: "admin-76567.firebaseapp.com",
  databaseURL: "https://admin-76567-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "admin-76567",
  storageBucket: "admin-76567.firebasestorage.app",
  messagingSenderId: "189749622351",
  appId: "1:189749622351:web:35d81c4e4514b873985c3a",
  measurementId: "G-CQFJZ4N4NM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Initialize Firestore and get a reference to the service
export const firestore = getFirestore(app);

export default app;