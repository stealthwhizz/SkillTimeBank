import { useState } from '@devvit/public-api';
import { User } from '../types/user.js';
import { Gig } from '../types/gig.js';
import { Transaction } from '../types/transaction.js';
import { WeeklyEvent } from '../types/event.js';
import { LeaderboardEntry, UserStats, CommunityAnalytics } from '../types/leaderboard.js';
import { ModerationAction, Dispute, UserModerationStatus } from '../types/moderation.js';

export interface TimebankState {
  users: Record<string, User>;
  gigs: Record<string, Gig>;
  transactions: Record<string, Transaction>;
  weeklyEvents: Record<string, WeeklyEvent>;
  leaderboards: Record<string, LeaderboardEntry[]>;
  userStats: Record<string, UserStats>;
  communityAnalytics?: CommunityAnalytics;
  moderationActions: Record<string, ModerationAction>;
  disputes: Record<string, Dispute>;
  userModerationStatus: Record<string, UserModerationStatus>;
  currentUser?: string;
}

const initialState: TimebankState = {
  users: {},
  gigs: {},
  transactions: {},
  weeklyEvents: {},
  leaderboards: {},
  userStats: {},
  moderationActions: {},
  disputes: {},
  userModerationStatus: {},
  currentUser: undefined
};

export const TIMEBANK_STATE_KEY = 'timebank:state';

export function getInitialState(): TimebankState {
  return initialState;
}

// Hook for components to use timebank state
// Note: Devvit's useState doesn't support complex objects well in v0.12.1
// Components should use Redis directly for persistent state
// Simple in-memory cache of state within the app session
let cachedState: TimebankState = initialState;

export function useTimebankState(): [TimebankState, (state: TimebankState) => void] {
  // Local rerender trigger; we store state in a module-level cache so all
  // components see the same object within this session.
  const [, forceUpdate] = useState(0);
  return [
    cachedState,
    (state: TimebankState) => {
      cachedState = state;
      // Trigger rerender for the calling component
      forceUpdate((n: number) => n + 1);
    }
  ];
}

export async function saveState(state: TimebankState, context: any) {
  try {
    // Keep cache in sync
    cachedState = state;
    await context.redis.set(TIMEBANK_STATE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Failed to save timebank state:', error);
    return false;
  }
}

export async function loadState(context: any): Promise<TimebankState> {
  try {
    const saved = await context.redis.get(TIMEBANK_STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      cachedState = parsed;
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load timebank state:', error);
  }
  cachedState = initialState;
  return cachedState;
}

// Helper functions for state management
export function addUser(state: TimebankState, user: User): TimebankState {
  return {
    ...state,
    users: {
      ...state.users,
      [user.id]: user
    }
  };
}

export function addGig(state: TimebankState, gig: Gig): TimebankState {
  return {
    ...state,
    gigs: {
      ...state.gigs,
      [gig.id]: gig
    }
  };
}

export function addTransaction(state: TimebankState, transaction: Transaction): TimebankState {
  return {
    ...state,
    transactions: {
      ...state.transactions,
      [transaction.id]: transaction
    }
  };
}