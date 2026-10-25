import { initializeApp, getApp, getApps } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};
export const adminUid = import.meta.env.VITE_FIREBASE_ADMIN_UID || '';
export const adminEmail = (import.meta.env.VITE_FIREBASE_ADMIN_EMAIL || '').toLowerCase();
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId && firebaseConfig.authDomain);
export const cloudEnabled = import.meta.env.VITE_FIREBASE_CLOUD_ENABLED === 'true';
export const cloudWritesEnabled = import.meta.env.VITE_FIREBASE_ALLOW_CLOUD_WRITES === 'true';
export const app = isFirebaseConfigured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
export const auth = app ? getAuth(app) : null;
// No Cloud Storage bucket is provisioned or paid plan enabled by this application.
if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_USE_EMULATORS === 'true') {
  if (auth) connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}
export default app;
