import { initializeApp } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    initializeAuth,
    getReactNativePersistence,
    getAuth,
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAh3tox2YCYFEpMpgFQxYfxpEepxA4NCMM",
    authDomain: "crowdsafetyapp-8c88f.firebaseapp.com",
    projectId: "crowdsafetyapp-8c88f",
    storageBucket: "crowdsafetyapp-8c88f.firebasestorage.app",
    messagingSenderId: "129021860398",
    appId: "1:129021860398:web:dbff4be089ffc5a127ddbf",
};

const app = initializeApp(firebaseConfig);

let auth;

try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
} catch (error) {
    auth = getAuth(app);
}

// Firestore Database
const db = getFirestore(app);

export { auth, db };
export default app;