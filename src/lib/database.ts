import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Crew, 
  Challenge, 
  UserProfile, 
  TripSubmission, 
  FoodCarbonSubmission, 
  ShowerSubmission 
} from '../types';

// Helper function to convert Firestore data to typed objects
const convertTimestamp = (data: DocumentData): any => {
  const result = { ...data };
  for (const key in result) {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate();
    }
  }
  return result;
};

// Crew operations
export const getCrew = async (crewId: string): Promise<Crew> => {
  const crewDoc = await getDoc(doc(db, 'crews', crewId));
  if (!crewDoc.exists()) {
    throw new Error('Crew not found');
  }
  return { id: crewDoc.id, ...convertTimestamp(crewDoc.data()) } as Crew;
};

export const getCrewMembers = async (crewId: string): Promise<UserProfile[]> => {
  const membersQuery = query(
    collection(db, 'users'),
    where('crewId', '==', crewId)
  );
  const membersSnapshot = await getDocs(membersQuery);
  return membersSnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...convertTimestamp(doc.data()) 
  } as UserProfile));
};

export const createCrew = async (data: Omit<Crew, 'id'>): Promise<Crew> => {
  const crewData = {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  const crewRef = await addDoc(collection(db, 'crews'), crewData);
  return { id: crewRef.id, ...convertTimestamp(crewData) } as Crew;
};

export const updateCrew = async (crewId: string, data: Partial<Crew>): Promise<void> => {
  const updateData = {
    ...data,
    updatedAt: Timestamp.now()
  };
  await updateDoc(doc(db, 'crews', crewId), updateData);
};

export const deleteCrew = async (crewId: string): Promise<void> => {
  await deleteDoc(doc(db, 'crews', crewId));
};

// Challenge operations
export const getChallenge = async (challengeId: string): Promise<Challenge> => {
  const challengeDoc = await getDoc(doc(db, 'challenges', challengeId));
  if (!challengeDoc.exists()) {
    throw new Error('Challenge not found');
  }
  return { id: challengeDoc.id, ...convertTimestamp(challengeDoc.data()) } as Challenge;
};

export const getCrewChallenges = async (crewId: string): Promise<Challenge[]> => {
  const challengesQuery = query(
    collection(db, 'challenges'),
    where('crewId', '==', crewId),
    orderBy('startDate', 'desc')
  );
  const challengesSnapshot = await getDocs(challengesQuery);
  return challengesSnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...convertTimestamp(doc.data()) 
  } as Challenge));
};

export const createChallenge = async (data: Omit<Challenge, 'id'>): Promise<Challenge> => {
  const challengeData = {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  const challengeRef = await addDoc(collection(db, 'challenges'), challengeData);
  return { id: challengeRef.id, ...convertTimestamp(challengeData) } as Challenge;
};

export const updateChallenge = async (challengeId: string, data: Partial<Challenge>): Promise<void> => {
  const updateData = {
    ...data,
    updatedAt: Timestamp.now()
  };
  await updateDoc(doc(db, 'challenges', challengeId), updateData);
};

export const deleteChallenge = async (challengeId: string): Promise<void> => {
  await deleteDoc(doc(db, 'challenges', challengeId));
};

// Submission operations
export const submitTrip = async (challengeId: string, data: TripSubmission): Promise<void> => {
  await addDoc(collection(db, 'submissions'), {
    challengeId,
    type: 'trip',
    data: {
      ...data,
      date: Timestamp.fromDate(data.date)
    },
    submittedAt: Timestamp.now()
  });
};

export const submitFoodCarbon = async (challengeId: string, data: FoodCarbonSubmission): Promise<void> => {
  await addDoc(collection(db, 'submissions'), {
    challengeId,
    type: 'food',
    data,
    submittedAt: Timestamp.now()
  });
};

export const submitShower = async (challengeId: string, data: ShowerSubmission): Promise<void> => {
  await addDoc(collection(db, 'submissions'), {
    challengeId,
    type: 'shower',
    data: {
      ...data,
      date: Timestamp.fromDate(data.date)
    },
    submittedAt: Timestamp.now()
  });
};

// User operations
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  return { id: userDoc.id, ...convertTimestamp(userDoc.data()) } as UserProfile;
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  const updateData = {
    ...data,
    updatedAt: Timestamp.now()
  };
  await updateDoc(doc(db, 'users', userId), updateData);
};

export const getUserCrews = async (userId: string): Promise<Crew[]> => {
  const crewsQuery = query(
    collection(db, 'crews'),
    where('members', 'array-contains', userId)
  );
  const crewsSnapshot = await getDocs(crewsQuery);
  return crewsSnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...convertTimestamp(doc.data()) 
  } as Crew));
};

export const getActiveChallenges = async (): Promise<Challenge[]> => {
  const now = Timestamp.now();
  const challengesQuery = query(
    collection(db, 'challenges'),
    where('status', '==', 'active'),
    where('endDate', '>', now),
    orderBy('endDate', 'asc')
  );
  const challengesSnapshot = await getDocs(challengesQuery);
  return challengesSnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...convertTimestamp(doc.data()) 
  } as Challenge));
}; 