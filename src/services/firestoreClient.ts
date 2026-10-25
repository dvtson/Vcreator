import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { app } from './firebase';
export const db = app ? getFirestore(app) : null;
if (db && import.meta.env.DEV && import.meta.env.VITE_FIREBASE_USE_EMULATORS === 'true') connectFirestoreEmulator(db,'127.0.0.1',8080);
