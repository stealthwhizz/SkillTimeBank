# Kiro Steering: Gig Lifecycle Orchestration

## Purpose
Automate the complete gig lifecycle from posting through completion, credit settlement, and leaderboard updates.

## Flow Specification

### 1. Post Gig Flow
**Trigger:** User submits new gig form
**Steps:**
1. Validate gig data (title ≥10 chars, description ≥20 chars)
2. Check user balance if FIND_HELP type
3. Check rate limits and reputation requirements
4. Create gig in state
5. Increment user's gigsPosted counter
6. Return success + gigId

**Auto-generated code:**
- `gigService.createGig(state, gigData, context)`
- `moderationService.checkRateLimit(state, userId)`
- Form validation helpers

### 2. Match & Accept Flow
**Trigger:** User accepts open gig
**Steps:**
1. Verify gig is OPEN status
2. Prevent self-acceptance
3. Atomically set status to ASSIGNED
4. Set assignedTo field
5. Record acceptance timestamp
6. Update user stats (response time tracking)

**Auto-generated code:**
- `gigService.acceptGig(state, gigId, userId)`
- `leaderboardService.updateUserStats()` for response time

### 3. Fulfill & Settle Flow
**Trigger:** First party marks gig complete
**Steps:**
1. Set status to AWAITING_CONFIRMATION
2. Wait for second party confirmation
3. On dual confirmation:
   - Set status to COMPLETED
   - Execute payment (deduct from poster, credit to helper)
   - Create GIG_PAYMENT transaction
   - Update both users' reputation (+1 each)
   - Record gig in weekly event progress
   - Update leaderboard stats (completedGigs, categories)

**Auto-generated code:**
- `gigService.confirmGigCompletion(state, gigId, userId)`
- `gigService.executePayment(state, gigId)`
- `eventService.recordGigCompletion(state, gigId, userId)`
- `leaderboardService.updateUserStats(state, userId, gigId)`

### 4. Weekly Event Auto-Seed
**Trigger:** Cron job (Monday 00:00 UTC) or manual script
**Steps:**
1. Expire old events
2. Check if current week has active event
3. If not, create new event:
   - Rotate to next theme
   - Calculate goal based on community size
   - Set reward amount
   - Initialize empty participants list

**Auto-generated code:**
- `eventService.createWeeklyEvent(state, theme?, goalAmount?)`
- `eventService.expireOldEvents(state)`

### 5. Event Goal Achievement Flow
**Trigger:** Gig completion during active event
**Steps:**
1. Increment event progress counter
2. Add user to participants list
3. Check if goal reached
4. If goal reached:
   - Set event status to COMPLETED
   - Distribute rewards to all participants
   - Create WEEKLY_EVENT_REWARD transactions
   - Show celebration notification

**Auto-generated code:**
- `eventService.distributeRewards(state, eventId)`
- Notification helper

### 6. Leaderboard Update Flow
**Trigger:** After each gig completion
**Steps:**
1. Update user's completedGigs count
2. Track unique category if new
3. Recalculate average response time
4. Increment weekly and seasonal counters
5. Update cached leaderboard entries
6. Return updated rankings

**Auto-generated code:**
- `leaderboardService.updateUserStats(state, userId, gigId)`
- `leaderboardService.getLeaderboard(state, category, period, limit)`

## Code Generation Hooks

### Hook 1: Generate State Update Helpers
**Input:** Domain entity (User, Gig, Transaction, etc.)
**Output:** Type-safe update functions with immutability

```typescript
// Generated:
function updateUser(state: TimebankState, userId: string, updates: Partial<User>): TimebankState
function updateGig(state: TimebankState, gigId: string, updates: Partial<Gig>): TimebankState
```

### Hook 2: Generate Service Scaffolds
**Input:** Service requirements spec
**Output:** Service class with method signatures and basic error handling

### Hook 3: Generate Transaction Creators
**Input:** Transaction types
**Output:** Helper functions to create transaction records

```typescript
// Generated:
function createGigPaymentTransaction(fromId, toId, gigId, amount): Transaction
function createEventRewardTransaction(userId, eventId, amount): Transaction
```

### Hook 4: Generate Validation Functions
**Input:** Type definitions with validation rules
**Output:** Validation functions with descriptive error messages

## Automation Scripts

### Script 1: Regenerate Services
```bash
npm run kiro:generate-services
```
Reads `.kiro/specs/*/requirements.md` and regenerates service scaffolds

### Script 2: Regenerate Types
```bash
npm run kiro:generate-types
```
Updates type definitions from specs

### Script 3: Sync Tests
```bash
npm run kiro:sync-tests
```
Generates test scaffolds for all requirements

## Benefits Quantification

### Lines Saved
- Service boilerplate: ~400 lines
- Type definitions: ~150 lines  
- Validation functions: ~200 lines
- Test scaffolds: ~300 lines
**Total: ~1,050 lines of repetitive code avoided**

### Time Saved
- Manual service creation: 2-3 hours → 5 minutes
- Type updates: 30 minutes → instant
- Test setup: 1 hour → 10 minutes
**Total: ~4 hours saved per feature iteration**

### Reusable Patterns
1. State update immutability pattern
2. Service error handling pattern
3. Transaction creation pattern
4. Validation pattern with descriptive errors
5. Leaderboard calculation pattern
