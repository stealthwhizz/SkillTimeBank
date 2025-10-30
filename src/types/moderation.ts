export interface ModerationAction {
  id: string;
  type: ModActionType;
  moderatorId: string;
  moderatorUsername: string;
  targetUserId?: string;
  targetGigId?: string;
  targetTransactionId?: string;
  reason: string;
  details?: Record<string, any>;
  createdAt: Date;
}

export enum ModActionType {
  FREEZE_USER = 'freeze_user',
  UNFREEZE_USER = 'unfreeze_user',
  AWARD_CREDITS = 'award_credits',
  REVERSE_TRANSACTION = 'reverse_transaction',
  RESOLVE_DISPUTE = 'resolve_dispute',
  ADJUST_RATE_LIMIT = 'adjust_rate_limit',
  FLAG_FRAUD = 'flag_fraud'
}

export interface Dispute {
  id: string;
  gigId: string;
  initiatorId: string;
  respondentId: string;
  reason: string;
  evidence: string;
  status: DisputeStatus;
  escrowAmount: number;
  createdAt: Date;
  resolvedAt?: Date;
  resolutionDetails?: DisputeResolution;
}

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface DisputeResolution {
  resolverId: string;
  resolverUsername: string;
  outcome: DisputeOutcome;
  creditAllocation: { userId: string; amount: number }[];
  reason: string;
  resolvedAt: Date;
}

export enum DisputeOutcome {
  FAVOR_INITIATOR = 'favor_initiator',
  FAVOR_RESPONDENT = 'favor_respondent',
  SPLIT = 'split',
  DISMISSED = 'dismissed'
}

export interface RateLimit {
  userId: string;
  actionType: string;
  count: number;
  windowStart: Date;
  windowEnd: Date;
}

export interface UserModerationStatus {
  userId: string;
  isFrozen: boolean;
  freezeReason?: string;
  frozenAt?: Date;
  frozenBy?: string;
  trustLevel: TrustLevel;
  reputation: number;
}

export enum TrustLevel {
  NEW = 'new', // 0-10 reputation
  TRUSTED = 'trusted', // 11-50 reputation
  VETERAN = 'veteran' // 51+ reputation
}
