import { db } from './firebase';
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
  Timestamp 
} from 'firebase/firestore';
import { 
  Crew, 
  Challenge, 
  UserProfile, 
  TripSubmission, 
  FoodCarbonSubmission, 
  ShowerSubmission, 
  RecyclingSubmission
} from '../types';

// Crew API
export const getCrew = async (crewId: string): Promise<Crew> => {
  const crewDoc = await getDoc(doc(db, 'crews', crewId));
  if (!crewDoc.exists()) {
    throw new Error('Crew not found');
  }
  return { id: crewDoc.id, ...crewDoc.data() } as Crew;
};

export const getCrewMembers = async (crewId: string): Promise<UserProfile[]> => {
  const membersQuery = query(
    collection(db, 'users'),
    where('crewId', '==', crewId)
  );
  const membersSnapshot = await getDocs(membersQuery);
  return membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
};

export const createCrew = async (name: string, description: string, leaderId: string): Promise<Crew> => {
  const now = Timestamp.now();
  const crewData = {
    name,
    description,
    leaderId,
    createdAt: now,
    members: [leaderId]
  };
  const crewRef = await addDoc(collection(db, 'crews'), crewData);
  return { 
    id: crewRef.id, 
    ...crewData,
    createdAt: now.toDate()
  } as Crew;
};

export const updateCrew = async (crewId: string, data: Partial<Crew>): Promise<void> => {
  await updateDoc(doc(db, 'crews', crewId), data);
};

export const deleteCrew = async (crewId: string): Promise<void> => {
  await deleteDoc(doc(db, 'crews', crewId));
};

export const addMemberToCrew = async (crewId: string, userId: string): Promise<void> => {
  const crewRef = doc(db, 'crews', crewId);
  const crewDoc = await getDoc(crewRef);
  
  if (!crewDoc.exists()) {
    throw new Error('Crew not found');
  }
  
  const crew = crewDoc.data() as Crew;
  if (crew.members.includes(userId)) {
    throw new Error('User is already a member of this crew');
  }
  
  await updateDoc(crewRef, {
    members: [...crew.members, userId]
  });
};

export const removeMemberFromCrew = async (crewId: string, userId: string): Promise<void> => {
  const crewRef = doc(db, 'crews', crewId);
  const crewDoc = await getDoc(crewRef);
  
  if (!crewDoc.exists()) {
    throw new Error('Crew not found');
  }
  
  const crew = crewDoc.data() as Crew;
  if (!crew.members.includes(userId)) {
    throw new Error('User is not a member of this crew');
  }
  
  await updateDoc(crewRef, {
    members: crew.members.filter(id => id !== userId)
  });
};

export const transferCrewLeadership = async (crewId: string, newLeaderId: string): Promise<void> => {
  const crewRef = doc(db, 'crews', crewId);
  const crewDoc = await getDoc(crewRef);
  
  if (!crewDoc.exists()) {
    throw new Error('Crew not found');
  }
  
  const crew = crewDoc.data() as Crew;
  if (!crew.members.includes(newLeaderId)) {
    throw new Error('New leader must be a member of the crew');
  }
  
  await updateDoc(crewRef, {
    leaderId: newLeaderId
  });
};

// Challenge API
export const getChallenge = async (challengeId: string): Promise<Challenge> => {
  const challengeDoc = await getDoc(doc(db, 'challenges', challengeId));
  if (!challengeDoc.exists()) {
    throw new Error('Challenge not found');
  }
  return { id: challengeDoc.id, ...challengeDoc.data() } as Challenge;
};

export const getCrewChallenges = async (crewId: string): Promise<Challenge[]> => {
  const challengesQuery = query(
    collection(db, 'challenges'),
    where('crewId', '==', crewId),
    orderBy('startDate', 'desc')
  );
  const challengesSnapshot = await getDocs(challengesQuery);
  return challengesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
};

export const createChallenge = async (data: Omit<Challenge, 'id'>): Promise<Challenge> => {
  const challengeRef = await addDoc(collection(db, 'challenges'), {
    ...data,
    createdAt: Timestamp.now()
  });
  return { id: challengeRef.id, ...data } as Challenge;
};

export const updateChallenge = async (challengeId: string, data: Partial<Challenge>): Promise<void> => {
  await updateDoc(doc(db, 'challenges', challengeId), data);
};

export const deleteChallenge = async (challengeId: string): Promise<void> => {
  await deleteDoc(doc(db, 'challenges', challengeId));
};

// Submission API
export const submitTrip = async (challengeId: string, data: TripSubmission): Promise<void> => {
  await addDoc(collection(db, 'submissions'), {
    challengeId,
    type: 'trip',
    data,
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
    data,
    submittedAt: Timestamp.now()
  });
};

export const submitRecycling = async (challengeId: string, data: RecyclingSubmission): Promise<void> => {
  await addDoc(collection(db, 'submissions'), {
    challengeId,
    type: 'recycling',
    data,
    submittedAt: Timestamp.now()
  });
};

// User API
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  return { id: userDoc.id, ...userDoc.data() } as UserProfile;
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), data);
};

export const getUserCrews = async (userId: string): Promise<Crew[]> => {
  const crewsQuery = query(
    collection(db, 'crews'),
    where('members', 'array-contains', userId)
  );
  const crewsSnapshot = await getDocs(crewsQuery);
  return crewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Crew));
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
  return challengesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
}; 