import { User } from '../types/user.js';
import { Transaction, TransactionType, TransactionStatus } from '../types/transaction.js';
import { TimebankState } from '../state/timebank.js';

export class UserService {
  static SIGNUP_BONUS_AMOUNT = 1;
  static SYSTEM_USER_ID = 'system';

  static async registerUser(
    state: TimebankState,
    context: any
  ): Promise<{ success: boolean; user?: User; newState?: TimebankState; error?: string }> {
    try {
      const currentUser = await context.reddit.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Unable to get current user' };
      }

      const userId = currentUser.id;
      
      // Check if user already exists
      if (state.users[userId]) {
        return { success: true, user: state.users[userId], newState: state };
      }

      // Create new user with signup bonus
      const newUser: User = {
        id: userId,
        username: currentUser.username || 'Anonymous',
        timeCredits: this.SIGNUP_BONUS_AMOUNT,
        reputation: 0,
        skills: [],
        joinedAt: new Date(),
        isActive: true
      };

      // Create signup bonus transaction
      const transactionId = `tx_signup_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const signupTransaction: Transaction = {
        id: transactionId,
        fromUserId: this.SYSTEM_USER_ID,
        toUserId: userId,
        gigId: '', // No associated gig
        amount: this.SIGNUP_BONUS_AMOUNT,
        type: TransactionType.SIGNUP_BONUS,
        status: TransactionStatus.COMPLETED,
        createdAt: new Date(),
        completedAt: new Date(),
        description: 'Welcome bonus for joining TimeBank!'
      };

      // Ensure system user exists
      const systemUser: User = state.users[this.SYSTEM_USER_ID] || {
        id: this.SYSTEM_USER_ID,
        username: 'System',
        timeCredits: Number.MAX_SAFE_INTEGER, // Infinite credits for system
        reputation: 0,
        skills: [],
        joinedAt: new Date(),
        isActive: true
      };

      const newState: TimebankState = {
        ...state,
        users: {
          ...state.users,
          [this.SYSTEM_USER_ID]: systemUser,
          [userId]: newUser
        },
        transactions: {
          ...state.transactions,
          [transactionId]: signupTransaction
        },
        currentUser: userId
      };

      return { success: true, user: newUser, newState };
    } catch (error) {
      return { success: false, error: 'Failed to register user' };
    }
  }

  static async ensureUserRegistered(
    state: TimebankState,
    context: any
  ): Promise<{ success: boolean; userId?: string; newState?: TimebankState; error?: string }> {
    try {
      const currentUser = await context.reddit.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Unable to get current user' };
      }

      const userId = currentUser.id;

      // If user already exists, just update current user
      if (state.users[userId]) {
        const newState = {
          ...state,
          currentUser: userId
        };
        return { success: true, userId, newState };
      }

      // Register new user
      const registrationResult = await this.registerUser(state, context);
      if (registrationResult.success && registrationResult.newState) {
        return { 
          success: true, 
          userId, 
          newState: registrationResult.newState 
        };
      }

      return { success: false, error: registrationResult.error };
    } catch (error) {
      return { success: false, error: 'Failed to ensure user registration' };
    }
  }

  static getUserTransactions(state: TimebankState, userId: string): Transaction[] {
    return Object.values(state.transactions)
      .filter(tx => tx.fromUserId === userId || tx.toUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}