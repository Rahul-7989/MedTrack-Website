
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgHQ1kZQjLc3feyUQ_W-Nf8Tm3MNFwgA0",
  authDomain: "medtrack-6196e.firebaseapp.com",
  projectId: "medtrack-6196e",
  storageBucket: "medtrack-6196e.firebasestorage.app",
  messagingSenderId: "1049438612540",
  appId: "1:1049438612540:web:9f6c7cd473bc68cc07e739",
  measurementId: "G-KZ5EKJTLM7"
};

// Ensure named imports like initializeApp and getAuth are correctly exported from their modules
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
