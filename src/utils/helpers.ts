/**
 * Utility functions for the EcoRank application
 */

import { ChallengeSubmission, LeaderboardEntry, Trip, FoodItem, RecyclingItem, Challenge, Crew, UserProfile } from '../types';

// Constants
export const CHALLENGE_TYPES = {
  CARBON_FOOTPRINT: 1,
  RECYCLING: 2,
  FOOD_CARBON: 3,
  SHOWER_TIMER: 4
} as const;

export const DAILY_LIMITS = {
  [CHALLENGE_TYPES.RECYCLING]: 100,
  [CHALLENGE_TYPES.SHOWER_TIMER]: 3
} as const;

/**
 * Generates a random alphanumeric code of specified length
 * @param length Length of the code to generate (default: 6)
 * @returns Random alphanumeric string
 */
export const generateRandomCode = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Formats a date in a user-friendly format
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Formats a time in a user-friendly format
 * @param date Date to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formats a date and time in a user-friendly format
 * @param date Date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Truncates a string to a specified length and adds ellipsis
 * @param str String to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export const truncateString = (str: string, maxLength: number = 50): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Formats a number as a score with + sign for positive values
 * @param score Number to format
 * @returns Formatted score string
 */
export const formatScore = (score: number): string => {
  if (score >= 1000000) {
    return `${(score / 1000000).toFixed(1)}M`;
  }
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}K`;
  }
  return score.toString();
};

/**
 * Calculates a user's level based on their score
 * @param score User's total score
 * @returns User's level number
 */
export const calculateLevel = (totalScore: number): number => {
  return Math.floor(Math.sqrt(totalScore / 100)) + 1;
};

/**
 * Gets level progress as a percentage to the next level
 * @param score User's total score
 * @returns Number between 0-100 representing percentage progress to next level
 */
export const getLevelProgress = (totalScore: number): number => {
  const currentLevel = calculateLevel(totalScore);
  const scoreForCurrentLevel = (currentLevel - 1) ** 2 * 100;
  const scoreForNextLevel = currentLevel ** 2 * 100;
  const scoreInCurrentLevel = totalScore - scoreForCurrentLevel;
  const scoreNeededForNextLevel = scoreForNextLevel - scoreForCurrentLevel;
  return (scoreInCurrentLevel / scoreNeededForNextLevel) * 100;
};

// Score calculation functions
export const calculateCarbonFootprintScore = (trips: Trip[]): number => {
  return trips.reduce((total, trip) => {
    switch (trip.type) {
      case 'bike':
      case 'walk':
        return total + 10;
      case 'public':
        return total + 8;
      case 'car':
        return total + Math.max(-10, 5 - trip.distance * 0.5);
      default:
        return total;
    }
  }, 0);
};

export const calculateFoodCarbonScore = (items: FoodItem[]): number => {
  const totalFootprint = items.reduce((total, item) => {
    switch (item.type) {
      case 'meat':
        return total + item.quantity * 2.5;
      case 'dairy':
        return total + item.quantity * 1.5;
      case 'vegetables':
        return total + item.quantity * 0.5;
      case 'fruits':
        return total + item.quantity * 0.3;
      default:
        return total;
    }
  }, 0);

  return Math.min(100, Math.max(0, 20 - totalFootprint) * 5);
};

export const calculateRecyclingScore = (items: RecyclingItem[]): number => {
  return items.reduce((total, item) => {
    switch (item.type) {
      case 'metal':
        return total + item.quantity * 6;
      case 'plastic':
        return total + item.quantity * 5;
      case 'paper':
        return total + item.quantity * 4;
      case 'glass':
        return total + item.quantity * 3;
      default:
        return total;
    }
  }, 0);
};

export const calculateShowerTimerScore = (duration: number): number => {
  if (duration <= 0) return 3; // Skipped shower
  if (duration <= 5) return 10; // Excellent
  if (duration <= 10) return 8; // Good
  if (duration <= 15) return 5; // Fair
  return 3; // Poor
};

// Leaderboard calculation
export const calculateLeaderboard = (
  submissions: ChallengeSubmission[],
  crewId: string,
  lowerScoreIsBetter: boolean = false
): LeaderboardEntry[] => {
  const userScores = new Map<string, { score: number; displayName: string }>();
  
  // Aggregate scores and keep track of display names
  submissions.forEach(submission => {
    const displayName = (submission as any).displayName || '';
    const current = userScores.get(submission.userId) || { score: 0, displayName };
    userScores.set(submission.userId, {
      score: current.score + submission.score,
      displayName
    });
  });
  
  // Convert to array and sort
  const leaderboard: LeaderboardEntry[] = Array.from(userScores.entries()).map(([userId, data]) => ({
    userId,
    displayName: data.displayName,
    score: data.score,
    position: 0,
    crewId
  }));
  
  // Sort based on score direction
  leaderboard.sort((a, b) => lowerScoreIsBetter ? a.score - b.score : b.score - a.score);
  
  // Handle ties
  let currentPosition = 1;
  let currentScore = leaderboard[0]?.score;
  let tiedCount = 0;
  
  leaderboard.forEach((entry, index) => {
    if (entry.score === currentScore) {
      tiedCount++;
    } else {
      currentPosition += tiedCount;
      tiedCount = 1;
      currentScore = entry.score;
    }
    
    entry.position = currentPosition;
    if (tiedCount > 1) {
      entry.tiedWith = tiedCount;
    }
  });
  
  return leaderboard;
};

// Date utilities
export const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Validation functions
export const validateSubmission = (
  challengeId: number,
  data: any
): { isValid: boolean; error?: string } => {
  switch (challengeId) {
    case CHALLENGE_TYPES.CARBON_FOOTPRINT:
      if (!data.trips?.length) {
        return { isValid: false, error: 'Please add at least one trip' };
      }
      break;
    case CHALLENGE_TYPES.RECYCLING:
      if (!data.totalItems) {
        return { isValid: false, error: 'Please add at least one recycling item' };
      }
      break;
    case CHALLENGE_TYPES.FOOD_CARBON:
      if (!data.items?.length) {
        return { isValid: false, error: 'Please add at least one food item' };
      }
      break;
    case CHALLENGE_TYPES.SHOWER_TIMER:
      if (!data.skipped && !data.duration) {
        return { isValid: false, error: 'Please record a shower time or mark as skipped' };
      }
      break;
  }
  return { isValid: true };
};

// Cache management
export const cacheKey = {
  leaderboard: (crewId: string) => `leaderboard_${crewId}`,
  challenges: (crewId: string) => `challenges_${crewId}`,
  submissions: (userId: string) => `submissions_${userId}`
};

// Rate limiting
export const rateLimiter = {
  submissions: new Map<string, number[]>(),
  
  canSubmit: (userId: string, challengeId: number): boolean => {
    const key = `${userId}_${challengeId}`;
    const now = Date.now();
    const submissions = rateLimiter.submissions.get(key) || [];
    
    // Remove submissions older than 1 minute
    const recentSubmissions = submissions.filter(time => now - time < 60000);
    rateLimiter.submissions.set(key, recentSubmissions);
    
    // Allow max 5 submissions per minute
    return recentSubmissions.length < 5;
  },
  
  recordSubmission: (userId: string, challengeId: number) => {
    const key = `${userId}_${challengeId}`;
    const submissions = rateLimiter.submissions.get(key) || [];
    submissions.push(Date.now());
    rateLimiter.submissions.set(key, submissions);
  }
};

// Error handling
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR');
  }
  
  return new AppError('An unexpected error occurred', 'UNKNOWN_ERROR');
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes} min`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

export const formatDistance = (kilometers: number): string => {
  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)}m`;
  }
  return `${kilometers.toFixed(1)}km`;
};

export const formatCarbonFootprint = (kilograms: number): string => {
  if (kilograms < 1) {
    return `${Math.round(kilograms * 1000)}g`;
  }
  return `${kilograms.toFixed(1)}kg`;
};

export const calculateCrewScore = (crew: Crew): number => {
  if (!crew.challenges) {
    return 0;
  }
  
  return crew.challenges.reduce((total, challengeId) => {
    // This would need to be implemented with actual challenge data
    return total + 0;
  }, 0);
};

export const calculateUserScore = (user: UserProfile): number => {
  // This would need to be implemented with actual user data
  return 0;
};

export const isChallengeActive = (challenge: Challenge): boolean => {
  const now = new Date();
  return (
    challenge.status === 'active' &&
    challenge.startDate <= now &&
    challenge.endDate >= now
  );
};

export const getChallengeProgress = (challenge: Challenge): number => {
  if (challenge.status !== 'active') {
    return 100;
  }

  const now = new Date();
  const total = challenge.endDate.getTime() - challenge.startDate.getTime();
  const elapsed = now.getTime() - challenge.startDate.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
};

export const getChallengeStatus = (challenge: Challenge): string => {
  if (challenge.status !== 'active') {
    return 'Completed';
  }

  const now = new Date();
  if (now < challenge.startDate) {
    return 'Upcoming';
  }
  if (now > challenge.endDate) {
    return 'Expired';
  }
  return 'Active';
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

export const validateDisplayName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 50;
};

export const validateCrewName = (name: string): boolean => {
  return name.length >= 3 && name.length <= 50;
};

export const validateCrewDescription = (description: string): boolean => {
  return description.length >= 10 && description.length <= 500;
};

export const validateChallengeName = (name: string): boolean => {
  return name.length >= 3 && name.length <= 100;
};

export const validateChallengeDescription = (description: string): boolean => {
  return description.length >= 10 && description.length <= 1000;
}; 