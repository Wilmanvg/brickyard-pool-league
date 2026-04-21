# Pool League

Next.js app for weekly pool games: **per-player PINs**, **match confirmation** before Elo updates, **leaderboard**, and **head-to-head** stats.

## Flow

1. **Players** — each person gets a name and a **PIN** (min 4 characters; stored hashed).
2. **Login** — sign in with player + PIN (session cookie, ~2 weeks).
3. **Log match** — you must be signed in as one of the two players. The match is **pending** until the **other player confirms** (with their PIN) or **rejects** (dispute). The logger can **cancel** their own pending entry with PIN.
4. **Home** — pending items appear at the top for sign-in users.
5. **Leaderboard / head-to-head** — only **confirmed** matches count.

## Quick start (local)

PostgreSQL + env vars (see `.env.example`):

```bash
docker run --name pool-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pool -p 5432:5432 -d postgres:16
cp .env.example .env
# Edit .env: DATABASE_URL and SESSION_SECRET (e.g. openssl rand -hex 32)
```

```bash
cd pool-league
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database migrations and existing data

Migration `20250422180000_pins_pending_matches` assigns existing players (if any) the temporary PIN **`0000`** until you change it (there is no “change PIN” UI yet—add a new player or run a manual SQL update if needed).

## Railway

1. Add **PostgreSQL** and reference **`DATABASE_URL`** on the web service.
2. Set **`SESSION_SECRET`** (long random string, min 16 characters) on the web service.
3. Deploy. Migrations run at **`npm start`** (`prisma migrate deploy`).

## Security

- Never commit `.env`. Rotate `SESSION_SECRET` if leaked.
- Keep Next.js updated (`npm audit`).

## API (sketch)

- `POST /api/players` — `{ name, pin }`
- `POST /api/auth/login` — `{ playerId, pin }`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/matches` — session must be one of the two players; creates **pending** match
- `GET /api/matches/pending` — for current session
- `POST /api/matches/:id/confirm` — `{ pin }` (opponent)
- `POST /api/matches/:id/reject` — `{ pin }` (opponent)
- `POST /api/matches/:id/cancel` — `{ pin }` (logger)
- `GET /api/head-to-head?a=&b=` — confirmed matches only
