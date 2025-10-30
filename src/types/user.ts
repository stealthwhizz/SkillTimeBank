export interface User {
  id: string;
  username: string;
  timeCredits: number;
  reputation: number;
  skills: string[];
  location?: string;
  joinedAt: Date;
  isActive: boolean;
}

export interface UserProfile extends User {
  bio?: string;
  avatar?: string;
  completedGigs: number;
  averageRating: number;
}