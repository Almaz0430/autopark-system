
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTdkRQUoEWJFTXNP5vGD8_DYZjLcyDpog",
  authDomain: "autopark-system.firebaseapp.com",
  projectId: "autopark-system",
  storageBucket: "autopark-system.firebasestorage.app",
  messagingSenderId: "375110425620",
  appId: "1:375110425620:web:0f357c1d44927b0d219b01",
  measurementId: "G-2VV3093XBH"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);
const messaging = getMessaging(app);

export { app, auth, firestore, messaging };
