import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types';

const auth = getAuth();

export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signUp = async (email: string, password: string, displayName: string): Promise<FirebaseUser> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user profile
  const userProfile: UserProfile = {
    id: user.uid,
    email: user.email!,
    displayName,
    createdAt: new Date(),
    crewId: undefined,
    totalScore: 0,
    level: 1,
    levelProgress: 0,
    achievements: [],
    submissionsCount: 0,
    averageScore: 0,
    bestScore: 0,
    lastSubmission: null,
    isCrewManager: false
  };

  await setDoc(doc(db, 'users', user.uid), userProfile);

  return user;
};

export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void): () => void => {
  return onAuthStateChanged(auth, callback);
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    return null;
  }
  return { id: userDoc.id, ...userDoc.data() } as UserProfile;
}; 