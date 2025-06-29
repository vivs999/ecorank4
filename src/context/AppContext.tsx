import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Crew, Challenge, ChallengeSubmission, LeaderboardEntry, UserProfile, CarbonFootprintSubmission, FoodCarbonSubmission, RecyclingSubmission, ShowerTimerSubmission } from '../types';
import { VehicleData } from '../services/carEmissions';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface AppContextType {
  user: User | null;
  userProfile: UserProfile | null;
  crew: Crew | null;
  userCrew: Crew | null;
  challenges: Challenge[];
  currentChallenge: Challenge | null;
  leaderboard: LeaderboardEntry[];
  selectedVehicle: VehicleData | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  joinCrew: (crewId: string) => Promise<void>;
  leaveCrew: () => Promise<void>;
  submitChallenge: (submission: ChallengeSubmission) => Promise<void>;
  submitCarbonFootprint: (submission: CarbonFootprintSubmission) => Promise<void>;
  submitFoodCarbon: (submission: FoodCarbonSubmission) => Promise<void>;
  submitRecycling: (submission: RecyclingSubmission) => Promise<void>;
  submitShowerTimer: (submission: ShowerTimerSubmission) => Promise<void>;
  createCrew: (name: string, description: string, startDate: string, defaultChallengeDuration: number) => Promise<Crew>;
  createChallenge: (challenge: Omit<Challenge, 'id'>) => Promise<void>;
  getUserCrews: () => Promise<Crew[]>;
  getActiveChallenges: () => Promise<Challenge[]>;
  getCrew: (crewId: string) => Promise<Crew>;
  getCrewMembers: (crewId: string) => Promise<UserProfile[]>;
  getCrewChallenges: (crewId: string) => Promise<Challenge[]>;
  removeMember: (crewId: string, memberId: string) => Promise<void>;
  transferLeadership: (crewId: string, newLeaderId: string) => Promise<void>;
  saveVehicle: (vehicleData: VehicleData) => void;
  clearVehicle: () => void;
  createSampleLeaderboardData: () => Promise<void>;
  testSubmission: () => Promise<void>;
  refreshCrewData: () => Promise<void>;
  comprehensiveTest: () => Promise<void>;
  authTest: () => Promise<void>;
  backendTest: () => Promise<void>;
  firebaseConnectionTest: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('AppProvider rendering...');
  
  const { currentUser, userProfile: authUserProfile } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [crew] = useState<Crew | null>(null);
  const [userCrew, setUserCrew] = useState<Crew | null>(null);
  const [challenges] = useState<Challenge[]>([]);
  const [currentChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update userProfile when authUserProfile changes
  useEffect(() => {
    setUserProfile(authUserProfile);
  }, [authUserProfile]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      console.log('Fetching leaderboard data...');
      
      // Fetch all submissions from different collections and aggregate scores
      const [carbonFootprints, foodCarbon, recycling, showerTimers] = await Promise.all([
        getDocs(collection(db, 'carbonFootprints')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'foodCarbon')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'recycling')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'showerTimers')).catch(() => ({ docs: [] }))
      ]);

      console.log('Collections fetched:', {
        carbonFootprints: carbonFootprints.docs.length,
        foodCarbon: foodCarbon.docs.length,
        recycling: recycling.docs.length,
        showerTimers: showerTimers.docs.length
      });

      // Aggregate scores by user
      const userScores = new Map<string, { userId: string; score: number; displayName: string; crewName: string; achievements: string[] }>();
      
      console.log('Processing submissions...');
      
      // Process carbon footprint submissions
      carbonFootprints.docs.forEach(doc => {
        const data = doc.data();
        console.log('Carbon footprint submission:', data);
        const userId = data.userId;
        if (userId) {
          const existing = userScores.get(userId) || { userId, score: 0, displayName: data.displayName || 'Unknown User', crewName: data.crewName || '', achievements: [] };
          existing.score += data.score || 0;
          existing.displayName = data.displayName || existing.displayName;
          existing.crewName = data.crewName || existing.crewName;
          userScores.set(userId, existing);
        }
      });
      
      // Process food carbon submissions
      foodCarbon.docs.forEach(doc => {
        const data = doc.data();
        console.log('Food carbon submission:', data);
        const userId = data.userId;
        if (userId) {
          const existing = userScores.get(userId) || { userId, score: 0, displayName: data.displayName || 'Unknown User', crewName: data.crewName || '', achievements: [] };
          existing.score += data.score || 0;
          existing.displayName = data.displayName || existing.displayName;
          existing.crewName = data.crewName || existing.crewName;
          userScores.set(userId, existing);
        }
      });
      
      // Process recycling submissions
      recycling.docs.forEach(doc => {
        const data = doc.data();
        console.log('Recycling submission:', data);
        const userId = data.userId;
        if (userId) {
          const existing = userScores.get(userId) || { userId, score: 0, displayName: data.displayName || 'Unknown User', crewName: data.crewName || '', achievements: [] };
          existing.score += data.score || 0;
          existing.displayName = data.displayName || existing.displayName;
          existing.crewName = data.crewName || existing.crewName;
          userScores.set(userId, existing);
        }
      });
      
      // Process shower timer submissions
      showerTimers.docs.forEach(doc => {
        const data = doc.data();
        console.log('Shower timer submission:', data);
        const userId = data.userId;
        if (userId) {
          const existing = userScores.get(userId) || { userId, score: 0, displayName: data.displayName || 'Unknown User', crewName: data.crewName || '', achievements: [] };
          existing.score += data.score || 0;
          existing.displayName = data.displayName || existing.displayName;
          existing.crewName = data.crewName || existing.crewName;
          userScores.set(userId, existing);
        }
      });
      
      console.log('User scores map:', userScores);

      // Convert to array and sort by total score
      const sortedEntries = Array.from(userScores.values())
        .sort((a, b) => b.score - a.score);

      // Handle ties properly
      const leaderboardEntries: LeaderboardEntry[] = sortedEntries.map((entry, index) => {
        let position = index + 1;
        
        // Check for ties with previous entry
        if (index > 0 && entry.score === sortedEntries[index - 1].score) {
          position = leaderboardEntries[index - 1].position;
        }

        // Add additional achievements based on performance
        const achievements = [...(entry.achievements || [])];
        if (entry.score >= 1000) achievements.push('High Scorer');
        if (entry.score >= 500) achievements.push('Consistent Saver');
        if (position === 1) achievements.push('Leader');
        if (position <= 3) achievements.push('Top Performer');

        return {
          userId: entry.userId,
          displayName: entry.displayName,
          score: entry.score,
          position,
          crewId: entry.crewName || '',
          crewName: entry.crewName || '',
          achievements: achievements,
          tiedWith: undefined // Simplified tie handling for now
        } as LeaderboardEntry;
      });

      console.log('Leaderboard entries created:', leaderboardEntries.length);
      console.log('Final leaderboard:', leaderboardEntries);
      setLeaderboard(leaderboardEntries);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to fetch leaderboard');
    }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Recalculate user stats from all submission collections
        const [carbonFootprints, foodCarbon, recycling, showerTimers] = await Promise.all([
          getDocs(collection(db, 'carbonFootprints')).catch(() => ({ docs: [] })),
          getDocs(collection(db, 'foodCarbon')).catch(() => ({ docs: [] })),
          getDocs(collection(db, 'recycling')).catch(() => ({ docs: [] })),
          getDocs(collection(db, 'showerTimers')).catch(() => ({ docs: [] }))
        ]);
        
        let totalScore = 0;
        let submissionsCount = 0;
        let bestScore = 0;
        let lastSubmission: Date | null = null;
        
        // Calculate stats from all submissions
        [...carbonFootprints.docs, ...foodCarbon.docs, ...recycling.docs, ...showerTimers.docs]
          .filter(doc => doc.data().userId === userId)
          .forEach(doc => {
            const submissionData = doc.data();
            totalScore += submissionData.score || 0;
            submissionsCount += 1;
            if (submissionData.score > bestScore) {
              bestScore = submissionData.score;
            }
            if (submissionData.createdAt && (!lastSubmission || submissionData.createdAt.toDate() > lastSubmission)) {
              lastSubmission = submissionData.createdAt.toDate();
            }
          });
        
        const averageScore = submissionsCount > 0 ? totalScore / submissionsCount : 0;
        const level = Math.floor(totalScore / 100) + 1;
        const levelProgress = totalScore % 100;
        
        setUserProfile({
          id: userDoc.id,
          displayName: data.displayName,
          email: data.email,
          crewId: data.crewId,
          totalScore,
          level,
          levelProgress,
          achievements: data.achievements || [],
          avatarUrl: data.avatarUrl,
          isCrewManager: data.isCrewManager || false,
          submissionsCount,
          averageScore,
          bestScore,
          lastSubmission,
          createdAt: data.createdAt?.toDate() || new Date()
        });
        
        // Update the user document with recalculated stats to keep everything in sync
        await updateDoc(doc(db, 'users', userId), {
          totalScore,
          level,
          levelProgress,
          submissionsCount,
          averageScore,
          bestScore,
          lastSubmission
        });
      } else {
        // User document doesn't exist, create it
        console.log('User document does not exist, creating new profile...');
        const newUserProfile: UserProfile = {
          id: userId,
          displayName: currentUser?.displayName || 'Demo User',
          email: currentUser?.email || '',
          crewId: '',
          totalScore: 0,
          level: 1,
          levelProgress: 0,
          achievements: [],
          avatarUrl: '',
          isCrewManager: false,
          submissionsCount: 0,
          averageScore: 0,
          bestScore: 0,
          lastSubmission: null,
          createdAt: new Date()
        };
        
        await setDoc(doc(db, 'users', userId), newUserProfile);
        setUserProfile(newUserProfile);
        console.log('New user profile created successfully');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }, [currentUser]);

  const fetchUserCrew = useCallback(async (userId: string) => {
    try {
      const crewsQuery = query(
        collection(db, 'crews'),
        where('members', 'array-contains', userId)
      );
      const snapshot = await getDocs(crewsQuery);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        console.log('Fetched crew data from Firestore:', data); // Debug log
        console.log('Join code from Firestore:', data.joinCode); // Debug log
        
        const crew = {
          id: snapshot.docs[0].id,
          name: data.name,
          description: data.description || '',
          leaderId: data.leaderId,
          members: data.members || [],
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          joinCode: data.joinCode,
          score: data.score || 0,
          challenges: data.challenges || []
        };
        
        console.log('Setting userCrew with join code:', crew.joinCode); // Debug log
        setUserCrew(crew);
      } else {
        console.log('No crews found for user, setting userCrew to null'); // Debug log
        setUserCrew(null);
      }
    } catch (err) {
      console.error('Error fetching user crew:', err);
      setError('Failed to fetch user crew');
      setUserCrew(null); // Set to null on error as well
    }
  }, []);

  const refreshData = useCallback(async () => {
    console.log('=== REFRESH DATA START ===');
    console.log('Current user:', currentUser?.uid);
    console.log('Current user profile:', userProfile);
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching leaderboard...');
      await fetchLeaderboard();
      console.log('Leaderboard fetched successfully');
      
      console.log('Fetching user profile...');
      if (currentUser) {
        await fetchUserProfile(currentUser.uid);
        console.log('User profile fetched successfully');
      }
      
      console.log('Fetching user crew...');
      if (currentUser) {
        await fetchUserCrew(currentUser.uid);
        console.log('User crew fetched successfully');
      }
      
      console.log('=== REFRESH DATA COMPLETE ===');
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchLeaderboard, fetchUserProfile, fetchUserCrew]);

  const submitCarbonFootprint = async (submission: CarbonFootprintSubmission) => {
    try {
      console.log('=== SUBMIT CARBON FOOTPRINT START ===');
      console.log('Original submission:', submission);
      console.log('Current user:', currentUser);
      console.log('User profile:', userProfile);
      console.log('User crew:', userCrew);
      
      const displayName = currentUser?.displayName || userProfile?.displayName || 'Unknown User';
      const userId = currentUser?.uid || '';
      const crewId = userCrew?.id || submission.crewId || '';
      const crewName = userCrew?.name || (submission as any).crewName || '';
      
      console.log('Processed values:', {
        displayName,
        userId,
        crewId,
        crewName
      });
      
      if (!userId) {
        console.error('ERROR: No userId available');
        throw new Error('User not authenticated');
      }
      
      const finalSubmission = {
        ...submission,
        userId,
        displayName,
        crewId,
        crewName,
        createdAt: Timestamp.now()
      };
      
      console.log('Final submission to be saved:', finalSubmission);
      
      const submissionRef = doc(collection(db, 'carbonFootprints'));
      await setDoc(submissionRef, finalSubmission);
      console.log('Submission saved successfully');
      
      // Update user profile with new score and submission count
      if (currentUser) {
        console.log('Updating user profile...');
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const newTotalScore = (userData.totalScore || 0) + (submission.score || 0);
          const newSubmissionsCount = (userData.submissionsCount || 0) + 1;
          
          console.log('User profile update:', {
            oldTotalScore: userData.totalScore,
            newTotalScore,
            oldSubmissionsCount: userData.submissionsCount,
            newSubmissionsCount
          });
          
          await updateDoc(userRef, {
            totalScore: newTotalScore,
            submissionsCount: newSubmissionsCount,
            lastSubmission: Timestamp.now()
          });
          console.log('User profile updated successfully');
        }
      }
      
      console.log('Refreshing data...');
      await refreshData();
      await refreshCrewData();
      console.log('=== SUBMIT CARBON FOOTPRINT COMPLETE ===');
    } catch (err) {
      console.error('Error submitting carbon footprint:', err);
      throw new Error('Failed to submit carbon footprint');
    }
  };

  const submitFoodCarbon = async (submission: FoodCarbonSubmission) => {
    try {
      console.log('Submitting food carbon:', submission);
      console.log('Current user display name:', currentUser?.displayName);
      console.log('User profile display name:', userProfile?.displayName);
      
      const displayName = currentUser?.displayName || userProfile?.displayName || 'Unknown User';
      const userId = currentUser?.uid || '';
      console.log('Using display name:', displayName);
      console.log('Using userId:', userId);
      
      if (!userId) {
        console.error('ERROR: No userId available');
        throw new Error('User not authenticated');
      }
      
      const submissionRef = doc(collection(db, 'foodCarbon'));
      await setDoc(submissionRef, {
        ...submission,
        userId,
        displayName,
        crewId: userCrew?.id || submission.crewId || '',
        crewName: userCrew?.name || (submission as any).crewName || '',
        createdAt: Timestamp.now()
      });
      
      console.log('Food carbon submission saved successfully');
      
      // Update user profile with new score and submission count
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const newTotalScore = (userData.totalScore || 0) + submission.score;
          const newSubmissionsCount = (userData.submissionsCount || 0) + 1;
          
          await updateDoc(userRef, {
            totalScore: newTotalScore,
            submissionsCount: newSubmissionsCount,
            lastSubmission: Timestamp.now()
          });
          console.log('User profile updated with new score:', newTotalScore);
        }
      }
      
      console.log('Refreshing data after food carbon submission...');
      await refreshData();
      await refreshCrewData();
      console.log('Data refresh completed');
    } catch (err) {
      console.error('Error submitting food carbon:', err);
      throw new Error('Failed to submit food carbon');
    }
  };

  const submitRecycling = async (submission: RecyclingSubmission) => {
    try {
      console.log('Submitting recycling:', submission);
      console.log('Current user display name:', currentUser?.displayName);
      console.log('User profile display name:', userProfile?.displayName);
      
      const displayName = currentUser?.displayName || userProfile?.displayName || 'Unknown User';
      const userId = currentUser?.uid || '';
      console.log('Using display name:', displayName);
      console.log('Using userId:', userId);
      
      if (!userId) {
        console.error('ERROR: No userId available');
        throw new Error('User not authenticated');
      }
      
      const submissionRef = doc(collection(db, 'recycling'));
      await setDoc(submissionRef, {
        ...submission,
        userId,
        displayName,
        crewId: userCrew?.id || submission.crewId || '',
        crewName: userCrew?.name || (submission as any).crewName || '',
        createdAt: Timestamp.now()
      });
      
      console.log('Recycling submission saved successfully');
      
      // Update user profile with new score and submission count
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const newTotalScore = (userData.totalScore || 0) + submission.score;
          const newSubmissionsCount = (userData.submissionsCount || 0) + 1;
          
          await updateDoc(userRef, {
            totalScore: newTotalScore,
            submissionsCount: newSubmissionsCount,
            lastSubmission: Timestamp.now()
          });
          console.log('User profile updated with new score:', newTotalScore);
        }
      }
      
      console.log('Refreshing data after recycling submission...');
      await refreshData();
      await refreshCrewData();
      console.log('Data refresh completed');
    } catch (err) {
      console.error('Error submitting recycling:', err);
      throw new Error('Failed to submit recycling');
    }
  };

  const submitShowerTimer = async (submission: ShowerTimerSubmission) => {
    try {
      console.log('Submitting shower timer:', submission);
      console.log('Current user display name:', currentUser?.displayName);
      console.log('User profile display name:', userProfile?.displayName);
      
      const displayName = currentUser?.displayName || userProfile?.displayName || 'Unknown User';
      const userId = currentUser?.uid || '';
      console.log('Using display name:', displayName);
      console.log('Using userId:', userId);
      
      if (!userId) {
        console.error('ERROR: No userId available');
        throw new Error('User not authenticated');
      }
      
      const submissionRef = doc(collection(db, 'showerTimers'));
      await setDoc(submissionRef, {
        ...submission,
        userId,
        displayName,
        crewId: userCrew?.id || submission.crewId || '',
        crewName: userCrew?.name || (submission as any).crewName || '',
        createdAt: Timestamp.now()
      });
      
      console.log('Shower timer submission saved successfully');
      
      // Update user profile with new score and submission count
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const newTotalScore = (userData.totalScore || 0) + submission.score;
          const newSubmissionsCount = (userData.submissionsCount || 0) + 1;
          
          await updateDoc(userRef, {
            totalScore: newTotalScore,
            submissionsCount: newSubmissionsCount,
            lastSubmission: Timestamp.now()
          });
          console.log('User profile updated with new score:', newTotalScore);
        }
      }
      
      console.log('Refreshing data after shower timer submission...');
      await refreshData();
      await refreshCrewData();
      console.log('Data refresh completed');
    } catch (err) {
      console.error('Error submitting shower timer:', err);
      throw new Error('Failed to submit shower timer');
    }
  };

  const createCrew = async (name: string, description: string, startDate: string, defaultChallengeDuration: number) => {
    if (!currentUser) throw new Error('User must be logged in to create a crew');
    try {
      const crewRef = doc(collection(db, 'crews'));
      const now = Timestamp.now();
      const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      console.log('Generated join code:', joinCode); // Debug log
      
      const newCrew = {
        name,
        description,
        joinCode,
        leaderId: currentUser.uid,
        members: [currentUser.uid],
        score: 0,
        challenges: [],
        startDate: new Date(startDate),
        defaultChallengeDuration,
        createdAt: now.toDate(),
        updatedAt: now.toDate()
      };
      
      console.log('Saving crew with join code:', newCrew.joinCode); // Debug log
      
      await setDoc(crewRef, {
        ...newCrew,
        createdAt: now,
        updatedAt: now
      });
      
      console.log('Crew saved successfully with ID:', crewRef.id); // Debug log
      
      await refreshData();
      
      const result = {
        id: crewRef.id,
        ...newCrew
      };
      
      console.log('Returning crew with join code:', result.joinCode); // Debug log
      
      return result;
    } catch (err) {
      console.error('Error creating crew:', err);
      throw new Error('Failed to create crew');
    }
  };

  const createChallenge = async (challenge: Omit<Challenge, 'id'>) => {
    if (!currentUser) throw new Error('User must be logged in to create a challenge');
    
    try {
      const challengeRef = doc(collection(db, 'challenges'));
      const now = Timestamp.now();
      await setDoc(challengeRef, {
        ...challenge,
        id: challengeRef.id,
        participants: [],
        submissions: [],
        status: 'active',
        createdAt: now,
        updatedAt: now
      });
      await refreshData();
    } catch (err) {
      console.error('Error creating challenge:', err);
      throw new Error('Failed to create challenge');
    }
  };

  const createSampleLeaderboardData = useCallback(async () => {
    console.log('createSampleLeaderboardData called');
    console.log('currentUser:', currentUser);
    
    if (!currentUser) {
      console.log('No current user, cannot create sample data');
      return;
    }
    
    try {
      console.log('Creating sample leaderboard data...');
      
      // Create sample carbon footprint submission
      const carbonSubmission = {
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'Test User',
        challengeId: 'sample-challenge',
        crewId: 'sample-crew',
        crewName: 'Sample Crew',
        date: new Date(),
        startLocation: 'Home',
        endLocation: 'Work',
        distance: 10,
        transportType: 'car' as const,
        score: 150
      };
      
      console.log('Creating carbon footprint submission:', carbonSubmission);
      await setDoc(doc(collection(db, 'carbonFootprints')), {
        ...carbonSubmission,
        createdAt: Timestamp.now()
      });
      console.log('Carbon footprint submission created');
      
      // Create sample food carbon submission
      const foodSubmission = {
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'Test User',
        challengeId: 'sample-food-challenge',
        crewId: 'sample-crew',
        crewName: 'Sample Crew',
        date: new Date(),
        foodItems: [
          { id: '1', name: 'Vegetables', quantity: 2, carbonFootprint: 50, type: 'vegetables' }
        ],
        totalCarbonFootprint: 50,
        score: 100
      };
      
      console.log('Creating food carbon submission:', foodSubmission);
      await setDoc(doc(collection(db, 'foodCarbon')), {
        ...foodSubmission,
        createdAt: Timestamp.now()
      });
      console.log('Food carbon submission created');
      
      // Create sample recycling submission
      const recyclingSubmission = {
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'Test User',
        challengeId: 'sample-recycling-challenge',
        crewId: 'sample-crew',
        crewName: 'Sample Crew',
        date: new Date(),
        category: 'plastic, paper',
        quantity: 15,
        score: 75
      };
      
      console.log('Creating recycling submission:', recyclingSubmission);
      await setDoc(doc(collection(db, 'recycling')), {
        ...recyclingSubmission,
        createdAt: Timestamp.now()
      });
      console.log('Recycling submission created');
      
      // Create sample shower timer submission
      const showerSubmission = {
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'Test User',
        challengeId: 'sample-shower-challenge',
        crewId: 'sample-crew',
        crewName: 'Sample Crew',
        date: new Date(),
        duration: 5,
        score: 25
      };
      
      console.log('Creating shower timer submission:', showerSubmission);
      await setDoc(doc(collection(db, 'showerTimers')), {
        ...showerSubmission,
        createdAt: Timestamp.now()
      });
      console.log('Shower timer submission created');
      
      console.log('Sample data created successfully');
      console.log('Refreshing data...');
      await refreshData(); // Refresh to show the new data
      console.log('Data refresh completed');
    } catch (err) {
      console.error('Error creating sample data:', err);
    }
  }, [currentUser, refreshData]);

  const testSubmission = useCallback(async () => {
    console.log('testSubmission called');
    console.log('currentUser:', currentUser);
    console.log('userProfile:', userProfile);
    
    if (!currentUser) {
      console.log('No current user, cannot create test submission');
      return;
    }
    
    try {
      console.log('Creating test submission...');
      
      const testSubmissionData = {
        userId: currentUser.uid,
        displayName: currentUser.displayName || userProfile?.displayName || 'Test User',
        challengeId: 'test-challenge',
        crewId: userCrew?.id || 'test-crew',
        crewName: userCrew?.name || 'Test Crew',
        date: new Date(),
        startLocation: 'Test Start',
        endLocation: 'Test End',
        distance: 5,
        transportType: 'public' as const,
        score: 200
      };
      
      console.log('Creating test submission with data:', testSubmissionData);
      await setDoc(doc(collection(db, 'carbonFootprints')), {
        ...testSubmissionData,
        createdAt: Timestamp.now()
      });
      console.log('Test submission created successfully');
      
      console.log('Refreshing data...');
      await refreshData();
      console.log('Data refresh completed');
    } catch (err) {
      console.error('Error creating test submission:', err);
    }
  }, [currentUser, userProfile, userCrew, refreshData]);

  const refreshCrewData = useCallback(async () => {
    if (!userCrew || !currentUser) return;
    
    try {
      // Refresh crew members and performance data
      const [carbonFootprints, foodCarbon, recycling, showerTimers] = await Promise.all([
        getDocs(collection(db, 'carbonFootprints')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'foodCarbon')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'recycling')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'showerTimers')).catch(() => ({ docs: [] }))
      ]);
      
      // Update crew total score
      let crewTotalScore = 0;
      const crewMemberIds = new Set(userCrew.members);
      
      // Calculate total score for all crew members
      [...carbonFootprints.docs, ...foodCarbon.docs, ...recycling.docs, ...showerTimers.docs].forEach(doc => {
        const submission = doc.data();
        if (crewMemberIds.has(submission.userId)) {
          crewTotalScore += submission.score || 0;
        }
      });
      
      // Update crew document with new total score
      await updateDoc(doc(db, 'crews', userCrew.id), {
        totalScore: crewTotalScore,
        updatedAt: Timestamp.now()
      });
      
      // Refresh the crew data
      await refreshData();
    } catch (err) {
      console.error('Error refreshing crew data:', err);
    }
  }, [userCrew, currentUser, refreshData]);

  const comprehensiveTest = useCallback(async () => {
    console.log('=== COMPREHENSIVE TEST START ===');
    console.log('Current user:', currentUser);
    console.log('User profile:', userProfile);
    
    if (!currentUser) {
      console.log('ERROR: No current user found');
      return;
    }
    
    try {
      // Step 1: Create a test submission
      console.log('Step 1: Creating test submission...');
      const testSubmissionData = {
        userId: currentUser.uid,
        displayName: currentUser.displayName || userProfile?.displayName || 'Test User',
        challengeId: 'comprehensive-test',
        crewId: userCrew?.id || 'test-crew',
        crewName: userCrew?.name || 'Test Crew',
        date: new Date(),
        startLocation: 'Test Start',
        endLocation: 'Test End',
        distance: 10,
        transportType: 'car' as const,
        score: 300
      };
      
      console.log('Test submission data:', testSubmissionData);
      
      // Create the submission
      const submissionRef = doc(collection(db, 'carbonFootprints'));
      await setDoc(submissionRef, {
        ...testSubmissionData,
        createdAt: Timestamp.now()
      });
      console.log('Test submission created successfully');
      
      // Step 2: Wait a moment for Firestore to update
      console.log('Step 2: Waiting for Firestore to update...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Manually fetch the submission to verify it exists
      console.log('Step 3: Verifying submission exists...');
      const submissionsSnapshot = await getDocs(collection(db, 'carbonFootprints'));
      const submissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const ourSubmission = submissions.find((sub: any) => sub.userId === currentUser.uid && sub.challengeId === 'comprehensive-test');
      console.log('Found our submission:', ourSubmission);
      
      // Step 4: Refresh leaderboard data
      console.log('Step 4: Refreshing leaderboard...');
      await fetchLeaderboard();
      
      // Step 5: Check if our submission appears in the leaderboard
      console.log('Step 5: Checking leaderboard for our submission...');
      console.log('Current leaderboard:', leaderboard);
      const ourLeaderboardEntry = leaderboard.find(entry => entry.userId === currentUser.uid);
      console.log('Our leaderboard entry:', ourLeaderboardEntry);
      
      // Step 6: Update user profile
      console.log('Step 6: Updating user profile...');
      if (userProfile) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const newTotalScore = (userData.totalScore || 0) + 300;
          const newSubmissionsCount = (userData.submissionsCount || 0) + 1;
          
          await updateDoc(userRef, {
            totalScore: newTotalScore,
            submissionsCount: newSubmissionsCount,
            lastSubmission: Timestamp.now()
          });
          console.log('User profile updated');
        }
      }
      
      console.log('=== COMPREHENSIVE TEST COMPLETE ===');
      
    } catch (err) {
      console.error('Error in comprehensive test:', err);
    }
  }, [currentUser, userProfile, userCrew, fetchLeaderboard, leaderboard]);

  const authTest = useCallback(async () => {
    console.log('=== AUTHENTICATION TEST ===');
    console.log('Current user:', currentUser);
    console.log('User profile:', userProfile);
    console.log('User crew:', userCrew);
    console.log('Is user authenticated:', !!currentUser);
    console.log('User ID:', currentUser?.uid);
    console.log('User display name:', currentUser?.displayName);
    console.log('User email:', currentUser?.email);
    
    if (currentUser) {
      try {
        // Test Firestore access
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        console.log('User document exists:', userDoc.exists());
        if (userDoc.exists()) {
          console.log('User document data:', userDoc.data());
        }
        
        // Test collection access
        const submissionsSnapshot = await getDocs(collection(db, 'carbonFootprints'));
        console.log('Carbon footprints collection accessible, count:', submissionsSnapshot.docs.length);
        
      } catch (err) {
        console.error('Error testing Firestore access:', err);
      }
    } else {
      console.log('ERROR: No authenticated user found');
    }
    console.log('=== AUTHENTICATION TEST COMPLETE ===');
  }, [currentUser, userProfile, userCrew]);

  const backendTest = useCallback(async () => {
    console.log('=== BACKEND CONNECTIVITY TEST ===');
    
    if (!currentUser) {
      console.log('ERROR: No authenticated user');
      return;
    }
    
    try {
      // Test 1: Write to users collection
      console.log('Test 1: Writing to users collection...');
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // User exists, update it
        const testData = {
          testField: 'test-value',
          testTimestamp: Timestamp.now()
        };
        await updateDoc(userRef, testData);
        console.log('✓ Successfully updated users collection');
      } else {
        // User doesn't exist, create it
        const newUserProfile = {
          id: currentUser.uid,
          displayName: currentUser.displayName || 'Demo User',
          email: currentUser.email || '',
          crewId: '',
          totalScore: 0,
          level: 1,
          levelProgress: 0,
          achievements: [],
          avatarUrl: '',
          isCrewManager: false,
          submissionsCount: 0,
          averageScore: 0,
          bestScore: 0,
          lastSubmission: null,
          createdAt: new Date(),
          testField: 'test-value',
          testTimestamp: Timestamp.now()
        };
        await setDoc(userRef, newUserProfile);
        console.log('✓ Successfully created user document');
      }
      
      // Test 2: Reading from users collection...');
      const userDocRead = await getDoc(userRef);
      if (userDocRead.exists()) {
        console.log('✓ Successfully read from users collection');
        console.log('User data:', userDocRead.data());
      } else {
        console.log('✗ User document does not exist');
      }
      
      // Test 3: Write to carbonFootprints collection
      console.log('Test 3: Writing to carbonFootprints collection...');
      const testSubmissionRef = doc(collection(db, 'carbonFootprints'));
      const testSubmission = {
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'Test User',
        challengeId: 'backend-test',
        crewId: 'test-crew',
        crewName: 'Test Crew',
        date: new Date(),
        startLocation: 'Test Start',
        endLocation: 'Test End',
        distance: 5,
        transportType: 'car',
        score: 100,
        createdAt: Timestamp.now()
      };
      await setDoc(testSubmissionRef, testSubmission);
      console.log('✓ Successfully wrote to carbonFootprints collection');
      
      // Test 4: Read from carbonFootprints collection
      console.log('Test 4: Reading from carbonFootprints collection...');
      const submissionsSnapshot = await getDocs(collection(db, 'carbonFootprints'));
      console.log(`✓ Successfully read from carbonFootprints collection. Found ${submissionsSnapshot.docs.length} documents`);
      
      // Test 5: Read from all submission collections
      console.log('Test 5: Reading from all submission collections...');
      const [carbonFootprints, foodCarbon, recycling, showerTimers] = await Promise.all([
        getDocs(collection(db, 'carbonFootprints')),
        getDocs(collection(db, 'foodCarbon')),
        getDocs(collection(db, 'recycling')),
        getDocs(collection(db, 'showerTimers'))
      ]);
      
      console.log('Collection counts:', {
        carbonFootprints: carbonFootprints.docs.length,
        foodCarbon: foodCarbon.docs.length,
        recycling: recycling.docs.length,
        showerTimers: showerTimers.docs.length
      });
      
      // Test 6: Test leaderboard aggregation
      console.log('Test 6: Testing leaderboard aggregation...');
      const userScores = new Map<string, { userId: string; score: number; displayName: string; crewName: string; achievements: string[] }>();
      
      carbonFootprints.docs.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;
        if (userId) {
          const existing = userScores.get(userId) || { userId, score: 0, displayName: data.displayName || 'Unknown User', crewName: data.crewName || '', achievements: [] };
          existing.score += data.score || 0;
          existing.displayName = data.displayName || existing.displayName;
          existing.crewName = data.crewName || existing.crewName;
          userScores.set(userId, existing);
        }
      });
      
      console.log('User scores calculated:', userScores.size, 'users');
      console.log('User scores:', Array.from(userScores.entries()));
      
      // Clean up test data
      console.log('Cleaning up test data...');
      await updateDoc(userRef, { testField: null, testTimestamp: null });
      console.log('✓ Test data cleaned up');
      
      console.log('=== BACKEND CONNECTIVITY TEST COMPLETE ===');
      
    } catch (err) {
      console.error('Backend connectivity test failed:', err);
      console.error('Error details:', {
        code: (err as any).code,
        message: (err as any).message,
        stack: (err as any).stack
      });
    }
  }, [currentUser]);

  const firebaseConnectionTest = useCallback(async () => {
    console.log('=== FIREBASE CONNECTION TEST ===');
    console.log('Firebase config:', {
      projectId: 'ecorank-22728',
      authDomain: 'ecorank-22728.firebaseapp.com',
      apiKey: 'AIzaSyBl-Z5esXLPqgTl98SkDcwlYPA4-MS35ns'
    });
    
    try {
      // Test 1: Check if we can access Firestore
      console.log('Test 1: Testing Firestore connection...');
      const testRef = doc(db, 'test', 'connection-test');
      await setDoc(testRef, {
        timestamp: Timestamp.now(),
        message: 'Connection test successful'
      });
      console.log('✓ Successfully wrote to Firestore');
      
      // Test 2: Read the test document
      console.log('Test 2: Reading test document...');
      const testDoc = await getDoc(testRef);
      if (testDoc.exists()) {
        console.log('✓ Successfully read from Firestore');
        console.log('Test document data:', testDoc.data());
      }
      
      // Test 3: Clean up test document
      console.log('Test 3: Cleaning up test document...');
      await setDoc(testRef, {});
      console.log('✓ Test document cleaned up');
      
      // Test 4: Check if we can access the users collection
      console.log('Test 4: Testing users collection access...');
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        console.log('✓ Users collection accessible');
        console.log('User document exists:', userDoc.exists());
      } else {
        console.log('⚠ No current user for users collection test');
      }
      
      // Test 5: Check if we can access submission collections
      console.log('Test 5: Testing submission collections access...');
      const collections = ['carbonFootprints', 'foodCarbon', 'recycling', 'showerTimers'];
      
      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          console.log(`✓ ${collectionName} collection accessible (${snapshot.docs.length} documents)`);
        } catch (err) {
          console.error(`✗ ${collectionName} collection not accessible:`, err);
        }
      }
      
      console.log('=== FIREBASE CONNECTION TEST COMPLETE ===');
      
    } catch (err) {
      console.error('Firebase connection test failed:', err);
      console.error('Error details:', {
        code: (err as any).code,
        message: (err as any).message,
        stack: (err as any).stack
      });
    }
  }, [currentUser]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const value: AppContextType = {
    user: currentUser ? {
      id: currentUser.uid,
      email: currentUser.email || '',
      displayName: currentUser.displayName || '',
      totalScore: userProfile?.totalScore || 0,
      level: userProfile?.level || 1,
      achievements: userProfile?.achievements || []
    } : null,
    userProfile,
    crew,
    userCrew,
    challenges,
    currentChallenge,
    leaderboard,
    selectedVehicle,
    isLoading,
    error,
    refreshData,
    joinCrew: async (crewId: string) => {
      if (!currentUser) throw new Error('User must be logged in to join a crew');
      const crewRef = doc(db, 'crews', crewId);
      await updateDoc(crewRef, {
        members: [...(await getDoc(crewRef)).data()?.members || [], currentUser.uid]
      });
      await refreshData();
    },
    leaveCrew: async () => {
      if (!currentUser || !userCrew) throw new Error('User must be in a crew to leave');
      console.log('Leaving crew:', userCrew.id); // Debug log
      const crewRef = doc(db, 'crews', userCrew.id);
      const crewDoc = await getDoc(crewRef);
      const currentMembers = crewDoc.data()?.members || [];
      console.log('Current members before leaving:', currentMembers); // Debug log
      
      const updatedMembers = currentMembers.filter((id: string) => id !== currentUser.uid);
      console.log('Updated members after leaving:', updatedMembers); // Debug log
      
      await updateDoc(crewRef, {
        members: updatedMembers
      });
      console.log('Successfully removed user from crew in Firestore'); // Debug log
      await refreshData();
      console.log('Data refreshed after leaving crew'); // Debug log
    },
    submitChallenge: async (submission: ChallengeSubmission) => {
      try {
        const submissionRef = doc(collection(db, 'submissions'));
        const now = Timestamp.now();
        await setDoc(submissionRef, {
          ...submission,
          id: submissionRef.id,
          status: 'pending',
          createdAt: now,
          updatedAt: now
        });
        await refreshData();
      } catch (err) {
        console.error('Error submitting challenge:', err);
        throw new Error('Failed to submit challenge');
      }
    },
    submitCarbonFootprint,
    submitFoodCarbon,
    submitRecycling,
    submitShowerTimer,
    createCrew,
    createChallenge,
    getUserCrews: async () => {
      if (!currentUser) throw new Error('User must be logged in to get user crews');
      const crewsQuery = query(
        collection(db, 'crews'),
        where('members', 'array-contains', currentUser.uid)
      );
      const snapshot = await getDocs(crewsQuery);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description || '',
          leaderId: data.leaderId,
          members: data.members || [],
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          joinCode: data.joinCode,
          score: data.score || 0,
          challenges: data.challenges || []
        } as Crew;
      });
    },
    getActiveChallenges: async () => {
      const now = Timestamp.now();
      const challengesQuery = query(
        collection(db, 'challenges'),
        where('status', '==', 'active'),
        where('endDate', '>', now)
      );
      const snapshot = await getDocs(challengesQuery);
      const challenges = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || data.name,
          description: data.description,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          type: data.type || 'carbon',
          crewId: data.crewId,
          participants: data.participants || [],
          submissions: data.submissions || [],
          status: data.status || 'active',
          duration: data.duration || 7,
          lowerScoreIsBetter: data.lowerScoreIsBetter || false,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Challenge;
      });
      
      // Sort in JavaScript instead of Firestore
      return challenges.sort((a, b) => {
        if (!a.endDate || !b.endDate) return 0;
        return a.endDate.getTime() - b.endDate.getTime();
      });
    },
    getCrew: async (crewId: string) => {
      try {
        const crewRef = doc(db, 'crews', crewId);
        const snapshot = await getDoc(crewRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          return {
            id: snapshot.id,
            name: data.name,
            description: data.description || '',
            leaderId: data.leaderId,
            members: data.members || [],
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            joinCode: data.joinCode,
            score: data.score || 0,
            challenges: data.challenges || []
          } as Crew;
        }
        throw new Error('Crew not found');
      } catch (err) {
        console.error('Error fetching crew:', err);
        throw new Error('Failed to fetch crew');
      }
    },
    getCrewMembers: async (crewId: string) => {
      try {
        const crewRef = doc(db, 'crews', crewId);
        const snapshot = await getDoc(crewRef);
        if (snapshot.exists()) {
          const members = snapshot.data()?.members || [];
          const membersQuery = query(
            collection(db, 'users'),
            where('id', 'in', members)
          );
          const membersSnapshot = await getDocs(membersQuery);
          return membersSnapshot.docs.map(doc => doc.data() as UserProfile);
        }
        throw new Error('Crew not found');
      } catch (err) {
        console.error('Error fetching crew members:', err);
        throw new Error('Failed to fetch crew members');
      }
    },
    getCrewChallenges: async (crewId: string) => {
      try {
        const crewRef = doc(db, 'crews', crewId);
        const snapshot = await getDoc(crewRef);
        if (snapshot.exists()) {
          const challenges = snapshot.data()?.challenges || [];
          const challengesQuery = query(
            collection(db, 'challenges'),
            where('id', 'in', challenges)
          );
          const challengesSnapshot = await getDocs(challengesQuery);
          return challengesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || data.name,
              description: data.description,
              startDate: data.startDate?.toDate(),
              endDate: data.endDate?.toDate(),
              type: data.type || 'carbon',
              crewId: data.crewId,
              participants: data.participants || [],
              submissions: data.submissions || [],
              status: data.status || 'active',
              duration: data.duration || 7,
              lowerScoreIsBetter: data.lowerScoreIsBetter || false,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate()
            } as Challenge;
          });
        }
        throw new Error('Crew not found');
      } catch (err) {
        console.error('Error fetching crew challenges:', err);
        throw new Error('Failed to fetch crew challenges');
      }
    },
    removeMember: async (crewId: string, memberId: string) => {
      if (!currentUser || !userCrew) throw new Error('User must be in a crew to remove a member');
      const crewRef = doc(db, 'crews', crewId);
      await updateDoc(crewRef, {
        members: (await getDoc(crewRef)).data()?.members.filter((id: string) => id !== memberId) || []
      });
      await refreshData();
    },
    transferLeadership: async (crewId: string, newLeaderId: string) => {
      if (!currentUser || !userCrew) throw new Error('User must be in a crew to transfer leadership');
      const crewRef = doc(db, 'crews', crewId);
      await updateDoc(crewRef, {
        leaderId: newLeaderId
      });
      await refreshData();
    },
    saveVehicle: (vehicleData: VehicleData) => {
      setSelectedVehicle(vehicleData);
    },
    clearVehicle: () => {
      setSelectedVehicle(null);
    },
    createSampleLeaderboardData,
    testSubmission,
    refreshCrewData,
    comprehensiveTest,
    authTest,
    backendTest,
    firebaseConnectionTest
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 