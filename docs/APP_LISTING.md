# Community TimeBank - App Listing

## What It Is

**Community TimeBank** is a Reddit-native skill exchange platform where community members trade time and expertise using TimeCredits (TC). Every hour of help equals 1 TC, creating a fair, local economy for mutual aid within your subreddit.

Built with **Devvit Web Interactive Posts**, TimeBank runs entirely within Reddit—no external sites, no complicated signups. Just click the post and start helping or getting help.

## How to Play

### Getting Started (30 seconds)
1. **Open the TimeBank post** in your subreddit
2. **Receive 1 free TC** automatically when you first join
3. **Choose your path:**
   - 🙋 **Post a Request** — Need help? Offer TC for someone's time
   - 💪 **Offer a Skill** — Willing to help? Earn TC by assisting others
   - 🔍 **Browse Gigs** — See what's available right now

### Posting a Gig
- **Find Help**: Offer your TC to someone who can help you (requires balance)
- **Offer Help**: Promise your skills to earn TC from others
- Include clear title, description, estimated time, and skills needed
- Remote or local—you choose

### Accepting & Completing Gigs
1. **Browse open gigs** and accept one that matches your skills
2. **Do the work** (coordinate via Reddit DM or comments)
3. **Confirm completion** — both parties must confirm
4. **Credits transfer automatically** — helper receives TC, reputation increases

### Weekly Skill Swap Sprints
- Every week features a **cooperative community goal** (e.g., "Complete 30 gigs together")
- **Contribute any matching gig** to progress the community meter
- **Everyone who participated gets bonus TC** when the goal is reached
- Themes rotate: Tech Week, Creative Week, Learning Week, Care Week, Mixed

### Leaderboards & Recognition
**Real-time rankings across multiple categories:**
- 🏆 **Top Helpers** — Most completed gigs (weekly & seasonal)
- ⚡ **Fastest Responders** — Quickest to accept gigs
- 🌈 **Most Versatile** — Helped across the most skill categories

**Community Analytics:**
- Total gigs completed this week
- Active participants count
- Average time to match requests
- Category breakdown

## Community Rules

### Fair Play
- **No spam**: Max 5 gigs posted per hour (higher limits for trusted users)
- **Deliver quality**: Both parties must confirm completion
- **Be respectful**: Follow subreddit rules and Reddit's Content Policy
- **No external payments**: TimeCredits only—keep it in the community

### Trust & Safety
- **Reputation matters**: Complete gigs to build reputation (>10 = Trusted, >50 = Veteran)
- **Dispute resolution**: Open disputes within 24 hours if something goes wrong
- **Moderators review disputes**: Fair splits, refunds, or rulings
- **Frozen accounts**: Moderators can freeze abusive users temporarily

### Earning & Spending
- Start with **1 free TC** (signup bonus)
- Earn **1 TC per hour** of completed help
- Earn **bonus TC** from weekly sprint rewards
- Balance displayed in real-time
- Transaction history always visible

## Moderation Tools

### Moderator Panel (Mod-Only Tab)
**Quick Stats Dashboard:**
- Open disputes count
- Frozen users list
- Pending reports

**Admin Actions:**
1. **Award Credits** — Grant TC for exceptional contributions, bug reports, or community leadership
2. **Freeze/Unfreeze Users** — Temporarily restrict abusive accounts from posting/accepting
3. **Resolve Disputes** — Review evidence, split credits, or refund parties
4. **Rollback Transactions** — Reverse fraudulent payments
5. **Adjust Rate Limits** — Set custom limits per user or trust level

### Audit Trail
- **Every mod action is logged** with timestamp, moderator, and reason
- **Immutable record** viewable by all moderators
- **Transaction reversals** create FRAUD_REVERSAL records
- **Dispute resolutions** show outcome and credit allocation

### Admin Scripts (Command Line)
```bash
# Award time credits to a user
npm run admin:award-credit -- --username "alice_dev" --amount 50 --reason "Excellent bug report"

# Freeze abusive user
npm run admin:freeze-user -- --username "spammer123" --reason "Repeated spam posts"

# Reset economy (emergency only)
npm run admin:reset-economy
```

## How Credits Work

### Earning TC
- ✅ **Signup Bonus**: 1 TC when you first join
- ✅ **Complete Gigs**: 1 TC per hour of help provided
- ✅ **Weekly Sprint Rewards**: 2 TC per participant when community reaches goal
- ✅ **Mod Awards**: Variable TC for exceptional contributions

### Spending TC
- 💸 **Post FIND_HELP gigs**: Requires balance ≥ offered amount
- 💸 **Credits escrowed**: Held until gig confirmed complete
- 💸 **No refunds for completed gigs** (use dispute process if needed)

### Balance Protection
- **Cannot spend more than you have**
- **Frozen accounts** keep their balance but can't post new gigs
- **Disputes hold credits in escrow** until resolved
- **System account has infinite TC** for bonuses and rewards

## Safety & Disputes

### Opening a Dispute
**Available within 24 hours of gig completion if:**
- Work wasn't delivered as described
- Quality issues not resolved
- Either party disappeared after acceptance

**How to dispute:**
1. Click "Open Dispute" on the completed gig
2. Provide reason and evidence (screenshots, links, messages)
3. Credits move to escrow hold
4. Moderator reviews and decides

### Dispute Outcomes
- **Favor Initiator**: Full refund to dispute opener
- **Favor Respondent**: Full payment to original recipient
- **Split**: 50/50 or custom allocation
- **Dismissed**: Dispute closed, no changes

### Preventing Issues
- ✅ **Clear descriptions**: Be specific about what you need/offer
- ✅ **Communicate early**: Use Reddit DMs or comments to coordinate
- ✅ **Check profiles**: Review reputation and completed gigs
- ✅ **Start small**: Build trust with lower-TC gigs first

## Events & Leaderboards

### Weekly Skill Swap Sprint
**Structure:**
- **Duration**: Monday 00:00 UTC → Sunday 23:59 UTC
- **Goal**: Complete N gigs as a community (scales with size)
- **Theme**: Rotates weekly (Tech → Creative → Education → Care → Mixed)
- **Reward**: 2 TC per participant when goal reached
- **Progress**: Real-time progress bar visible to all

**Past Events Archive:**
- View completed sprint history
- See participant counts and final scores
- Track theme rotation

### Leaderboard Rankings
**Three Boards, Two Timeframes:**

1. **Top Helpers** (Weekly & Seasonal)
   - Ranked by completed gigs count
   - Shows total contributions

2. **Fastest Responders** (Weekly & Seasonal)
   - Ranked by average response time (gig post → acceptance)
   - Minimum 3 gigs to qualify
   - Shown in minutes/hours

3. **Most Versatile** (Weekly & Seasonal)
   - Ranked by unique skill categories used
   - Encourages helping across tech, creative, education, care, etc.

**Seasonal Reset:**
- Seasons run quarterly (3 months)
- Weekly boards reset every Monday
- Historical rankings preserved
- Top performers earn special recognition

### Community Analytics
**Visible to everyone:**
- Total gigs completed this week
- Active participants (users who completed ≥1 gig)
- Average time to match (post → acceptance)
- Gigs by category breakdown
- New users this week

**Privacy:**
- Individual balances stay private
- Opt-out available for leaderboards
- Aggregated stats only (no individual tracking)

## Developer Experience (Kiro Integration)

This project showcases **Kiro** for code generation and developer workflow optimization.

### Kiro Specs Created
Located in `.kiro/specs/`:
- `gig-lifecycle/` — State machine, transitions, edge cases
- `timecredits-economy/` — Balance management, payments, transactions
- `weekly-events/` — Cooperative goals, rewards, auto-generation
- `leaderboards/` — Rankings, analytics, seasonal resets
- `moderation-trust/` — Disputes, freezes, rate limits, audit logs
- `first-screen/` — Onboarding, CTAs, responsive design

### Code Generated
**Types & Scaffolds (`.kiro/hooks/`):**
- Service method signatures from user stories
- Type-safe state update helpers
- Transaction creator functions
- Validation logic with descriptive errors

**Steering Orchestration (`.kiro/steering/`):**
- Gig lifecycle flow (post → match → fulfill → settle → leaderboards)
- Weekly event auto-seeding
- Leaderboard recalculation triggers

### Metrics
- **~1,050 lines** of boilerplate avoided via Kiro generation
- **~4 hours saved** per feature iteration (specs → code)
- **5 reusable patterns** others can adopt:
  1. Immutable state updates
  2. Service error handling
  3. Transaction creation
  4. Requirements-driven development
  5. Orchestration steering

### Regeneration Scripts
```bash
npm run kiro:generate-services  # Regenerate service scaffolds from specs
npm run kiro:generate-types     # Update types from requirements
npm run kiro:sync-tests         # Create test scaffolds for all specs
```

**Tagged for:** 🏆 **Best Kiro Developer Experience Award**

---

## Support & Feedback

- 📧 **Issues**: Report bugs via GitHub Issues
- 💬 **Feedback**: [Optional Developer Feedback Survey](https://forms.gle/example)
- 📹 **Demo Video**: [3-Minute Desktop Walkthrough](https://youtu.be/example)
- 🔗 **GitHub**: MIT licensed, fully open source

Built with ❤️ for Reddit's Community Games Challenge
