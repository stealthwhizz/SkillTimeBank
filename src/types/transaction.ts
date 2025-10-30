export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  gigId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: Date;
  completedAt?: Date;
  description?: string;
}

export enum TransactionType {
  GIG_PAYMENT = 'gig_payment',
  SIGNUP_BONUS = 'signup_bonus',
  ADMIN_AWARD = 'admin_award',
  BONUS = 'bonus',
  PENALTY = 'penalty',
  REFUND = 'refund',
  WEEKLY_EVENT_REWARD = 'weekly_event_reward',
  DISPUTE_REFUND = 'dispute_refund',
  FRAUD_REVERSAL = 'fraud_reversal'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}