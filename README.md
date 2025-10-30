# SkillStack TimeBank ⏰

Trade skills with TimeCredits — 1 TC = 1 hour. Community TimeBank is a Reddit‑native skill exchange built with Devvit Web Interactive Posts. Help your community, earn credits, and build reputation—all within Reddit.

## ✨ Features

### Core
- TimeCredits economy (1 TC = 1 hour)
- Gig marketplace: post requests or offer skills
- Dual confirmation before settlement
- Transaction history and basic reputation

### Community Play
- Weekly “Skill Swap” events with community goals
- Leaderboards (Top Helpers, Fastest Responders, Most Versatile)
- Lightweight community analytics

### Safety & Moderation
- Rate limits and minimum reputation
- Dispute window with escrow holds
- Moderator actions: award credits, freeze/ban users, resolve disputes

## 🚀 Quick start

Prerequisites
- Node.js 18+
- Devvit CLI installed and logged into Reddit

Development
```bash
# Install dependencies
npm install

# Playtest in your subreddit (update subreddit name as needed)
npm run dev:run

# Upload to Reddit (Devvit upload)
npm run dev:upload

# Run tests
npm test

# Type check
npm run typecheck
```

Admin tools
```bash
# Award time credits to users
npm run admin:award-credit -- --username "alice" --amount 50 --reason "Great contribution"

# Ban/freeze abusive users
npm run admin:ban-user -- --username "spammer" --reason "Repeated spam"

# Reset economy (emergency only; script currently a stub with safety checks)
npm run admin:reset-economy
```

Demo & submission helpers
```bash
# Create demo post with seed data
npm run demo:create-post

# Generate a summary of submission assets
npm run submit:assets
```

## 📁 Project structure

```
SkillTimeBank/
├── devvit.yaml              # Devvit app config (name, version)
├── src/
│   ├── main.tsx             # Devvit entry point
│   ├── app/
│   │   └── App.tsx          # Main app component
│   ├── components/          # UI components (Splash, Leaderboard, etc.)
│   ├── services/            # Business logic (gigs, users, events, mods)
│   ├── state/               # App state and reducers
│   ├── types/               # TypeScript domain types
│   └── scripts/             # Admin utilities (award, ban, reset)
├── scripts/                 # Build/demo scripts
├── docs/                    # App listing, Admin guide, DX notes
├── tests/                   # Vitest test suite
├── webroot/                 # Web assets (hosted by Devvit runtime)
└── package.json             # Scripts and dependencies
```

## 📖 Documentation

- App overview: `docs/APP_LISTING.md`
- Admin toolkit: `docs/ADMIN_TOOLKIT.md`
- Developer experience notes: `docs/KIRO_EXPERIENCE.md`

Note on “Kiro” docs: this repo includes write‑ups and placeholder scripts related to a specs‑first/code‑gen workflow. The generators referenced in the docs are not wired into this public repo; the `kiro:*` scripts are placeholders.

## 🧪 Tests and type checking

- Test runner: Vitest (unit + integration tests in `tests/`)
- Type checking: `npm run typecheck` (tsc --noEmit)

## 🛠️ Tech stack

- Devvit Web (Reddit’s custom post framework)
- TypeScript
- Vitest (+ V8 coverage plugin)
- Tailwind CSS (via PostCSS)

## 📦 Deployment

- Upload the app to Reddit with `npm run dev:upload` (uses Devvit CLI)
- Configure playtest target in `package.json` (`dev:run`) and `devvit.yaml`

## 📜 License

BSD-3-Clause

## 🤝 Contributing

Issues and PRs are welcome. See tests in `tests/` and services in `src/services/` for entry points. If you’re interested in the specs‑first/Kiro approach, start with `docs/KIRO_EXPERIENCE.md`.

## 📧 Links

- Issues: https://github.com/stealthwhizz/SkillTimeBank/issues
- Subreddit (playtest target): r/SkillTimeBank

—

Built with ❤️ for the Reddit Community Games Challenge.
