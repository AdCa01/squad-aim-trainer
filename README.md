# Squad Aim Trainer

> 3D aim trainer for [Squad](https://joinsquad.com/) players, with multi-provider auth and a global leaderboard. MIT.

A small Next.js + React Three Fiber web game — drop in your favourite Squad nickname, snap a few moving targets, fight for the top of the leaderboard against your clan. Self-hostable, no SaaS dependency.

## Quick start

```bash
git clone https://github.com/AdCa01/squad-aim-trainer.git
cd squad-aim-trainer
cp .env.example .env
# Edit .env: at minimum set NEXTAUTH_SECRET, then enable one auth provider.
docker compose up -d --build
# → http://localhost:3000
```

The schema is pushed by the container at boot (`prisma db push`), so the database is ready on first run.

## Features

- **3D aim trainer** (React Three Fiber) — pointer-lock crosshair, configurable sensitivity / FOV / DPI, multiple target patterns, particle hits.
- **Global leaderboard** — top 100 players, sorted by score. Bans hide a user from the board.
- **Per-user best score** — every run upserts to your row only if it beats your current best; you can't drop your rank by playing a bad round.
- **Multi-provider auth** (NextAuth.js v5, all opt-in via env):
  - **Discord** — `AUTH_DISCORD=true` + `DISCORD_CLIENT_ID` + `DISCORD_CLIENT_SECRET`
  - **GitHub** — `AUTH_GITHUB=true` + `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET`
  - **Google** — `AUTH_GOOGLE=true` + `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
  - **Steam** (OpenID 2.0) — `AUTH_STEAM=true` (+ optional `STEAM_API_KEY` for persona names)
  - **Email + password** — `AUTH_LOCAL=true` (no UI for registration yet — create users via Prisma Studio if you enable this)
- **RBAC roles** — `PLAYER` / `ADMIN` / `SUPER_ADMIN`. First sign-in with `ADMIN_BOOTSTRAP_EMAIL` is auto-promoted.
- **Standalone Next.js build** in the Docker image — no Node runtime needed at deploy time, just `docker compose up`.

## Configuration

See `.env.example`. The provider toggles are independent — enable as many as you want; each unset provider is silently skipped (with a startup warning if the toggle is on but credentials are missing).

### Generating `NEXTAUTH_SECRET`

```bash
openssl rand -base64 32
```

### Discord app setup

1. Create an app at https://discord.com/developers/applications.
2. OAuth2 → Redirects: add `${NEXTAUTH_URL}/api/auth/callback/discord` (e.g. `https://aim.example.com/api/auth/callback/discord`).
3. Copy Client ID + Client Secret into `.env`, set `AUTH_DISCORD=true`.

Other providers follow the same pattern — see [authjs.dev/getting-started/providers](https://authjs.dev/getting-started/providers).

### Steam OpenID

No app to create — just set `AUTH_STEAM=true`. Steam will redirect users back to `${NEXTAUTH_URL}/api/auth/steam/return`. Add an optional `STEAM_API_KEY` (from https://steamcommunity.com/dev/apikey) to fetch persona names + avatars.

## Tech stack

- **Next.js 15** + React 19 (App Router, standalone build)
- **React Three Fiber** + **drei** + **three.js** for the 3D scene
- **NextAuth.js v5** + Prisma adapter
- **Prisma 6** + **PostgreSQL 16**
- **Tailwind CSS 3**

## Repo layout

```
squad-aim-trainer/
├─ prisma/schema.prisma              # User / Account / Session / Score
├─ public/                           # textures, icons
└─ src/
   ├─ app/
   │  ├─ page.tsx                    # the aim trainer (entry point)
   │  ├─ leaderboard/page.tsx        # top 100
   │  ├─ login/page.tsx              # provider buttons
   │  └─ api/
   │     ├─ auth/[...nextauth]/      # NextAuth routes
   │     ├─ auth/steam/              # Steam OpenID start + return
   │     └─ leaderboard/             # GET top 100, POST submit
   ├─ auth.ts                        # NextAuth config (JWT session, RBAC)
   ├─ auth-providers.ts              # All providers, opt-in via env
   ├─ middleware.ts                  # Edge gating (currently a no-op)
   ├─ components/aim-trainer/        # Crosshair, HUD, Target, etc.
   ├─ components/layout/Navbar.tsx
   ├─ hooks/                         # useGameState, usePointerLock, …
   └─ lib/                           # prisma, game-types, game-config
```

## Local development

```bash
npm install
npx prisma generate
# Start a local Postgres however you like (docker run, etc.) and set DATABASE_URL.
npx prisma db push
npm run dev
# → http://localhost:3000
```

## Acknowledgements

Built as a companion to the [Squad AllStars France](https://squad-all-stars-france.fr) tooling, sharing the auth stack with the open-source [Squad Replay & Stats Suite](https://github.com/AdCa01/squad-replay-stats).

## License

[MIT](LICENSE).
