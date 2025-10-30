import { LeaderboardEntry, LeaderboardCategory, LeaderboardPeriod, UserStats, CommunityAnalytics } from '../types/leaderboard.js';
import { TimebankState } from '../state/timebank.js';
import { GigStatus, GigCategory } from '../types/gig.js';

export class LeaderboardService {
  
  static updateUserStats(
    state: TimebankState,
    userId: string,
    gigId: string
  ): { success: boolean; newState?: TimebankState; error?: string } {
    try {
      const gig = state.gigs[gigId];
      const user = state.users[userId];
      
      if (!gig || !user) {
        return { success: false, error: 'Gig or user not found' };
      }

      const currentStats = state.userStats[userId] || {
        userId,
        completedGigs: 0,
        averageResponseTime: 0,
        uniqueCategories: [],
        weeklyCompletions: 0,
        seasonalCompletions: 0,
        lastActivityAt: new Date()
      };

      // Update completion counts
      const updatedStats: UserStats = {
        ...currentStats,
        completedGigs: currentStats.completedGigs + 1,
        weeklyCompletions: currentStats.weeklyCompletions + 1,
        seasonalCompletions: currentStats.seasonalCompletions + 1,
        lastActivityAt: new Date()
      };

      // Update unique categories
      if (!currentStats.uniqueCategories.includes(gig.category)) {
        updatedStats.uniqueCategories = [...currentStats.uniqueCategories, gig.category];
      }

      // Update response time if user accepted the gig
      if (gig.assignedTo === userId && gig.createdAt) {
        const responseTime = this.calculateResponseTime(gig.createdAt, new Date());
        updatedStats.averageResponseTime = this.updateAverageResponseTime(
          currentStats.averageResponseTime,
          responseTime,
          currentStats.completedGigs
        );
      }

      const newState: TimebankState = {
        ...state,
        userStats: {
          ...state.userStats,
          [userId]: updatedStats
        }
      };

      return { success: true, newState };
    } catch (error) {
      return { success: false, error: 'Failed to update user stats' };
    }
  }

  static getLeaderboard(
    state: TimebankState,
    category: LeaderboardCategory,
    period: LeaderboardPeriod,
    limit: number = 10
  ): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];
    
    Object.values(state.userStats).forEach(stats => {
      const user = state.users[stats.userId];
      if (!user) return;

      let score = 0;
      let metadata: Record<string, any> = {};

      switch (category) {
        case LeaderboardCategory.TOP_HELPERS:
          score = period === LeaderboardPeriod.WEEKLY ? stats.weeklyCompletions :
                  period === LeaderboardPeriod.SEASONAL ? stats.seasonalCompletions :
                  stats.completedGigs;
          metadata = { completedGigs: score };
          break;

        case LeaderboardCategory.FASTEST_RESPONDERS:
          // Only rank users with at least 3 completed gigs
          if (stats.completedGigs < 3) return;
          score = stats.averageResponseTime;
          metadata = { avgResponseMinutes: Math.round(score) };
          break;

        case LeaderboardCategory.DIVERSE_SKILLERS:
          score = stats.uniqueCategories.length;
          metadata = { uniqueCategories: stats.uniqueCategories };
          break;
      }

      entries.push({
        userId: stats.userId,
        username: user.username,
        rank: 0, // Will be set after sorting
        score,
        category,
        period,
        metadata
      });
    });

    // Sort and assign ranks
    if (category === LeaderboardCategory.FASTEST_RESPONDERS) {
      // Lower is better for response time
      entries.sort((a, b) => a.score - b.score);
    } else {
      // Higher is better for others
      entries.sort((a, b) => b.score - a.score);
    }

    // Assign ranks and limit results
    return entries.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }

  static getCommunityAnalytics(state: TimebankState): CommunityAnalytics {
    const now = new Date();
    const weekStart = this.getStartOfWeek(now);
    const weekEnd = this.getEndOfWeek(now);

    const weeklyGigs = Object.values(state.gigs).filter(
      gig => new Date(gig.completedAt || 0) >= weekStart && 
             new Date(gig.completedAt || 0) <= weekEnd &&
             gig.status === GigStatus.COMPLETED
    );

    const weeklyUsers = new Set(
      Object.values(state.userStats)
        .filter(stats => stats.weeklyCompletions > 0)
        .map(stats => stats.userId)
    );

    const gigsByCategory: Record<string, number> = {};
    Object.values(GigCategory).forEach(cat => {
      gigsByCategory[cat] = weeklyGigs.filter(g => g.category === cat).length;
    });

    // Calculate average time to match
    const matchedGigs = weeklyGigs.filter(g => g.assignedTo && g.createdAt);
    const avgTimeToMatch = matchedGigs.length > 0
      ? matchedGigs.reduce((sum, gig) => {
          const matchTime = this.calculateResponseTime(gig.createdAt, new Date(gig.completedAt!));
          return sum + matchTime;
        }, 0) / matchedGigs.length
      : 0;

    const newUsersThisWeek = Object.values(state.users).filter(
      user => new Date(user.joinedAt) >= weekStart && new Date(user.joinedAt) <= weekEnd
    ).length;

    return {
      totalGigsCompleted: weeklyGigs.length,
      activeParticipants: weeklyUsers.size,
      averageTimeToMatch: Math.round(avgTimeToMatch),
      gigsByCategory,
      newUsersThisWeek,
      weekStartDate: weekStart,
      weekEndDate: weekEnd
    };
  }

  static resetWeeklyStats(state: TimebankState): { success: boolean; newState?: TimebankState } {
    try {
      const updatedUserStats: Record<string, UserStats> = {};
      
      Object.entries(state.userStats).forEach(([userId, stats]) => {
        updatedUserStats[userId] = {
          ...stats,
          weeklyCompletions: 0
        };
      });

      return {
        success: true,
        newState: {
          ...state,
          userStats: updatedUserStats
        }
      };
    } catch (error) {
      return { success: false };
    }
  }

  static resetSeasonalStats(state: TimebankState): { success: boolean; newState?: TimebankState } {
    try {
      const updatedUserStats: Record<string, UserStats> = {};
      
      Object.entries(state.userStats).forEach(([userId, stats]) => {
        updatedUserStats[userId] = {
          ...stats,
          seasonalCompletions: 0,
          weeklyCompletions: 0
        };
      });

      return {
        success: true,
        newState: {
          ...state,
          userStats: updatedUserStats
        }
      };
    } catch (error) {
      return { success: false };
    }
  }

  private static calculateResponseTime(startDate: Date, endDate: Date): number {
    return (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60); // minutes
  }

  private static updateAverageResponseTime(
    currentAvg: number,
    newTime: number,
    count: number
  ): number {
    return (currentAvg * count + newTime) / (count + 1);
  }

  private static getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private static getEndOfWeek(date: Date): Date {
    const start = this.getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }
}
