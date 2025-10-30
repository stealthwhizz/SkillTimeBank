export interface LeaderboardEntry {
  userId: string;
  username: string;
  rank: number;
  score: number;
  category: LeaderboardCategory;
  period: LeaderboardPeriod;
  metadata?: Record<string, any>;
}

export enum LeaderboardCategory {
  TOP_HELPERS = 'top_helpers', // Most completed gigs
  FASTEST_RESPONDERS = 'fastest_responders', // Fastest avg response time
  DIVERSE_SKILLERS = 'diverse_skillers', // Most unique skill categories
  WEEKLY_CHAMPIONS = 'weekly_champions' // Weekly top performer
}

export enum LeaderboardPeriod {
  WEEKLY = 'weekly',
  SEASONAL = 'seasonal', // 3 months
  ALL_TIME = 'all_time'
}

export interface UserStats {
  userId: string;
  completedGigs: number;
  averageResponseTime: number; // in minutes
  uniqueCategories: string[];
  weeklyCompletions: number;
  seasonalCompletions: number;
  lastActivityAt: Date;
}

export interface CommunityAnalytics {
  totalGigsCompleted: number;
  activeParticipants: number;
  averageTimeToMatch: number; // in minutes
  gigsByCategory: Record<string, number>;
  newUsersThisWeek: number;
  weekStartDate: Date;
  weekEndDate: Date;
}
