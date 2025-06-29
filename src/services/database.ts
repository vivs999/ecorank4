import { 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  FirestoreError
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Crew, Challenge, ChallengeSubmission, LeaderboardEntry } from '../types';
import { calculateLeaderboard } from '../utils/helpers';

export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Collection references
const usersRef = collection(db, 'users');
const crewsRef = collection(db, 'crews');
const challengesRef = collection(db, 'challenges');
const submissionsRef = collection(db, 'submissions');

// User operations
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(usersRef, userId));
    return userDoc.exists() ? userDoc.data() as User : null;
  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError(error.message, (error as FirestoreError).code);
    }
    throw new DatabaseError('An unknown error occurred while fetching user');
  }
};

export const updateUser = async (userId: string, data: Partial<User>): Promise<void> => {
  try {
    await updateDoc(doc(usersRef, userId), {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError(error.message, (error as FirestoreError).code);
    }
    throw new DatabaseError('An unknown error occurred while updating user');
  }
};

export const createUser = async (userId: string, userData: Omit<User, 'id'>): Promise<void> => {
  try {
    await setDoc(doc(usersRef, userId), {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError(error.message, (error as FirestoreError).code);
    }
    throw new DatabaseError('An unknown error occurred while creating user');
  }
};

// Crew operations
export const getCrew = async (crewId: string): Promise<Crew | null> => {
  try {
    const crewDoc = await getDoc(doc(crewsRef, crewId));
    return crewDoc.exists() ? crewDoc.data() as Crew : null;
  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError(error.message, (error as FirestoreError).code);
    }
    throw new DatabaseError('An unknown error occurred while fetching crew');
  }
};

export const getCrews = async (): Promise<Crew[]> => {
  try {
    const crewsSnapshot = await getDocs(crewsRef);
    return crewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Crew));
  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError(error.message, (error as FirestoreError).code);
    }
    throw new DatabaseError('An unknown error occurred while fetching crews');
  }
};

export const createCrew = async (crew: Omit<Crew, 'id'>): Promise<string> => {
  try {
    const newCrewRef = doc(crewsRef);
    await setDoc(newCrewRef, {
      ...crew,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return newCrewRef.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError(error.message, (error as FirestoreError).code);
    }
    throw new DatabaseError('An unknown error occurred while creating crew');
  }
};

export const updateCrew = async (crewId: string, data: Partial<Crew>): Promise<void> => {
  try {
    await updateDoc(doc(crewsRef, crewId), {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError(error.message, (error as FirestoreError).code);
    }
    throw new DatabaseError('An unknown error occurred while updating crew');
  }
};

// Challenge operations
export const getChallenges = async (crewId?: string): Promise<Challenge[]> => {
  try {
    let q = query(challengesRef, where('isActive', '==', true));
    if (crewId) {
      q = query(q, where('crewId', '==', crewId));
    }
    const challengesSnapshot = await getDocs(q);
    return challengesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError(error.message, (error as FirestoreError).code);
    }
    throw new DatabaseError('An unknown error occurred while fetching challenges');
  }
};

export const createChallenge = async (challenge: Omit<Challenge, 'id'>): Promise<string> => {
  try {
    const newChallengeRef = doc(challengesRef);
    await setDoc(newChallengeRef, {
      ...challenge,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return newChallengeRef.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError(error.message, (error as FirestoreError).code);
    }
    throw new DatabaseError('An unknown error occurred while creating challenge');
  }
};

// Submission operations
export const getSubmissions = async (
  userId: string,
  challengeId?: number
): Promise<ChallengeSubmission[]> => {
  try {
    let q = query(submissionsRef, where('userId', '==', userId));
    if (challengeId) {
      q = query(q, where('challengeId', '==', challengeId));
    }
    q = query(q, orderBy('createdAt', 'desc'));
    const submissionsSnapshot = await getDocs(q);
    return submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChallengeSubmission));
  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError(error.message, (error as FirestoreError).code);
    }
    throw new DatabaseError('An unknown error occurred while fetching submissions');
  }
};

export const createSubmission = async (
  submission: Omit<ChallengeSubmission, 'id'>
): Promise<string> => {
  try {
    const newSubmissionRef = doc(submissionsRef);
    await setDoc(newSubmissionRef, {
      ...submission,
      createdAt: Timestamp.now()
    });
    return newSubmissionRef.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError(error.message, (error as FirestoreError).code);
    }
    throw new DatabaseError('An unknown error occurred while creating submission');
  }
};

// Leaderboard operations
export const getLeaderboard = async (
  crewId: string,
  challengeId?: number,
  timeRange?: { start: Date; end: Date }
): Promise<LeaderboardEntry[]> => {
  try {
    let q = query(submissionsRef, where('crewId', '==', crewId));
    
    if (challengeId) {
      q = query(q, where('challengeId', '==', challengeId));
    }
    
    if (timeRange) {
      q = query(q, 
        where('createdAt', '>=', timeRange.start),
        where('createdAt', '<=', timeRange.end)
      );
    }
    
    const submissionsSnapshot = await getDocs(q);
    const submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChallengeSubmission));
    
    // Get the challenge to determine if lower score is better
    let lowerScoreIsBetter = false;
    if (challengeId) {
      const challengeDoc = await getDoc(doc(challengesRef, challengeId.toString()));
      if (challengeDoc.exists()) {
        const challenge = challengeDoc.data() as Challenge;
        lowerScoreIsBetter = challenge.lowerScoreIsBetter;
      }
    }
    
    return calculateLeaderboard(submissions, crewId, lowerScoreIsBetter);
  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError(error.message, (error as FirestoreError).code);
    }
    throw new DatabaseError('An unknown error occurred while fetching leaderboard');
  }
}; 