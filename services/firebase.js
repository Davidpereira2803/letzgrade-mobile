import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { 
  FIREBASE_API_KEY as ENV_API_KEY,
  FIREBASE_AUTH_DOMAIN as ENV_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID as ENV_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET as ENV_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID as ENV_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID as ENV_APP_ID,
  FIREBASE_MEASUREMENT_ID as ENV_MEASUREMENT_ID
} from "@env";

const extra = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY || ENV_API_KEY,
  authDomain: extra.FIREBASE_AUTH_DOMAIN || ENV_AUTH_DOMAIN,
  projectId: extra.FIREBASE_PROJECT_ID || ENV_PROJECT_ID,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET || ENV_STORAGE_BUCKET,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID || ENV_MESSAGING_SENDER_ID,
  appId: extra.FIREBASE_APP_ID || ENV_APP_ID,
  measurementId: extra.FIREBASE_MEASUREMENT_ID || ENV_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

const monitorAuthState = (callback) => {
  onAuthStateChanged(auth, (user) => callback(user));
};

const logout = async () => { await signOut(auth); };

export {
  auth,
  db,
  storage,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  monitorAuthState,
  logout,
  googleProvider
};
