import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Create the context with proper type
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('AuthProvider rendering...');
  
  // State with proper types
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect to listen for auth state changes
  useEffect(() => {
    console.log('AuthProvider useEffect running...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (err) {
          console.log('Error getting user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Register a new user
  async function register(email: string, password: string, displayName: string) {
    try {
      setError(null);
      
      const response = await createUserWithEmailAndPassword(auth, email, password);
      
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName
        });
      }

      const newUser: UserProfile = {
        id: response.user.uid,
        email: email,
        displayName: displayName,
        totalScore: 0,
        level: 1,
        achievements: [],
        levelProgress: 0,
        submissionsCount: 0,
        averageScore: 0,
        bestScore: 0,
        lastSubmission: null,
        isCrewManager: false,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', response.user.uid), newUser);
      
      // The existing useEffect will handle updating the auth state
      // Just wait a moment for the auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.log('Registration error:', error);
      throw error; // Re-throw so the component can handle it
    }
  }

  // Login function
  async function login(email: string, password: string) {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      
      // The existing useEffect will handle updating the auth state
      // Just wait a moment for the auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.log('Login error:', error);
      throw error; // Re-throw so the component can handle it
    }
  }

  // Logout function
  async function logout() {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.log('Logout error:', error);
    }
  }

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 