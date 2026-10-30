import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Remplace par tes propres clés Firebase (les mêmes que ton projet Next.js)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialisation unique de l'application Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 1. Authentification avec persistance AsyncStorage (garde l'utilisateur connecté)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// 2. Firestore avec cache persistant (active le mode hors-ligne)
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export { app, auth, db };
