# Requirements Document

## Introduction

The Leaderboard system creates competitive and recognition-based community play loops by tracking and displaying top performers across multiple categories: most helpful, fastest responders, most diverse skills, and seasonal rankings. This system motivates participation and provides lightweight analytics on community health.

## Glossary

- **Leaderboard**: Ranked list of users based on performance metrics
- **Seasonal_Leaderboard**: Rankings that reset quarterly (3 months)
- **Weekly_Leaderboard**: Rankings that reset each Monday
- **Top_Helpers**: Users ranked by completed gigs count
- **Fastest_Responders**: Users ranked by average time to accept gigs
- **Diverse_Skillers**: Users ranked by number of unique skill categories used
- **Leaderboard_Entry**: A single ranking record with user, score, and rank
- **Analytics_Dashboard**: Lightweight metrics display for community health
- **Response_Time**: Duration between gig posting and acceptance

## Requirements

### Requirement 1

**User Story:** As a community member, I want to see top helpers, so that I can recognize active contributors.

#### Acceptance Criteria

1. THE Leaderboard system SHALL display the top 10 users by completed gigs count
2. THE Leaderboard system SHALL show username, completed gig count, and rank position
3. THE Leaderboard system SHALL update rankings in real-time as gigs complete
4. WHEN a user views leaderboards, THE system SHALL highlight their own position if ranked
5. THE Leaderboard system SHALL display "Not Ranked" for users outside the top 10

### Requirement 2

**User Story:** As a community member, I want to see fastest responders, so that I know who helps quickly.

#### Acceptance Criteria

1. THE Leaderboard system SHALL track average response time for each user
2. WHEN a gig is accepted, THE system SHALL calculate elapsed time from posting to acceptance
3. THE Leaderboard system SHALL display top 10 users by fastest average response time
4. THE Leaderboard system SHALL show response time in human-readable format (e.g., "5 mins")
5. THE Leaderboard system SHALL require minimum 3 accepted gigs before ranking for response time

### Requirement 3

**User Story:** As a community member, I want to see diverse skillers, so that I can find versatile helpers.

#### Acceptance Criteria

1. THE Leaderboard system SHALL track unique skill categories each user has worked in
2. WHEN a user completes a gig, THE system SHALL add the gig's category to their skill diversity count
3. THE Leaderboard system SHALL display top 10 users by number of unique categories
4. THE Leaderboard system SHALL show category badges or icons for visual appeal
5. THE Leaderboard system SHALL prevent duplicate category counting from the same user

### Requirement 4

**User Story:** As a community member, I want seasonal leaderboards, so that everyone has a fresh start periodically.

#### Acceptance Criteria

1. THE Leaderboard system SHALL reset seasonal rankings every 3 months (quarterly)
2. WHEN a new season starts, THE system SHALL archive previous season's rankings
3. THE Leaderboard system SHALL display current season name (e.g., "Winter 2025")
4. THE Leaderboard system SHALL allow users to view historical season results
5. THE Leaderboard system SHALL award special flair or badges to season winners

### Requirement 5

**User Story:** As a community member, I want weekly leaderboards, so that I can compete in short-term challenges.

#### Acceptance Criteria

1. THE Leaderboard system SHALL reset weekly rankings every Monday at 00:00 UTC
2. THE Leaderboard system SHALL track separate weekly stats alongside seasonal stats
3. WHEN viewing leaderboards, THE system SHALL allow toggling between weekly and seasonal views
4. THE Leaderboard system SHALL display week number and date range for context
5. THE Leaderboard system SHALL highlight users who appear in both weekly and seasonal top 10

### Requirement 6

**User Story:** As a moderator, I want lightweight analytics, so that I can monitor community health.

#### Acceptance Criteria

1. THE Leaderboard system SHALL display total completed gigs this week
2. THE Leaderboard system SHALL show total active participants (users who completed ≥1 gig)
3. THE Leaderboard system SHALL calculate and display average time-to-match for gigs
4. THE Leaderboard system SHALL show gigs-per-category breakdown in a simple chart
5. THE Leaderboard system SHALL display community growth metrics (new users this week)

### Requirement 7

**User Story:** As a developer, I want efficient leaderboard calculation, so that performance remains smooth.

#### Acceptance Criteria

1. THE Leaderboard system SHALL cache ranking calculations and update incrementally
2. WHEN a gig completes, THE system SHALL update only affected leaderboard entries
3. THE Leaderboard system SHALL use Redis sorted sets for O(log N) ranking operations
4. THE Leaderboard system SHALL limit leaderboard API calls to prevent excessive reads
5. THE Leaderboard system SHALL provide background job to recalculate rankings daily

### Requirement 8

**User Story:** As a privacy-conscious user, I want opt-out from leaderboards, so that my activity remains private.

#### Acceptance Criteria

1. THE Leaderboard system SHALL provide user setting to opt-out of public rankings
2. WHEN a user opts out, THE system SHALL exclude them from all leaderboard displays
3. THE Leaderboard system SHALL still track personal stats for opted-out users privately
4. THE Leaderboard system SHALL respect privacy settings in analytics aggregations
5. THE Leaderboard system SHALL allow users to toggle opt-out status at any time
