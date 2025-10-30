export interface Gig {
  id: string;
  title: string;
  description: string;
  category: GigCategory;
  type: GigType;
  timeCreditsOffered: number;
  estimatedDuration: number; // in minutes
  requiredSkills: string[];
  location?: string;
  isRemote: boolean;
  createdBy: string;
  createdAt: Date;
  status: GigStatus;
  assignedTo?: string;
  completedAt?: Date;
  rating?: number;
  feedback?: string;
}

export enum GigType {
  OFFER_HELP = 'offer_help',
  FIND_HELP = 'find_help'
}

export enum GigCategory {
  TECH = 'tech',
  CREATIVE = 'creative',
  EDUCATION = 'education',
  HOUSEHOLD = 'household',
  TRANSPORTATION = 'transportation',
  CARE = 'care',
  OTHER = 'other'
}

export enum GigStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  AWAITING_CONFIRMATION = 'awaiting_confirmation',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}