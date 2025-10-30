# Requirements Document

## Introduction

The Community TimeBank system implements a subreddit-local currency called TimeCredits (TC) where 1 TC equals 1 hour of work. Users can post gigs to find help or offer help, with payments automatically processed upon completion. The system includes user reputation tracking, transaction history, and prevents common abuse scenarios.

## Glossary

- **TimeCredits (TC)**: The local currency where 1 TC = 1 hour of work
- **TimeBank_System**: The complete community timebank application
- **User_Account**: A registered user with balance, reputation, and gig history
- **Gig_Post**: A request for help (FIND_HELP) or offer to help (GIVE_HELP)
- **Transaction_Record**: A record of TC transfers between users
- **Gig_Completion**: The process of marking a gig as finished and transferring payment
- **Balance_Check**: Verification that a user has sufficient TC for a transaction
- **Race_Condition**: Multiple users attempting to accept the same gig simultaneously

## Requirements

### Requirement 1

**User Story:** As a new community member, I want to receive a signup bonus, so that I can participate in the timebank economy immediately.

#### Acceptance Criteria

1. WHEN a new user registers, THE TimeBank_System SHALL credit 1 TC to their account balance
2. WHEN a new user registers, THE TimeBank_System SHALL create a SIGNUP_BONUS transaction record
3. THE TimeBank_System SHALL set the user's initial reputation to 0
4. THE TimeBank_System SHALL record the user's join date timestamp

### Requirement 2

**User Story:** As a community member needing help, I want to post "Find Help" gigs, so that I can get assistance from other members.

#### Acceptance Criteria

1. WHEN a user attempts to post a FIND_HELP gig, THE TimeBank_System SHALL verify the user's balance is greater than or equal to the offered TC amount
2. IF a user's balance is less than the offered TC amount, THEN THE TimeBank_System SHALL prevent the gig posting and display an error message
3. WHEN a FIND_HELP gig is posted, THE TimeBank_System SHALL set the status to OPEN
4. THE TimeBank_System SHALL record the creation timestamp for all new gigs

### Requirement 3

**User Story:** As a community member offering help, I want to post "Give Help" gigs, so that I can earn TimeCredits by helping others.

#### Acceptance Criteria

1. THE TimeBank_System SHALL allow users to post GIVE_HELP gigs without balance verification
2. WHEN a GIVE_HELP gig is posted, THE TimeBank_System SHALL set the status to OPEN
3. THE TimeBank_System SHALL assign a unique identifier to each gig
4. THE TimeBank_System SHALL store the poster's username as the gig owner

### Requirement 4

**User Story:** As a community member, I want to accept available gigs, so that I can help others and earn TimeCredits.

#### Acceptance Criteria

1. WHEN a user attempts to accept a gig, THE TimeBank_System SHALL verify the user is not the gig poster
2. IF a user attempts to accept their own gig, THEN THE TimeBank_System SHALL prevent the acceptance and display an error message
3. WHEN a user accepts an OPEN gig, THE TimeBank_System SHALL change the status to IN_PROGRESS
4. WHEN a user accepts an OPEN gig, THE TimeBank_System SHALL set the acceptedBy field to the accepting user's username
5. IF multiple users attempt to accept the same OPEN gig simultaneously, THEN THE TimeBank_System SHALL allow only the first acceptance and reject subsequent attempts

### Requirement 5

**User Story:** As a gig poster, I want to mark completed gigs as finished, so that the helper receives their TimeCredits payment.

#### Acceptance Criteria

1. WHEN a gig poster marks an IN_PROGRESS gig as complete, THE TimeBank_System SHALL change the status to AWAITING_CONFIRMATION
2. WHEN a gig is marked complete, THE TimeBank_System SHALL transfer the specified TC amount from poster to helper
3. WHEN payment is processed, THE TimeBank_System SHALL create a GIG_PAYMENT transaction record
4. WHEN payment is processed, THE TimeBank_System SHALL set the gig status to COMPLETED
5. IF a user attempts to mark the same gig as complete multiple times, THEN THE TimeBank_System SHALL ignore subsequent completion requests without processing additional payments

### Requirement 6

**User Story:** As a community member, I want to view transaction history, so that I can track my TimeCredits earnings and spending.

#### Acceptance Criteria

1. THE TimeBank_System SHALL record all TC transfers with timestamp, amount, and transaction type
2. THE TimeBank_System SHALL store transaction reasons for audit purposes
3. THE TimeBank_System SHALL maintain transaction records for SIGNUP_BONUS, GIG_PAYMENT, and ADMIN_AWARD types
4. THE TimeBank_System SHALL link gig-related transactions to their corresponding gig ID

### Requirement 7

**User Story:** As a system administrator, I want all data to be persisted reliably, so that user balances and transaction history are never lost.

#### Acceptance Criteria

1. THE TimeBank_System SHALL persist all state changes under the key "timebank:state"
2. THE TimeBank_System SHALL handle 10,000 or more records with predictable key-value storage patterns
3. THE TimeBank_System SHALL maintain data consistency across all operations
4. THE TimeBank_System SHALL ensure atomic updates for balance transfers and status changes

### Requirement 8

**User Story:** As a community member, I want a responsive user interface, so that I can efficiently manage my gigs and TimeCredits on any device.

#### Acceptance Criteria

1. THE TimeBank_System SHALL provide a responsive web interface that adapts to different screen sizes
2. THE TimeBank_System SHALL display a custom splash screen during application loading
3. THE TimeBank_System SHALL show real-time updates of user balance and gig status
4. THE TimeBank_System SHALL provide clear visual feedback for all user actions