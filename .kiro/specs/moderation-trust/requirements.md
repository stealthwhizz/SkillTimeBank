# Requirements Document

## Introduction

The Moderation & Trust system provides comprehensive tools for maintaining community safety, preventing abuse, handling disputes, and managing user reputation. It includes configurable rate limits, minimum reputation requirements, dispute workflows with escrow, and a complete audit trail for moderator actions.

## Glossary

- **Rate_Limit**: Maximum number of actions allowed per time period
- **Reputation_Score**: Numeric measure of user trustworthiness
- **Dispute_Workflow**: Process for handling contested gig completions
- **Escrow_Hold**: Temporary freeze of time credits pending dispute resolution
- **Audit_Log**: Immutable record of all moderator actions
- **Moderator_Panel**: Admin interface for managing users and disputes
- **Freeze_User**: Temporarily restrict user from posting or accepting gigs
- **Fraudulent_Transaction**: Payment that needs to be reversed due to abuse
- **Trust_Level**: User tier (New, Trusted, Veteran) based on reputation

## Requirements

### Requirement 1

**User Story:** As a moderator, I want configurable rate limits, so that I can prevent spam and abuse.

#### Acceptance Criteria

1. THE Moderation system SHALL enforce max 5 gigs posted per user per hour
2. WHEN a user exceeds rate limit, THE system SHALL display cooldown timer
3. THE Moderation system SHALL allow moderators to adjust rate limits per trust level
4. THE Moderation system SHALL reset rate limit counters every hour
5. THE Moderation system SHALL exempt trusted users (reputation >50) from basic rate limits

### Requirement 2

**User Story:** As a moderator, I want minimum reputation to post, so that new accounts can't immediately spam.

#### Acceptance Criteria

1. THE Moderation system SHALL require minimum 0 reputation to post first gig (signup allowed)
2. THE Moderation system SHALL allow moderators to set minimum reputation thresholds
3. WHEN a low-reputation user attempts to post, THE system SHALL show reputation requirement
4. THE Moderation system SHALL provide "probation period" for new users (first 24 hours)
5. THE Moderation system SHALL track reputation changes from completed gigs (+1 per completion)

### Requirement 3

**User Story:** As a user, I want a dispute process, so that I can contest unfair gig completions.

#### Acceptance Criteria

1. THE Moderation system SHALL allow either party to open a dispute within 24 hours of completion
2. WHEN a dispute is opened, THE system SHALL place time credits in escrow hold
3. THE Moderation system SHALL notify moderators when disputes are opened
4. THE Moderation system SHALL display dispute reason and evidence from both parties
5. THE Moderation system SHALL prevent users from spending escrowed credits

### Requirement 4

**User Story:** As a moderator, I want to resolve disputes, so that I can fairly mediate conflicts.

#### Acceptance Criteria

1. THE Moderation system SHALL show all open disputes in the moderator panel
2. WHEN moderator resolves dispute, THE system SHALL release escrow to the winning party
3. THE Moderation system SHALL allow partial credit splits (e.g., 50/50) for compromise resolutions
4. THE Moderation system SHALL log dispute resolution details in audit trail
5. THE Moderation system SHALL notify both parties of the resolution decision

### Requirement 5

**User Story:** As a moderator, I want a comprehensive audit log, so that I can track all admin actions.

#### Acceptance Criteria

1. THE Moderation system SHALL log all credit awards with timestamp, moderator, amount, and reason
2. THE Moderation system SHALL log all user freezes and unfreezes with reason
3. THE Moderation system SHALL log all dispute resolutions with outcome and moderator
4. THE Moderation system SHALL log all transaction rollbacks with affected users
5. THE Moderation system SHALL make audit logs viewable by all moderators but not editable

### Requirement 6

**User Story:** As a moderator, I want to freeze abusive users, so that I can stop bad actors quickly.

#### Acceptance Criteria

1. THE Moderation system SHALL allow moderators to freeze user accounts
2. WHEN a user is frozen, THE system SHALL prevent them from posting or accepting new gigs
3. THE Moderation system SHALL allow frozen users to complete in-progress gigs
4. THE Moderation system SHALL display freeze reason to the frozen user
5. THE Moderation system SHALL allow moderators to unfreeze accounts with reason logged

### Requirement 7

**User Story:** As a moderator, I want to roll back fraudulent transactions, so that I can correct abuse.

#### Acceptance Criteria

1. THE Moderation system SHALL allow moderators to reverse completed transactions
2. WHEN a transaction is reversed, THE system SHALL deduct credits from recipient and return to sender
3. THE Moderation system SHALL create TRANSACTION_REVERSAL record in audit log
4. THE Moderation system SHALL prevent reversal if recipient has insufficient balance
5. THE Moderation system SHALL mark reversed gigs with FRAUD flag for community safety

### Requirement 8

**User Story:** As a moderator, I want to grant credits directly, so that I can reward exceptional contributions.

#### Acceptance Criteria

1. THE Moderation system SHALL integrate with existing admin:award-credit script
2. WHEN moderator awards credits, THE system SHALL create ADMIN_AWARD transaction
3. THE Moderation system SHALL require moderator to provide reason for credit award
4. THE Moderation system SHALL notify recipient of the award and reason
5. THE Moderation system SHALL display admin awards in user transaction history

### Requirement 9

**User Story:** As a developer, I want mod panel integrated into the app, so that moderation is seamless.

#### Acceptance Criteria

1. THE Moderation system SHALL add "Mod Panel" tab visible only to moderators
2. THE Moderation system SHALL show quick stats: open disputes, frozen users, pending reports
3. THE Moderation system SHALL provide one-click actions for common tasks (freeze, unfreeze, award)
4. THE Moderation system SHALL load mod panel lazily to avoid affecting regular user performance
5. THE Moderation system SHALL check moderator permissions via reddit.getModerators()
