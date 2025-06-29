export interface User {
  id: string;
  displayName: string;
  email: string;
  crewId?: string;
  totalScore: number;
  level: number;
  achievements: Achievement[];
  avatarUrl?: string;
  isCrewManager?: boolean;
}

export interface UserProfile extends User {
  totalScore: number;
  level: number;
  levelProgress: number;
  achievements: Achievement[];
  submissionsCount: number;
  averageScore: number;
  bestScore: number;
  lastSubmission: Date | null;
  isCrewManager: boolean;
  createdAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: 'carbon' | 'food' | 'recycling' | 'shower';
  crewId: string;
  participants: string[];
  submissions: ChallengeSubmission[];
  status: 'active' | 'completed' | 'cancelled';
  duration: number;
  lowerScoreIsBetter: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: string;
  score: number;
  timestamp: Date;
  type: 'carbon' | 'food' | 'recycling' | 'shower';
  details: {
    distance?: number;
    transportMode?: string;
    foodItems?: FoodItem[];
    recyclingItems?: RecyclingItem[];
    showerDuration?: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  position: number;
  crewId: string;
  achievements?: string[];
  tiedWith?: number;
  crewName?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface CarbonFootprintSubmission {
  id: string;
  userId: string;
  challengeId: string;
  crewId: string;
  date: Date;
  startLocation: string;
  endLocation: string;
  distance: number;
  transportType: 'car' | 'public' | 'bike' | 'walk';
  route?: any;
  score: number;
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  carbonFootprint: number;
  type: string;
}

export interface FoodCarbonSubmission {
  id: string;
  userId: string;
  challengeId: string;
  crewId: string;
  date: Date;
  foodItems: FoodItem[];
  totalCarbonFootprint: number;
  score: number;
}

export interface RecyclingSubmission {
  id: string;
  userId: string;
  challengeId: string;
  crewId: string;
  date: Date;
  category: string;
  quantity: number;
  score: number;
}

export interface ShowerTimerSubmission {
  id: string;
  userId: string;
  challengeId: string;
  crewId: string;
  date: Date;
  duration: number;
  score: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  limit: number;
}

export interface AppError {
  message: string;
  code?: string;
}

export interface TripSubmission {
  startLocation: string;
  endLocation: string;
  distance: number;
  carbonFootprint: number;
  transportMode: string;
  date: Date;
}

export interface ShowerSubmission {
  duration: number;
  carbonFootprint: number;
  date: Date;
}

export interface Crew {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  members: string[];
  createdAt: Date;
  updatedAt?: Date;
  joinCode?: string;
  score?: number;
  challenges?: string[];
}

export interface ChallengeData {
  type: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  crewId: string;
  isActive: boolean;
  lowerScoreIsBetter: boolean;
}

export interface CacheData {
  key: string;
  data: any;
  timestamp: number;
}

export interface Trip {
  type: string;
  distance: number;
  carModel?: string;
  startLocation?: {
    address: string;
    lat: number;
    lng: number;
  };
  endLocation?: {
    address: string;
    lat: number;
    lng: number;
  };
  routeDetails?: {
    distance: number;
    duration: number;
    trafficLevel?: string;
    alternativeRoutes?: {
      distance: number;
      duration: number;
      trafficLevel?: string;
    }[];
  };
  co2Emission?: number; // in grams
}

export interface RecyclingItem {
  type: string;
  quantity: number;
}

export interface ShowerData {
  duration: number;
}

export interface AppContextType {
  getUserCrews: () => Promise<Crew[]>;
  getActiveChallenges: () => Promise<Challenge[]>;
  getCrew: (crewId: string) => Promise<Crew>;
  getCrewMembers: (crewId: string) => Promise<UserProfile[]>;
  removeMember: (crewId: string, memberId: string) => Promise<void>;
  transferLeadership: (crewId: string, newLeaderId: string) => Promise<void>;
  submitCarbonFootprint: (submission: CarbonFootprintSubmission) => Promise<void>;
  submitFoodCarbon: (submission: FoodCarbonSubmission) => Promise<void>;
  submitRecycling: (submission: RecyclingSubmission) => Promise<void>;
  submitShowerTimer: (submission: ShowerTimerSubmission) => Promise<void>;
  createCrew: (name: string) => Promise<void>;
  createChallenge: (challenge: Omit<Challenge, 'id'>) => Promise<void>;
  userCrew: Crew | null;
}

export interface VehicleEmissionData {
  make: string;
  model: string;
  year: number;
  fuelType: 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'PLUGIN_HYBRID';
  vehicleClass: 'Compact' | 'Midsize' | 'Large' | 'SUV' | 'Pickup Truck' | 'Van';
  emissionFactor: number;
} 