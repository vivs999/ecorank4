import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Crew, Challenge, ChallengeSubmission, LeaderboardEntry, UserProfile, CarbonFootprintSubmission, FoodCarbonSubmission, RecyclingSubmission, ShowerTimerSubmission } from '../types';
import { VehicleData } from '../services/carEmissions';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
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

      // Create a map to aggregate scores by user
      const userScores = new Map<string, {
        userId: string;
        displayName: string;
        totalScore: number;
        submissions: number;
        crewId?: string;
        crewName?: string;
        achievements: string[];
      }>();

      // Process carbon footprint submissions
      carbonFootprints.docs.forEach(doc => {
        const data = doc.data();
        if (!data.userId) return; // Skip entries without userId
        
        const userId = data.userId;
        const existing = userScores.get(userId) || {
          userId,
          displayName: data.displayName || 'Unknown User',
          totalScore: 0,
          submissions: 0,
          crewId: data.crewId,
          crewName: data.crewName,
          achievements: [] as string[]
        };
        existing.totalScore += data.score || 0;
        existing.submissions += 1;
        if (data.score > 0) {
          existing.achievements.push('Carbon Tracker');
        }
        userScores.set(userId, existing);
      });

      // Process food carbon submissions
      foodCarbon.docs.forEach(doc => {
        const data = doc.data();
        if (!data.userId) return;
        
        const userId = data.userId;
        const existing = userScores.get(userId) || {
          userId,
          displayName: data.displayName || 'Unknown User',
          totalScore: 0,
          submissions: 0,
          crewId: data.crewId,
          crewName: data.crewName,
          achievements: [] as string[]
        };
        existing.totalScore += data.score || 0;
        existing.submissions += 1;
        if (data.score > 0) {
          existing.achievements.push('Food Warrior');
        }
        userScores.set(userId, existing);
      });

      // Process recycling submissions
      recycling.docs.forEach(doc => {
        const data = doc.data();
        if (!data.userId) return;
        
        const userId = data.userId;
        const existing = userScores.get(userId) || {
          userId,
          displayName: data.displayName || 'Unknown User',
          totalScore: 0,
          submissions: 0,
          crewId: data.crewId,
          crewName: data.crewName,
          achievements: [] as string[]
        };
        existing.totalScore += data.score || 0;
        existing.submissions += 1;
        if (data.score > 0) {
          existing.achievements.push('Recycling Master');
        }
        userScores.set(userId, existing);
      });

      // Process shower timer submissions
      showerTimers.docs.forEach(doc => {
        const data = doc.data();
        if (!data.userId) return;
        
        const userId = data.userId;
        const existing = userScores.get(userId) || {
          userId,
          displayName: data.displayName || 'Unknown User',
          totalScore: 0,
          submissions: 0,
          crewId: data.crewId,
          crewName: data.crewName,
          achievements: [] as string[]
        };
        existing.totalScore += data.score || 0;
        existing.submissions += 1;
        if (data.score > 0) {
          existing.achievements.push('Water Saver');
        }
        userScores.set(userId, existing);
      });

      console.log('Total users found:', userScores.size);

      // Convert to array and sort by total score
      const sortedEntries = Array.from(userScores.values())
        .sort((a, b) => b.totalScore - a.totalScore);

      // Handle ties properly
      const leaderboardEntries: LeaderboardEntry[] = sortedEntries.map((entry, index) => {
        let position = index + 1;
        
        // Check for ties with previous entry
        if (index > 0 && entry.totalScore === sortedEntries[index - 1].totalScore) {
          position = leaderboardEntries[index - 1].position;
        }

        // Add additional achievements based on performance
        const achievements = [...entry.achievements];
        if (entry.submissions >= 10) achievements.push('Dedicated Participant');
        if (entry.totalScore >= 1000) achievements.push('High Scorer');
        if (entry.totalScore >= 500) achievements.push('Consistent Saver');
        if (position === 1) achievements.push('Leader');
        if (position <= 3) achievements.push('Top Performer');

        return {
          userId: entry.userId,
          displayName: entry.displayName,
          score: entry.totalScore,
          position,
          crewId: entry.crewId || '',
          crewName: entry.crewName || '',
          achievements: achievements,
          tiedWith: undefined // Simplified tie handling for now
        } as LeaderboardEntry;
      });

      console.log('Leaderboard entries created:', leaderboardEntries.length);
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
        setUserProfile({
          id: userDoc.id,
          displayName: data.displayName,
          email: data.email,
          crewId: data.crewId,
          totalScore: data.totalScore || 0,
          level: data.level || 1,
          levelProgress: data.levelProgress || 0,
          achievements: data.achievements || [],
          avatarUrl: data.avatarUrl,
          isCrewManager: data.isCrewManager || false,
          submissionsCount: data.submissionsCount || 0,
          averageScore: data.averageScore || 0,
          bestScore: data.bestScore || 0,
          lastSubmission: data.lastSubmission?.toDate() || null,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to fetch user profile');
    }
  }, []);

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
    if (!currentUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchUserProfile(currentUser.uid),
        fetchUserCrew(currentUser.uid),
        fetchLeaderboard()
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchUserProfile, fetchUserCrew, fetchLeaderboard]);

  const submitCarbonFootprint = async (submission: CarbonFootprintSubmission) => {
    try {
      const submissionRef = doc(collection(db, 'carbonFootprints'));
      await setDoc(submissionRef, {
        ...submission,
        createdAt: Timestamp.now()
      });
      await refreshData();
    } catch (err) {
      console.error('Error submitting carbon footprint:', err);
      throw new Error('Failed to submit carbon footprint');
    }
  };

  const submitFoodCarbon = async (submission: FoodCarbonSubmission) => {
    try {
      const submissionRef = doc(collection(db, 'foodCarbon'));
      await setDoc(submissionRef, {
        ...submission,
        createdAt: Timestamp.now()
      });
      await refreshData();
    } catch (err) {
      console.error('Error submitting food carbon:', err);
      throw new Error('Failed to submit food carbon');
    }
  };

  const submitRecycling = async (submission: RecyclingSubmission) => {
    try {
      const submissionRef = doc(collection(db, 'recycling'));
      await setDoc(submissionRef, {
        ...submission,
        createdAt: Timestamp.now()
      });
      await refreshData();
    } catch (err) {
      console.error('Error submitting recycling:', err);
      throw new Error('Failed to submit recycling');
    }
  };

  const submitShowerTimer = async (submission: ShowerTimerSubmission) => {
    try {
      const submissionRef = doc(collection(db, 'showerTimers'));
      await setDoc(submissionRef, {
        ...submission,
        createdAt: Timestamp.now()
      });
      await refreshData();
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
    if (!currentUser) return;
    
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
      
      await setDoc(doc(collection(db, 'carbonFootprints')), {
        ...carbonSubmission,
        createdAt: Timestamp.now()
      });
      
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
      
      await setDoc(doc(collection(db, 'foodCarbon')), {
        ...foodSubmission,
        createdAt: Timestamp.now()
      });
      
      console.log('Sample data created successfully');
      await refreshData(); // Refresh to show the new data
    } catch (err) {
      console.error('Error creating sample data:', err);
    }
  }, [currentUser, refreshData]);

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
    createSampleLeaderboardData
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