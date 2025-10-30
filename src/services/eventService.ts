import { WeeklyEvent, EventTheme, EventStatus, EventParticipation } from '../types/event.js';
import { TransactionType, TransactionStatus, Transaction } from '../types/transaction.js';
import { TimebankState } from '../state/timebank.js';

export class EventService {
  private static THEMES_ROTATION: EventTheme[] = [
    EventTheme.TECH,
    EventTheme.CREATIVE,
    EventTheme.EDUCATION,
    EventTheme.CARE,
    EventTheme.MIXED
  ];

  static createWeeklyEvent(
    state: TimebankState,
    theme?: EventTheme,
    goalAmount?: number
  ): { success: boolean; event?: WeeklyEvent; newState?: TimebankState; error?: string } {
    try {
      const now = new Date();
      const startOfWeek = this.getStartOfWeek(now);
      const endOfWeek = this.getEndOfWeek(now);

      // Check if an active event already exists for this week
      const existingEvent = Object.values(state.weeklyEvents || {}).find(
        e => e.status === EventStatus.ACTIVE && 
        new Date(e.startDate).getTime() === startOfWeek.getTime()
      );

      if (existingEvent) {
        return { success: true, event: existingEvent, newState: state };
      }

      // Determine theme (rotate through themes or use provided)
      const selectedTheme = theme || this.getNextTheme(state);

      // Calculate goal based on community size
      const calculatedGoal = goalAmount || this.calculateGoalAmount(state);

      const eventId = `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newEvent: WeeklyEvent = {
        id: eventId,
        title: this.getEventTitle(selectedTheme),
        description: this.getEventDescription(selectedTheme),
        theme: selectedTheme,
        status: EventStatus.ACTIVE,
        goalAmount: calculatedGoal,
        currentProgress: 0,
        rewardPerParticipant: 2, // 2 TC per participant
        startDate: startOfWeek,
        endDate: endOfWeek,
        participants: [],
        createdAt: now
      };

      const newState: TimebankState = {
        ...state,
        weeklyEvents: {
          ...(state.weeklyEvents || {}),
          [eventId]: newEvent
        }
      };

      return { success: true, event: newEvent, newState };
    } catch (error) {
      return { success: false, error: 'Failed to create weekly event' };
    }
  }

  static recordGigCompletion(
    state: TimebankState,
    gigId: string,
    userId: string
  ): { success: boolean; newState?: TimebankState; rewardDistributed?: boolean; error?: string } {
    try {
      const activeEvent = this.getActiveEvent(state);
      if (!activeEvent) {
        return { success: true, newState: state }; // No active event, nothing to do
      }

      // Check if gig matches event theme (if not MIXED)
      const gig = state.gigs[gigId];
      if (!gig) {
        return { success: false, error: 'Gig not found' };
      }

      const matchesTheme = activeEvent.theme === EventTheme.MIXED || 
                          gig.category.toLowerCase() === activeEvent.theme.toLowerCase();

      if (!matchesTheme) {
        return { success: true, newState: state }; // Gig doesn't match theme
      }

      // Update event progress
      const updatedEvent: WeeklyEvent = {
        ...activeEvent,
        currentProgress: activeEvent.currentProgress + 1,
        participants: activeEvent.participants.includes(userId)
          ? activeEvent.participants
          : [...activeEvent.participants, userId]
      };

      // Check if goal is reached
      let rewardDistributed = false;
      if (updatedEvent.currentProgress >= updatedEvent.goalAmount && 
          activeEvent.status === EventStatus.ACTIVE) {
        updatedEvent.status = EventStatus.COMPLETED;
        updatedEvent.completedAt = new Date();
        rewardDistributed = true;
      }

      const newState: TimebankState = {
        ...state,
        weeklyEvents: {
          ...(state.weeklyEvents || {}),
          [activeEvent.id]: updatedEvent
        }
      };

      // Distribute rewards if goal reached
      if (rewardDistributed) {
        const rewardResult = this.distributeRewards(newState, activeEvent.id);
        if (rewardResult.success && rewardResult.newState) {
          return { success: true, newState: rewardResult.newState, rewardDistributed: true };
        }
      }

      return { success: true, newState, rewardDistributed: false };
    } catch (error) {
      return { success: false, error: 'Failed to record gig completion for event' };
    }
  }

  static distributeRewards(
    state: TimebankState,
    eventId: string
  ): { success: boolean; newState?: TimebankState; error?: string } {
    try {
      const event = (state.weeklyEvents || {})[eventId];
      if (!event || event.status !== EventStatus.COMPLETED) {
        return { success: false, error: 'Event not found or not completed' };
      }

      let newState = { ...state };
      const transactions: Record<string, Transaction> = { ...state.transactions };
      const users = { ...state.users };

      // Award credits to each participant
      event.participants.forEach(userId => {
        const user = users[userId];
        if (user) {
          users[userId] = {
            ...user,
            timeCredits: user.timeCredits + event.rewardPerParticipant
          };

          // Create transaction record
          const txId = `tx_event_${eventId}_${userId}_${Date.now()}`;
          transactions[txId] = {
            id: txId,
            fromUserId: 'system',
            toUserId: userId,
            gigId: '',
            amount: event.rewardPerParticipant,
            type: TransactionType.WEEKLY_EVENT_REWARD,
            status: TransactionStatus.COMPLETED,
            createdAt: new Date(),
            completedAt: new Date(),
            description: `Weekly Event Reward: ${event.title}`
          };
        }
      });

      newState.users = users;
      newState.transactions = transactions;

      return { success: true, newState };
    } catch (error) {
      return { success: false, error: 'Failed to distribute rewards' };
    }
  }

  static getActiveEvent(state: TimebankState): WeeklyEvent | undefined {
    const events = Object.values(state.weeklyEvents || {});
    return events.find(e => e.status === EventStatus.ACTIVE);
  }

  static expireOldEvents(state: TimebankState): { success: boolean; newState?: TimebankState } {
    try {
      const now = new Date();
      const events = { ...(state.weeklyEvents || {}) };
      let hasChanges = false;

      Object.values(events).forEach(event => {
        if (event.status === EventStatus.ACTIVE && new Date(event.endDate) < now) {
          events[event.id] = {
            ...event,
            status: EventStatus.EXPIRED
          };
          hasChanges = true;
        }
      });

      if (!hasChanges) {
        return { success: true, newState: state };
      }

      return {
        success: true,
        newState: {
          ...state,
          weeklyEvents: events
        }
      };
    } catch (error) {
      return { success: false };
    }
  }

  private static getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
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

  private static getNextTheme(state: TimebankState): EventTheme {
    const events = Object.values(state.weeklyEvents || {})
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (events.length === 0) {
      return EventTheme.TECH;
    }

    const lastTheme = events[0].theme;
    const currentIndex = this.THEMES_ROTATION.indexOf(lastTheme);
    return this.THEMES_ROTATION[(currentIndex + 1) % this.THEMES_ROTATION.length];
  }

  private static calculateGoalAmount(state: TimebankState): number {
    const userCount = Object.keys(state.users || {}).length;
    if (userCount < 10) return 5;
    if (userCount < 50) return 15;
    if (userCount < 100) return 30;
    return 50;
  }

  private static getEventTitle(theme: EventTheme): string {
    const titles: Record<EventTheme, string> = {
      [EventTheme.TECH]: '💻 Tech Week Sprint',
      [EventTheme.CREATIVE]: '🎨 Creative Week Sprint',
      [EventTheme.EDUCATION]: '📚 Learning Week Sprint',
      [EventTheme.CARE]: '💚 Care & Support Sprint',
      [EventTheme.MIXED]: '🌟 Community Sprint'
    };
    return titles[theme];
  }

  private static getEventDescription(theme: EventTheme): string {
    const descriptions: Record<EventTheme, string> = {
      [EventTheme.TECH]: 'Help the community with tech skills this week!',
      [EventTheme.CREATIVE]: 'Share your creative talents with the community!',
      [EventTheme.EDUCATION]: 'Teach and learn together this week!',
      [EventTheme.CARE]: 'Support community members with care and assistance!',
      [EventTheme.MIXED]: 'All skills welcome - let\'s help each other!'
    };
    return descriptions[theme];
  }
}
