import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFirebaseConfig } from './config';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

const { config, isConfigured } = getFirebaseConfig();

if (isConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn('[Firebase] Initialization error:', error);
  }
} else {
  if (typeof window !== 'undefined') {
    console.info(
      '[Firebase] Public configuration keys are not set in .env.local. Running in offline/development fallback mode.'
    );
  }
}

export { app, auth, db, storage, isConfigured };
