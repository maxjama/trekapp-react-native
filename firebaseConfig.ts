import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBm7YwqDxP1cMi9fpC1pmUkfuhd7qVq2k8",
  authDomain: "trekking-app-25db7.firebaseapp.com",
  projectId: "trekking-app-25db7",
  storageBucket: "trekking-app-25db7.appspot.com",
  messagingSenderId: "30699369703",
  appId: "1:30699369703:web:71759127b50ff782f09e42",
  measurementId: "G-KW81ED4JDB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 