export interface WeeklyEvent {
  id: string;
  title: string;
  description: string;
  theme: EventTheme;
  status: EventStatus;
  goalAmount: number; // Number of gigs to complete
  currentProgress: number; // Number of gigs completed
  rewardPerParticipant: number; // Time credits awarded
  startDate: Date;
  endDate: Date;
  participants: string[]; // User IDs who contributed
  createdAt: Date;
  completedAt?: Date;
}

export enum EventTheme {
  TECH = 'tech',
  CREATIVE = 'creative',
  EDUCATION = 'education',
  CARE = 'care',
  MIXED = 'mixed'
}

export enum EventStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired'
}

export interface EventParticipation {
  userId: string;
  eventId: string;
  contributionCount: number;
  rewardReceived: boolean;
  firstContributionAt: Date;
}
