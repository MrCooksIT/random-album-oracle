import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBrPXYMcx2zGJ0H_pLgDTZbPoftSzaBLr8",
    authDomain: "albumarcade-7040d.firebaseapp.com",
    projectId: "albumarcade-7040d",
    storageBucket: "albumarcade-7040d.firebasestorage.app",
    messagingSenderId: "589208026375",
    appId: "1:589208026375:web:0f0026b4e36029042999a2",
    measurementId: "G-7D463GS494"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);