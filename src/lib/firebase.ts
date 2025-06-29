import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBl-Z5esXLPqgTl98SkDcwlYPA4-MS35ns",
  authDomain: "ecorank-22728.firebaseapp.com",
  projectId: "ecorank-22728",
  storageBucket: "ecorank-22728.firebasestorage.app",
  messagingSenderId: "263412549296",
  appId: "1:263412549296:web:f5e4e86ea2810dcbc25d75",
  measurementId: "G-FV3RM04LEM"
};

// Only initialize if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 