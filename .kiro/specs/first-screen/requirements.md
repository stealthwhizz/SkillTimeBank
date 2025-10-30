# Requirements Document

## Introduction

The Enhanced First Screen system creates a polished, welcoming entry point for the TimeBank app with clear onboarding, app identity, and three primary CTAs optimized for desktop viewing during judging. It includes skeleton loading states, responsive layout, and zero-config first-run experience.

## Glossary

- **First_Screen**: Initial view users see when opening the interactive post
- **Splash_Screen**: Welcome screen with app identity and primary CTAs
- **Onboarding**: Brief explanation of how the app works
- **Primary_CTA**: Main call-to-action buttons (Post request, Offer skill, Browse gigs)
- **Skeleton_State**: Loading placeholder showing content structure
- **Zero_Config**: App works immediately without setup or seed data
- **Desktop_First**: Optimized for desktop viewing (judges' primary environment)
- **Responsive_Layout**: Adapts gracefully to different screen sizes
- **App_Identity**: Branding, theme, and visual personality

## Requirements

### Requirement 1

**User Story:** As a first-time user, I want to see what the app is, so that I understand its purpose immediately.

#### Acceptance Criteria

1. THE First_Screen SHALL display app name "Community TimeBank" prominently
2. THE First_Screen SHALL show tagline: "Trade skills with TimeCredits — 1 TC = 1 hour"
3. THE First_Screen SHALL include concise explanation (max 2 sentences) of how it works
4. THE First_Screen SHALL use brand colors and consistent theming
5. THE First_Screen SHALL display app icon or logo for visual identity

### Requirement 2

**User Story:** As a new user, I want clear onboarding, so that I know how to participate.

#### Acceptance Criteria

1. THE First_Screen SHALL show 3-step onboarding: "Get 1 free TC → Post or browse → Complete & earn"
2. THE First_Screen SHALL highlight signup bonus prominently
3. THE First_Screen SHALL explain credit system in simple terms
4. THE First_Screen SHALL avoid overwhelming users with too much text
5. THE First_Screen SHALL use icons or visual aids to enhance comprehension

### Requirement 3

**User Story:** As a user, I want three clear action buttons, so that I can immediately start using the app.

#### Acceptance Criteria

1. THE First_Screen SHALL display three primary CTAs: "Post a Request", "Offer a Skill", "Browse Gigs"
2. THE First_Screen SHALL make CTAs visually prominent with large, tappable buttons
3. WHEN user clicks "Post a Request", THE system SHALL navigate to post-gig tab with FIND_HELP pre-selected
4. WHEN user clicks "Offer a Skill", THE system SHALL navigate to post-gig tab with OFFER_HELP pre-selected
5. WHEN user clicks "Browse Gigs", THE system SHALL navigate to browse tab

### Requirement 4

**User Story:** As a desktop user (judge), I want optimized layout, so that the app looks polished and professional.

#### Acceptance Criteria

1. THE First_Screen SHALL use desktop-optimized layout with max-width of 720px
2. THE First_Screen SHALL center content vertically and horizontally
3. THE First_Screen SHALL use appropriate spacing and padding for desktop viewing
4. THE First_Screen SHALL use readable font sizes (min 14px for body text)
5. THE First_Screen SHALL ensure all interactive elements are clearly visible and accessible

### Requirement 5

**User Story:** As a user with slow connection, I want skeleton loading states, so that I see progress immediately.

#### Acceptance Criteria

1. THE First_Screen SHALL show skeleton placeholders while loading user data
2. THE First_Screen SHALL animate skeleton shimmer effect for polish
3. WHEN data loads, THE system SHALL smoothly transition from skeleton to real content
4. THE First_Screen SHALL load in <2 seconds on typical connections
5. THE First_Screen SHALL prioritize loading critical content first (CTAs, onboarding)

### Requirement 6

**User Story:** As a first-run user, I want sensible defaults, so that the app isn't empty and confusing.

#### Acceptance Criteria

1. THE First_Screen SHALL seed sample gigs if state is empty (first run)
2. THE First_Screen SHALL show example users and completed gigs for context
3. THE First_Screen SHALL auto-register current user with signup bonus
4. THE First_Screen SHALL pre-populate skill categories with common options
5. THE First_Screen SHALL display helpful tooltips on first interaction

### Requirement 7

**User Story:** As a mobile user, I want responsive layout, so that the app works on all devices.

#### Acceptance Criteria

1. THE First_Screen SHALL adapt layout for screens <600px wide
2. THE First_Screen SHALL stack CTAs vertically on mobile
3. THE First_Screen SHALL maintain touch-friendly button sizes (min 44x44px)
4. THE First_Screen SHALL adjust font sizes for mobile readability
5. THE First_Screen SHALL ensure all content fits without horizontal scrolling

### Requirement 8

**User Story:** As an accessibility user, I want keyboard navigation, so that I can use the app without a mouse.

#### Acceptance Criteria

1. THE First_Screen SHALL support tab navigation through all interactive elements
2. THE First_Screen SHALL show clear focus indicators on keyboard navigation
3. THE First_Screen SHALL allow Enter key to activate focused buttons
4. THE First_Screen SHALL maintain logical focus order (top to bottom, left to right)
5. THE First_Screen SHALL include ARIA labels for screen reader users
