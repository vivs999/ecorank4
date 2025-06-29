import { 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentData,
  FirestoreError
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  User, 
  Crew, 
  Challenge, 
  ChallengeSubmission, 
  LeaderboardEntry,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  Achievement
} from '../types';
import { handleError, cacheKey, calculateLevel, getLevelProgress } from '../utils/helpers';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class ApiService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  private async getCached<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(key: string): void {
    this.cache.delete(key);
  }

  // User operations
  async getUser(userId: string): Promise<ApiResponse<User>> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return { error: 'User not found' };
      }
      return { data: { id: userDoc.id, ...userDoc.data() } as User };
    } catch (error) {
      return { error: handleError(error).message };
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updates);
      this.clearCache(cacheKey.submissions(userId));
      
      const updatedDoc = await getDoc(userRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } as User };
    } catch (error) {
      return { error: handleError(error).message };
    }
  }

  // Crew operations
  async getCrew(crewId: string): Promise<ApiResponse<Crew>> {
    try {
      const crewDoc = await getDoc(doc(db, 'crews', crewId));
      if (!crewDoc.exists()) {
        return { error: 'Crew not found' };
      }
      
      const crewData = crewDoc.data();
      const membersQuery = query(
        collection(db, 'users'),
        where('crewId', '==', crewId)
      );
      const membersSnapshot = await getDocs(membersQuery);
      const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      return { data: { id: crewDoc.id, ...crewData, members } as unknown as Crew };
    } catch (error) {
      return { error: handleError(error).message };
    }
  }

  async getCrews(): Promise<ApiResponse<Crew[]>> {
    try {
      const crewsSnapshot = await getDocs(collection(db, 'crews'));
      const crews = crewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Crew));
      return { data: crews };
    } catch (error) {
      return { error: handleError(error).message };
    }
  }

  async createCrew(crew: Omit<Crew, 'id'>): Promise<ApiResponse<Crew>> {
    try {
      const crewRef = await addDoc(collection(db, 'crews'), crew);
      const newCrew = { id: crewRef.id, ...crew };
      return { data: newCrew as Crew };
    } catch (error) {
      return { error: handleError(error).message };
    }
  }

  async updateCrew(crewId: string, updates: Partial<Crew>): Promise<ApiResponse<Crew>> {
    try {
      const crewRef = doc(db, 'crews', crewId);
      await updateDoc(crewRef, updates);
      this.clearCache(cacheKey.challenges(crewId));
      
      const updatedDoc = await getDoc(crewRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } as Crew };
    } catch (error) {
      return { error: handleError(error).message };
    }
  }

  // Challenge operations
  async getChallenges(crewId?: string): Promise<ApiResponse<Challenge[]>> {
    try {
      const cacheKey = `challenges_${crewId || 'all'}`;
      const cached = await this.getCached<Challenge[]>(cacheKey);
      if (cached) return { data: cached };

      let challengesQuery = query(
        collection(db, 'challenges'),
        where('status', '==', 'active')
      );

      if (crewId) {
        challengesQuery = query(
          collection(db, 'challenges'),
          where('status', '==', 'active'),
          where('crewId', '==', crewId)
        );
      }

      const challengesSnapshot = await getDocs(challengesQuery);
      const challenges = challengesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));

      this.setCache(cacheKey, challenges);
      return { data: challenges };
    } catch (error) {
      return { error: handleError(error).message };
    }
  }

  async createChallenge(challenge: Omit<Challenge, 'id'>): Promise<ApiResponse<Challenge>> {
    try {
      const challengeRef = await addDoc(collection(db, 'challenges'), challenge);
      const newChallenge = { id: challengeRef.id, ...challenge };
      
      if (challenge.crewId) {
        this.clearCache(cacheKey.challenges(challenge.crewId));
      }
      return { data: newChallenge as Challenge };
    } catch (error) {
      return { error: handleError(error).message };
    }
  }

  // Submission operations
  async getSubmissions(
    userId: string,
    params: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<ChallengeSubmission>>> {
    try {
      const submissionsQuery = query(
        collection(db, 'submissions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const allSubmissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChallengeSubmission));
      
      const startIndex = params.page * params.limit;
      const endIndex = startIndex + params.limit;
      const paginatedSubmissions = allSubmissions.slice(startIndex, endIndex);

      return {
        data: {
          data: paginatedSubmissions,
          pagination: {
            ...params,
            total: allSubmissions.length
          }
        }
      };
    } catch (error) {
      return { error: handleError(error).message };
    }
  }

  async createSubmission(
    submission: Omit<ChallengeSubmission, 'id'>
  ): Promise<ApiResponse<ChallengeSubmission>> {
    try {
      const submissionRef = await addDoc(collection(db, 'submissions'), submission);
      const newSubmission = { id: submissionRef.id, ...submission };
      
      this.clearCache(cacheKey.submissions(submission.userId));
      if ((submission as any).crewId) {
        this.clearCache(cacheKey.leaderboard((submission as any).crewId));
      }
      return { data: newSubmission as ChallengeSubmission };
    } catch (error) {
      return { error: handleError(error).message };
    }
  }

  // Leaderboard operations
  async getLeaderboard(
    crewId: string,
    challengeId?: string
  ): Promise<ApiResponse<LeaderboardEntry[]>> {
    try {
      const cacheKey = `leaderboard_${crewId}_${challengeId || 'all'}`;
      const cached = await this.getCached<LeaderboardEntry[]>(cacheKey);
      if (cached) return { data: cached };

      let submissionsQuery = query(
        collection(db, 'submissions'),
        where('crewId', '==', crewId)
      );

      if (challengeId) {
        submissionsQuery = query(
          collection(db, 'submissions'),
          where('crewId', '==', crewId),
          where('challengeId', '==', challengeId)
        );
      }

      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChallengeSubmission));

      // Get user details for submissions
      const userIds = Array.from(new Set(submissions.map(sub => sub.userId)));
      const userPromises = userIds.map(userId => getDoc(doc(db, 'users', userId)));
      const userDocs = await Promise.all(userPromises);
      
      const users = new Map();
      userDocs.forEach(doc => {
        if (doc.exists()) {
          users.set(doc.id, { id: doc.id, ...doc.data() });
        }
      });

      const leaderboard = submissions.map(submission => {
        const user = users.get(submission.userId);
        return {
          userId: submission.userId,
          displayName: user?.displayName || 'Unknown User',
          score: submission.score,
          crewId: crewId,
          crewName: user?.crewName,
          position: 0
        };
      });

      // Calculate positions
      leaderboard.sort((a: any, b: any) => b.score - a.score);
      leaderboard.forEach((entry: any, index: number) => {
        entry.position = index + 1;
      });

      this.setCache(cacheKey, leaderboard);
      return { data: leaderboard };
    } catch (error) {
      return { error: handleError(error).message };
    }
  }

  // User Statistics
  async getUserStats(userId: string): Promise<ApiResponse<{
    totalScore: number;
    level: number;
    levelProgress: number;
    achievements: Achievement[];
    submissionsCount: number;
    averageScore: number;
    bestScore: number;
    lastSubmission: Date | null;
  }>> {
    try {
      const cacheKey = `user_stats_${userId}`;
      const cached = await this.getCached<{
        totalScore: number;
        level: number;
        levelProgress: number;
        achievements: Achievement[];
        submissionsCount: number;
        averageScore: number;
        bestScore: number;
        lastSubmission: Date | null;
      }>(cacheKey);
      if (cached) return { data: cached };

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        const stats = {
          totalScore: 0,
          level: 1,
          levelProgress: 0,
          achievements: [],
          submissionsCount: 0,
          averageScore: 0,
          bestScore: 0,
          lastSubmission: null
        };
        return { data: stats };
      }

      const user = { id: userDoc.id, ...userDoc.data() } as User;

      const submissionsQuery = query(
        collection(db, 'submissions'),
        where('userId', '==', userId)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChallengeSubmission));

      const stats = {
        totalScore: user.totalScore || 0,
        level: calculateLevel(user.totalScore || 0),
        levelProgress: getLevelProgress(user.totalScore || 0),
        achievements: user.achievements || [],
        submissionsCount: submissions.length,
        averageScore: submissions.length > 0 
          ? submissions.reduce((acc, sub) => acc + sub.score, 0) / submissions.length 
          : 0,
        bestScore: submissions.length > 0 
          ? Math.max(...submissions.map(sub => sub.score))
          : 0,
        lastSubmission: submissions.length > 0 
          ? new Date(Math.max(...submissions.map(sub => new Date(sub.createdAt).getTime())))
          : null
      };

      this.setCache(cacheKey, stats);
      return { data: stats };
    } catch (error) {
      return { error: handleError(error).message };
    }
  }

  // Crew Statistics
  async getCrewStats(crewId: string): Promise<ApiResponse<{
    totalScore: number;
    memberCount: number;
    averageScore: number;
    topPerformer: {
      userId: string;
      displayName: string;
      score: number;
    } | null;
    recentActivity: {
      userId: string;
      displayName: string;
      challengeId: string;
      score: number;
      createdAt: Date;
    }[];
  }>> {
    try {
      const cacheKey = `crew_stats_${crewId}`;
      const cached = await this.getCached<{
        totalScore: number;
        memberCount: number;
        averageScore: number;
        topPerformer: { userId: string; displayName: string; score: number } | null;
        recentActivity: { userId: string; displayName: string; challengeId: string; score: number; createdAt: Date }[];
      }>(cacheKey);
      if (cached) return { data: cached };

      const crewDoc = await getDoc(doc(db, 'crews', crewId));
      if (!crewDoc.exists()) {
        const stats = {
          totalScore: 0,
          memberCount: 0,
          averageScore: 0,
          topPerformer: null,
          recentActivity: []
        };
        return { data: stats };
      }

      const crew = { id: crewDoc.id, ...crewDoc.data() } as Crew;

      const membersQuery = query(
        collection(db, 'users'),
        where('crewId', '==', crewId)
      );
      const membersSnapshot = await getDocs(membersQuery);
      const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

      const submissionsQuery = query(
        collection(db, 'submissions'),
        where('crewId', '==', crewId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChallengeSubmission));

      if (!crew || !members || !submissions) {
        const stats = {
          totalScore: 0,
          memberCount: 0,
          averageScore: 0,
          topPerformer: null,
          recentActivity: []
        };
        return { data: stats };
      }

      const stats = {
        totalScore: (crew as any).totalScore || 0,
        memberCount: members.length,
        averageScore: members.length > 0 
          ? members.reduce((acc, member) => acc + (member.totalScore || 0), 0) / members.length 
          : 0,
        topPerformer: members.length > 0 
          ? (() => {
              const top = members.reduce((max, member) => (member.totalScore || 0) > (max.totalScore || 0) ? member : max, members[0]);
              return {
                userId: top.id,
                displayName: top.displayName || 'Unknown User',
                score: top.totalScore || 0
              };
            })()
          : null,
        recentActivity: submissions.map(submission => ({
          userId: submission.userId,
          displayName: members.find(m => m.id === submission.userId)?.displayName || 'Unknown User',
          challengeId: submission.challengeId,
          score: submission.score,
          createdAt: new Date(submission.createdAt)
        }))
      };

      this.setCache(cacheKey, stats);
      return { data: stats };
    } catch (error) {
      return { error: handleError(error).message };
    }
  }

  // Challenge Statistics
  async getChallengeStats(challengeId: string): Promise<ApiResponse<{
    totalSubmissions: number;
    averageScore: number;
    bestScore: number;
    participationRate: number;
    topParticipants: {
      userId: string;
      displayName: string;
      score: number;
      submissions: number;
    }[];
  }>> {
    try {
      const cacheKey = `challenge_stats_${challengeId}`;
      const cached = await this.getCached<{
        totalSubmissions: number;
        averageScore: number;
        bestScore: number;
        participationRate: number;
        topParticipants: { userId: string; displayName: string; score: number; submissions: number }[];
      }>(cacheKey);
      if (cached) return { data: cached };

      const challengeDoc = await getDoc(doc(db, 'challenges', challengeId));
      if (!challengeDoc.exists()) {
        const stats = {
          totalSubmissions: 0,
          averageScore: 0,
          bestScore: 0,
          participationRate: 0,
          topParticipants: []
        };
        return { data: stats };
      }

      const challenge = { id: challengeDoc.id, ...challengeDoc.data() } as Challenge;

      const submissionsQuery = query(
        collection(db, 'submissions'),
        where('challengeId', '==', challengeId)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChallengeSubmission));

      const crewDoc = await getDoc(doc(db, 'crews', challenge.crewId));
      if (!crewDoc.exists()) {
        const stats = {
          totalSubmissions: 0,
          averageScore: 0,
          bestScore: 0,
          participationRate: 0,
          topParticipants: []
        };
        return { data: stats };
      }

      const crew = { id: crewDoc.id, ...crewDoc.data() } as Crew;

      if (!challenge || !submissions || !crew) {
        const stats = {
          totalSubmissions: 0,
          averageScore: 0,
          bestScore: 0,
          participationRate: 0,
          topParticipants: []
        };
        return { data: stats };
      }

      const memberCount = crew.members?.length || 0;
      const userSubmissions = new Map<string, { score: number; count: number; displayName: string }>();

      submissions.forEach(submission => {
        const current = userSubmissions.get(submission.userId) || { score: 0, count: 0, displayName: '' };
        userSubmissions.set(submission.userId, {
          score: current.score + submission.score,
          count: current.count + 1,
          displayName: current.displayName
        });
      });

      const stats = {
        totalSubmissions: submissions.length,
        averageScore: submissions.length > 0 
          ? submissions.reduce((acc, sub) => acc + sub.score, 0) / submissions.length 
          : 0,
        bestScore: submissions.length > 0 
          ? Math.max(...submissions.map(sub => sub.score))
          : 0,
        participationRate: memberCount > 0 ? (userSubmissions.size / memberCount) * 100 : 0,
        topParticipants: Array.from(userSubmissions.entries())
          .map(([userId, data]) => ({
            userId,
            displayName: data.displayName,
            score: data.score,
            submissions: data.count
          }))
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 5)
      };

      this.setCache(cacheKey, stats);
      return { data: stats };
    } catch (error) {
      return { error: handleError(error).message };
    }
  }

  // Achievement Management
  async unlockAchievement(
    userId: string,
    achievementId: string
  ): Promise<ApiResponse<Achievement>> {
    try {
      const achievementDoc = await getDoc(doc(db, 'achievements', achievementId));
      if (!achievementDoc.exists()) {
        return { error: 'Achievement not found' };
      }

      const achievement = { id: achievementDoc.id, ...achievementDoc.data() } as Achievement;

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return { error: 'User not found' };
      }

      const user = { id: userDoc.id, ...userDoc.data() } as User;
      const achievements = user.achievements || [];
      
      if ((achievements as any[]).some((a: any) => a.id === achievementId)) {
        return { data: achievement };
      }

      const updatedAchievements = [
        ...achievements,
        {
          ...achievement,
          unlockedAt: new Date()
        }
      ];

      await updateDoc(doc(db, 'users', userId), { achievements: updatedAchievements });

      this.clearCache(`user_stats_${userId}`);
      return { data: achievement };
    } catch (error) {
      return { error: handleError(error).message };
    }
  }
}

export const apiService = new ApiService();
export default apiService; 