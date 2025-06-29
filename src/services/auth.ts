import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User } from '../types';
import { createUser, updateUser } from './database';

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const login = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    if (error instanceof Error) {
      throw new AuthError(error.message, (error as AuthError).code);
    }
    throw new AuthError('An unknown error occurred during login');
  }
};

export const signup = async (
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, { displayName });

    // Create user document
    const newUser: Omit<User, 'id'> = {
      displayName,
      email,
      totalScore: 0,
      level: 1,
      achievements: []
    };

    await createUser(user.uid, newUser);

    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw new AuthError(error.message, (error as AuthError).code);
    }
    throw new AuthError('An unknown error occurred during signup');
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    if (error instanceof Error) {
      throw new AuthError(error.message, (error as AuthError).code);
    }
    throw new AuthError('An unknown error occurred during logout');
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    if (error instanceof Error) {
      throw new AuthError(error.message, (error as AuthError).code);
    }
    throw new AuthError('An unknown error occurred during password reset');
  }
};

export const updateUserProfile = async (
  user: FirebaseUser,
  data: { displayName?: string; photoURL?: string }
): Promise<void> => {
  try {
    await updateProfile(user, data);
    if (data.displayName) {
      await updateUser(user.uid, { displayName: data.displayName });
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new AuthError(error.message, (error as AuthError).code);
    }
    throw new AuthError('An unknown error occurred during profile update');
  }
}; 