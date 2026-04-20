/**
 * Firebase Configuration Module
 * 
 * SECURITY: All values come from environment variables (.env).
 * Vite exposes them via import.meta.env.VITE_* prefix.
 * These are PUBLIC Firebase config keys (safe for client),
 * but API keys for Gemini/Google APIs live ONLY in Cloud Functions.
 */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

/**
 * Google Auth Provider.
 * NOTE: Calendar + Tasks scopes are added only when those features are
 * implemented, to avoid the 'unverified app' OAuth warning during development.
 */
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
// Added scopes for Google Calendar and Google Tasks integrations
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/tasks');

export const db = getFirestore(app);
export const functions = getFunctions(app);
export const getServerTimestamp = () => serverTimestamp();

export default app;
