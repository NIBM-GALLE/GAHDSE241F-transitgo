import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBBG61IHF96cz6rZaByQ__97j3ypj0HGDk",
  authDomain: "transitgo-9bb95.firebaseapp.com",
  projectId: "transitgo-9bb95",
  storageBucket: "transitgo-9bb95.firebasestorage.app",
  messagingSenderId: "354695441166",
  appId: "1:354695441166:web:46fe2ed6884ec7b364455f",
  measurementId: "G-4MZNMEWV5X",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
