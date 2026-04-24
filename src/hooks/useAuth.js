/**
 * useAuth Hook — Global authentication state manager.
 * 
 * Uses Zustand for lightweight global state (no Provider boilerplate).
 * Firebase onAuthStateChanged listener auto-syncs auth state.
 * Google tokens for Calendar/Tasks are captured on sign-in
 * and will be sent to Cloud Functions for server-side API calls.
 */
import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  signInAnonymously,
  RecaptchaVerifier
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, getServerTimestamp } from '../lib/firebase';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,
  googleAccessToken: null,

  /**
   * Initialize the auth listener.
   * Call this ONCE from App.jsx on mount.
   */
  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch or create user profile in Firestore
          const profileRef = doc(db, 'users', firebaseUser.uid);
          const profileSnap = await getDoc(profileRef);

          let profile;
          if (profileSnap.exists()) {
            profile = profileSnap.data();
          } else {
            // First-time user: create secure profile doc
            profile = {
              displayName: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
              createdAt: getServerTimestamp(),
              lastLogin: getServerTimestamp(),
            };
            await setDoc(profileRef, profile);
          }

          // Fetch Google OAuth token if it exists
          const tokenRef = doc(db, 'users', firebaseUser.uid, 'private', 'google_tokens');
          const tokenSnap = await getDoc(tokenRef);
          let googleAccessToken = null;
          if (tokenSnap.exists()) {
            googleAccessToken = tokenSnap.data().accessToken;
            console.log('[Auth] Google Token restored from Firestore');
          }

          set({ 
            user: firebaseUser, 
            profile, 
            googleAccessToken,
            loading: false, 
            error: null 
          });
        } catch (err) {
          // Firestore rules may reject — still log user in with basic info
          console.warn('[Auth] Firestore profile error (non-fatal):', err.message);
          set({
            user: firebaseUser,
            profile: { displayName: firebaseUser.displayName, email: firebaseUser.email, photoURL: firebaseUser.photoURL },
            googleAccessToken: null,
            loading: false,
            error: null,
          });
        }
      } else {
        set({ user: null, profile: null, loading: false, error: null, googleAccessToken: null });
      }
    });

    return unsubscribe;
  },

  /**
   * Sign in with Google.
   * Captures OAuth access token for Calendar/Tasks API
   * (to be forwarded to Cloud Functions later).
   */
  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      // Store Google OAuth token securely in Firestore
      // Cloud Functions will use this to call Google APIs server-side.
      if (credential?.accessToken) {
        set({ googleAccessToken: credential.accessToken });
        
        const tokenRef = doc(db, 'users', result.user.uid, 'private', 'google_tokens');
        await setDoc(tokenRef, {
          accessToken: credential.accessToken,
          updatedAt: getServerTimestamp(),
          ownerId: result.user.uid,
        });
      }

      // Update last login
      const profileRef = doc(db, 'users', result.user.uid);
      await setDoc(profileRef, { lastLogin: getServerTimestamp() }, { merge: true });

    } catch (err) {
      console.error('[Auth] Google Sign-In failed:', err.message);
      set({ error: err.message, loading: false });
    }
  },

  signInAsGuest: async () => {
    set({ loading: true, error: null });
    try {
      await signInAnonymously(auth);
      // init() will handle the profile creation if it doesn't exist
    } catch (err) {
      console.error('[Auth] Guest Sign-In failed:', err.message);
      set({ error: err.message, loading: false });
    }
  },
  
  /**
   * Execute reCAPTCHA Enterprise
   * @param {string} action - The action name (e.g., 'LOGIN', 'SIGNUP')
   * @returns {Promise<string>} - The reCAPTCHA token
   */
  executeRecaptcha: async (action) => {
    return new Promise((resolve) => {
      if (!window.grecaptcha || !window.grecaptcha.enterprise) {
        console.warn('[Auth] reCAPTCHA Enterprise not loaded yet, waiting...');
        // If not loaded, we can try to wait or just return null
        // Standard practice is to wait for the script to be ready
        let attempts = 0;
        const checkReady = setInterval(async () => {
          attempts++;
          if (window.grecaptcha?.enterprise) {
            clearInterval(checkReady);
            window.grecaptcha.enterprise.ready(async () => {
              try {
                const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
                const token = await window.grecaptcha.enterprise.execute(siteKey, { action });
                resolve(token);
              } catch (err) {
                console.error('[Auth] reCAPTCHA execution failed:', err);
                resolve(null);
              }
            });
          }
          if (attempts > 20) { // 2 seconds timeout
            clearInterval(checkReady);
            console.error('[Auth] reCAPTCHA Enterprise failed to load');
            resolve(null);
          }
        }, 100);
        return;
      }

      window.grecaptcha.enterprise.ready(async () => {
        try {
          const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
          const token = await window.grecaptcha.enterprise.execute(siteKey, { action });
          resolve(token);
        } catch (err) {
          console.error('[Auth] reCAPTCHA execution failed:', err);
          resolve(null);
        }
      });
    });
  },

  /**
   * Sign in / Sign up with Email and Password
   */
  signInWithEmail: async (email, password) => {
    set({ loading: true, error: null });
    try {
      // 1. Execute reCAPTCHA Enterprise
      const token = await get().executeRecaptcha('LOGIN');
      
      // 2. Verify via Cloud Function
      if (token) {
        const { httpsCallable } = await import('firebase/functions');
        const { functions: fbFunctions } = await import('../lib/firebase');
        const verifyFn = httpsCallable(fbFunctions, 'verifyRecaptcha');
        const { data } = await verifyFn({ token, action: 'LOGIN' });
        
        if (!data.success || (data.score !== undefined && data.score < 0.3)) {
          throw new Error('Security check failed. High risk detected.');
        }
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      const profileRef = doc(db, 'users', result.user.uid);
      await setDoc(profileRef, { lastLogin: getServerTimestamp() }, { merge: true });
    } catch (err) {
      console.error('[Auth] Email Log-In failed:', err.message);
      set({ error: err.message, loading: false });
    }
  },

  signUpWithEmail: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      // 1. Execute reCAPTCHA Enterprise
      const token = await get().executeRecaptcha('SIGNUP');
      
      // 2. Verify via Cloud Function
      if (token) {
        const { httpsCallable } = await import('firebase/functions');
        const { functions: fbFunctions } = await import('../lib/firebase');
        const verifyFn = httpsCallable(fbFunctions, 'verifyRecaptcha');
        const { data } = await verifyFn({ token, action: 'SIGNUP' });
        
        if (!data.success || (data.score !== undefined && data.score < 0.3)) {
          throw new Error('Security check failed. High risk detected.');
        }
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Create initial profile
      const profileRef = doc(db, 'users', result.user.uid);
      await setDoc(profileRef, {
        displayName: name || '',
        email: result.user.email,
        createdAt: getServerTimestamp(),
        lastLogin: getServerTimestamp(),
      });
    } catch (err) {
      console.error('[Auth] Email Sign-Up failed:', err.message);
      set({ error: err.message, loading: false });
    }
  },

  /**
   * Recaptcha Setup
   */
  setupRecaptcha: (containerId) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
      });
    }
  },

  /**
   * Sign in with Phone Number
   */
  signInWithPhone: async (phoneNumber) => {
    set({ loading: true, error: null });
    try {
      if (!window.recaptchaVerifier) throw new Error('Recaptcha missing.');
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      set({ loading: false });
      return confirmationResult;
    } catch (err) {
      console.error('[Auth] Phone Sign-In failed:', err.message);
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  verifyPhoneOtp: async (confirmationResult, code) => {
    set({ loading: true, error: null });
    try {
      const result = await confirmationResult.confirm(code);
      const profileRef = doc(db, 'users', result.user.uid);
      await setDoc(profileRef, { lastLogin: getServerTimestamp() }, { merge: true });
    } catch (err) {
      console.error('[Auth] OTP verification failed:', err.message);
      set({ error: 'Incorrect code', loading: false });
      throw err;
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, profile: null, googleAccessToken: null });
    } catch (err) {
      console.error('[Auth] Sign-Out failed:', err.message);
      set({ error: err.message });
    }
  },
}));

export default useAuthStore;
