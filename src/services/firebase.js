import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyA2iXaSBC5phv7g72Xf-tJuJcmeLAqaPK0",
  authDomain: "override-racing-league.firebaseapp.com",
  databaseURL: "https://override-racing-league-default-rtdb.firebaseio.com",
  projectId: "override-racing-league",
  storageBucket: "override-racing-league.firebasestorage.app",
  messagingSenderId: "480268415862",
  appId: "1:480268415862:web:a5e1bcd8293d1461878057",
  measurementId: "G-VR2J4ZL8HB"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app); // <