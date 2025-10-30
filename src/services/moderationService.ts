import { 
  ModerationAction, 
  ModActionType, 
  Dispute, 
  DisputeStatus, 
  DisputeResolution,
  DisputeOutcome,
  UserModerationStatus,
  TrustLevel 
} from '../types/moderation.js';
import { TimebankState } from '../state/timebank.js';
import { TransactionType, TransactionStatus, Transaction } from '../types/transaction.js';

export class ModerationService {
  private static readonly RATE_LIMIT_WINDOW = 3600000; // 1 hour in ms
  private static readonly DEFAULT_RATE_LIMIT = 5; // 5 gigs per hour

  static freezeUser(
    state: TimebankState,
    targetUserId: string,
    moderatorId: string,
    moderatorUsername: string,
    reason: string
  ): { success: boolean; newState?: TimebankState; error?: string } {
    try {
      const targetUser = state.users[targetUserId];
      if (!targetUser) {
        return { success: false, error: 'User not found' };
      }

      const actionId = `mod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const action: ModerationAction = {
        id: actionId,
        type: ModActionType.FREEZE_USER,
        moderatorId,
        moderatorUsername,
        targetUserId,
        reason,
        createdAt: new Date()
      };

      const modStatus: UserModerationStatus = {
        userId: targetUserId,
        isFrozen: true,
        freezeReason: reason,
        frozenAt: new Date(),
        frozenBy: moderatorId,
        trustLevel: this.calculateTrustLevel(targetUser.reputation),
        reputation: targetUser.reputation
      };

      const newState: TimebankState = {
        ...state,
        moderationActions: {
          ...state.moderationActions,
          [actionId]: action
        },
        userModerationStatus: {
          ...state.userModerationStatus,
          [targetUserId]: modStatus
        }
      };

      return { success: true, newState };
    } catch (error) {
      return { success: false, error: 'Failed to freeze user' };
    }
  }

  static unfreezeUser(
    state: TimebankState,
    targetUserId: string,
    moderatorId: string,
    moderatorUsername: string,
    reason: string
  ): { success: boolean; newState?: TimebankState; error?: string } {
    try {
      const actionId = `mod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const action: ModerationAction = {
        id: actionId,
        type: ModActionType.UNFREEZE_USER,
        moderatorId,
        moderatorUsername,
        targetUserId,
        reason,
        createdAt: new Date()
      };

      const existingStatus = state.userModerationStatus[targetUserId];
      const modStatus: UserModerationStatus = {
        ...existingStatus,
        userId: targetUserId,
        isFrozen: false,
        freezeReason: undefined,
        frozenAt: undefined,
        frozenBy: undefined,
        trustLevel: existingStatus?.trustLevel || TrustLevel.NEW,
        reputation: existingStatus?.reputation || 0
      };

      const newState: TimebankState = {
        ...state,
        moderationActions: {
          ...state.moderationActions,
          [actionId]: action
        },
        userModerationStatus: {
          ...state.userModerationStatus,
          [targetUserId]: modStatus
        }
      };

      return { success: true, newState };
    } catch (error) {
      return { success: false, error: 'Failed to unfreeze user' };
    }
  }

  static openDispute(
    state: TimebankState,
    gigId: string,
    initiatorId: string,
    reason: string,
    evidence: string
  ): { success: boolean; disputeId?: string; newState?: TimebankState; error?: string } {
    try {
      const gig = state.gigs[gigId];
      if (!gig || !gig.completedAt) {
        return { success: false, error: 'Gig not found or not completed' };
      }

      // Check if dispute opened within 24 hours
      const hoursSinceCompletion = 
        (new Date().getTime() - new Date(gig.completedAt).getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCompletion > 24) {
        return { success: false, error: 'Dispute window (24 hours) has passed' };
      }

      const respondentId = initiatorId === gig.createdBy ? gig.assignedTo! : gig.createdBy;

      const disputeId = `dispute_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const dispute: Dispute = {
        id: disputeId,
        gigId,
        initiatorId,
        respondentId,
        reason,
        evidence,
        status: DisputeStatus.OPEN,
        escrowAmount: gig.timeCreditsOffered,
        createdAt: new Date()
      };

      const newState: TimebankState = {
        ...state,
        disputes: {
          ...state.disputes,
          [disputeId]: dispute
        }
      };

      return { success: true, disputeId, newState };
    } catch (error) {
      return { success: false, error: 'Failed to open dispute' };
    }
  }

  static resolveDispute(
    state: TimebankState,
    disputeId: string,
    resolverId: string,
    resolverUsername: string,
    outcome: DisputeOutcome,
    resolutionReason: string
  ): { success: boolean; newState?: TimebankState; error?: string } {
    try {
      const dispute = state.disputes[disputeId];
      if (!dispute) {
        return { success: false, error: 'Dispute not found' };
      }

      if (dispute.status !== DisputeStatus.OPEN) {
        return { success: false, error: 'Dispute already resolved' };
      }

      // Calculate credit allocation based on outcome
      let creditAllocation: { userId: string; amount: number }[] = [];
      
      switch (outcome) {
        case DisputeOutcome.FAVOR_INITIATOR:
          creditAllocation = [{ userId: dispute.initiatorId, amount: dispute.escrowAmount }];
          break;
        case DisputeOutcome.FAVOR_RESPONDENT:
          creditAllocation = [{ userId: dispute.respondentId, amount: dispute.escrowAmount }];
          break;
        case DisputeOutcome.SPLIT:
          const halfAmount = Math.floor(dispute.escrowAmount / 2);
          creditAllocation = [
            { userId: dispute.initiatorId, amount: halfAmount },
            { userId: dispute.respondentId, amount: dispute.escrowAmount - halfAmount }
          ];
          break;
        case DisputeOutcome.DISMISSED:
          creditAllocation = [];
          break;
      }

      const resolution: DisputeResolution = {
        resolverId,
        resolverUsername,
        outcome,
        creditAllocation,
        reason: resolutionReason,
        resolvedAt: new Date()
      };

      const updatedDispute: Dispute = {
        ...dispute,
        status: DisputeStatus.RESOLVED,
        resolvedAt: new Date(),
        resolutionDetails: resolution
      };

      // Create moderation action log
      const actionId = `mod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const action: ModerationAction = {
        id: actionId,
        type: ModActionType.RESOLVE_DISPUTE,
        moderatorId: resolverId,
        moderatorUsername: resolverUsername,
        targetGigId: dispute.gigId,
        reason: resolutionReason,
        details: { outcome, creditAllocation },
        createdAt: new Date()
      };

      let newState: TimebankState = {
        ...state,
        disputes: {
          ...state.disputes,
          [disputeId]: updatedDispute
        },
        moderationActions: {
          ...state.moderationActions,
          [actionId]: action
        }
      };

      // Apply credit allocations
      if (creditAllocation.length > 0) {
        const users = { ...newState.users };
        const transactions = { ...newState.transactions };

        creditAllocation.forEach(allocation => {
          const user = users[allocation.userId];
          if (user) {
            users[allocation.userId] = {
              ...user,
              timeCredits: user.timeCredits + allocation.amount
            };

            // Create transaction record
            const txId = `tx_dispute_${disputeId}_${allocation.userId}`;
            transactions[txId] = {
              id: txId,
              fromUserId: 'system',
              toUserId: allocation.userId,
              gigId: dispute.gigId,
              amount: allocation.amount,
              type: TransactionType.DISPUTE_REFUND,
              status: TransactionStatus.COMPLETED,
              createdAt: new Date(),
              completedAt: new Date(),
              description: `Dispute resolution: ${outcome}`
            };
          }
        });

        newState = {
          ...newState,
          users,
          transactions
        };
      }

      return { success: true, newState };
    } catch (error) {
      return { success: false, error: 'Failed to resolve dispute' };
    }
  }

  static checkRateLimit(
    state: TimebankState,
    userId: string,
    actionType: string = 'post_gig'
  ): { allowed: boolean; remainingCount?: number; resetAt?: Date } {
    const modStatus = state.userModerationStatus[userId];
    const user = state.users[userId];
    
    if (!user) {
      return { allowed: false };
    }

    // Frozen users cannot perform actions
    if (modStatus?.isFrozen) {
      return { allowed: false };
    }

    // Trusted users get higher limits
    const trustLevel = modStatus?.trustLevel || this.calculateTrustLevel(user.reputation);
    const limit = trustLevel === TrustLevel.VETERAN ? 10 : 
                 trustLevel === TrustLevel.TRUSTED ? 7 : 
                 this.DEFAULT_RATE_LIMIT;

    // For now, return allowed (full rate limiting would require Redis)
    return { allowed: true, remainingCount: limit };
  }

  private static calculateTrustLevel(reputation: number): TrustLevel {
    if (reputation >= 51) return TrustLevel.VETERAN;
    if (reputation >= 11) return TrustLevel.TRUSTED;
    return TrustLevel.NEW;
  }

  static getOpenDisputes(state: TimebankState): Dispute[] {
    return Object.values(state.disputes).filter(d => d.status === DisputeStatus.OPEN);
  }

  static getFrozenUsers(state: TimebankState): UserModerationStatus[] {
    return Object.values(state.userModerationStatus).filter(s => s.isFrozen);
  }
}
