// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBG61IHF96cz6rZaByQ__97j3ypj0HGDk",
  authDomain: "transitgo-9bb95.firebaseapp.com",
  projectId: "transitgo-9bb95",
  storageBucket: "transitgo-9bb95.firebasestorage.app",
  messagingSenderId: "354695441166",
  appId: "1:354695441166:web:46fe2ed6884ec7b364455f",
  measurementId: "G-4MZNMEWV5X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { analytics, db };