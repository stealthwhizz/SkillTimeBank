# Requirements Document

## Introduction

The Weekly Skill Swap Sprint system creates massively multiplayer community play loops through cooperative weekly events. Each week, the subreddit community works together to achieve collective goals (e.g., fulfill N gigs), tracks progress on a community-wide progress bar, earns time credit rewards, and participates in rotating themed challenges.

## Glossary

- **Weekly_Event**: A time-bound community challenge with cooperative goals
- **Skill_Swap_Sprint**: The weekly event format for the TimeBank
- **Progress_Bar**: Visual indicator showing subreddit-wide completion percentage
- **Event_Theme**: A rotating focus area (e.g., "Tech Week", "Creative Week")
- **Cooperative_Goal**: A target number of gigs to fulfill as a community
- **Event_Reward**: Time credits awarded to participants upon goal completion
- **Participant**: A user who contributed to the weekly event goals
- **Event_Status**: Current state (UPCOMING, ACTIVE, COMPLETED, EXPIRED)
- **Contribution_Tracking**: System for recording individual user participation

## Requirements

### Requirement 1

**User Story:** As a community member, I want to see active weekly events, so that I can participate in community challenges.

#### Acceptance Criteria

1. WHEN the app loads, THE Weekly_Event system SHALL display the current active event if one exists
2. THE Weekly_Event system SHALL show the event theme, goal description, and deadline
3. THE Weekly_Event system SHALL display a progress bar indicating community completion percentage
4. WHEN no active event exists, THE Weekly_Event system SHALL show the next upcoming event
5. THE Weekly_Event system SHALL display event countdown timer for active events

### Requirement 2

**User Story:** As a community member, I want my completed gigs to count toward weekly goals, so that I contribute to community progress.

#### Acceptance Criteria

1. WHEN a user completes a gig during an active event, THE Weekly_Event system SHALL increment the event's completion counter
2. THE Weekly_Event system SHALL record the user as a participant in the event
3. THE Weekly_Event system SHALL update the progress bar in real-time
4. WHEN the goal is reached, THE Weekly_Event system SHALL mark the event as COMPLETED
5. THE Weekly_Event system SHALL prevent double-counting of gigs completed before the event started

### Requirement 3

**User Story:** As a participant, I want to receive rewards when we achieve the weekly goal, so that I'm incentivized to contribute.

#### Acceptance Criteria

1. WHEN an event goal is reached, THE Weekly_Event system SHALL award bonus time credits to all participants
2. THE Weekly_Event system SHALL distribute rewards proportionally based on contribution count
3. THE Weekly_Event system SHALL create WEEKLY_EVENT_REWARD transaction records for each participant
4. WHEN rewards are distributed, THE Weekly_Event system SHALL show a celebration notification
5. THE Weekly_Event system SHALL prevent duplicate reward distribution for the same event

### Requirement 4

**User Story:** As a moderator, I want events to rotate themes automatically, so that the community stays engaged with variety.

#### Acceptance Criteria

1. THE Weekly_Event system SHALL support themed events: Tech, Creative, Education, Care, Mixed
2. WHEN a new week begins, THE Weekly_Event system SHALL create an event with the next theme in rotation
3. THE Weekly_Event system SHALL adjust goals based on community size (higher goals for larger communities)
4. THE Weekly_Event system SHALL automatically expire events after 7 days
5. THE Weekly_Event system SHALL maintain a history of past events with completion status

### Requirement 5

**User Story:** As a community member, I want to see who's participating, so that I can feel connected to the community effort.

#### Acceptance Criteria

1. THE Weekly_Event system SHALL display participant count on the event card
2. THE Weekly_Event system SHALL show top contributors (without revealing exact balances)
3. WHEN a user completes their first gig in an event, THE Weekly_Event system SHALL add them to the participant list
4. THE Weekly_Event system SHALL show anonymous participation statistics if users prefer privacy
5. THE Weekly_Event system SHALL display event completion message celebrating the community

### Requirement 6

**User Story:** As an administrator, I want to create special events, so that I can run seasonal or themed campaigns.

#### Acceptance Criteria

1. THE Weekly_Event system SHALL support custom event creation via admin scripts
2. WHEN creating a custom event, THE system SHALL allow setting goal amount, theme, duration, and rewards
3. THE Weekly_Event system SHALL validate that custom events don't overlap with active events
4. THE Weekly_Event system SHALL allow moderators to cancel or extend events if needed
5. THE Weekly_Event system SHALL log all admin event modifications for audit purposes

### Requirement 7

**User Story:** As a developer, I want event automation, so that weekly events run without manual intervention.

#### Acceptance Criteria

1. THE Weekly_Event system SHALL auto-generate new events every Monday at 00:00 UTC
2. THE Weekly_Event system SHALL calculate appropriate goals based on previous week's activity
3. THE Weekly_Event system SHALL send reminders when events are ending within 24 hours
4. THE Weekly_Event system SHALL archive completed events for historical tracking
5. THE Weekly_Event system SHALL provide npm script to manually trigger event creation for testing
