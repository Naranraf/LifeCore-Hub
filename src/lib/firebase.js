/**
 * Firebase Configuration Module
 * 
 * SECURITY: All values come from environment variables (.env).
 * Vite exposes them via import.meta.env.VITE_* prefix.
 * These are PUBLIC Firebase config keys (safe for client),
 * but API keys for Gemini/Google APIs live ONLY in Cloud Functions.
 */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

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

// Initialize App Check with reCAPTCHA Enterprise
if (typeof window !== 'undefined' && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
    console.log('[AppCheck] Initialized with Enterprise');
  } catch (err) {
    console.warn('[AppCheck] Initialization failed (non-fatal):', err.message);
  }
}

export const auth = getAuth(app);

// Enforce Local Persistence (Session survives browser restarts)
setPersistence(auth, browserLocalPersistence)
  .catch((err) => console.warn('[Auth] Persistence setup failed:', err.message));


/**
 * Google Auth Provider.
 * NOTE: Calendar + Tasks scopes are added only when those features are
 * implemented, to avoid the 'unverified app' OAuth warning during development.
 */
export const googleProvider = new GoogleAuthProvider();
// googleProvider.setCustomParameters({ prompt: 'select_account' });
// Added scopes for Google Calendar and Google Tasks integrations
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/tasks');

export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const getServerTimestamp = () => serverTimestamp();

export default app;
