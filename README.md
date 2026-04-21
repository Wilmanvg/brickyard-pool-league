# Pool League

A small Next.js app to track weekly pool games between friends: **Elo ratings**, **W/L/D records**, and **head-to-head** stats.

## Quick start

```bash
cd pool-league
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Players** — add everyone in your group (names must be unique).
- **Log match** — pick two players, winner (or draw). Elo updates automatically.
- **Leaderboard** — sorted by Elo.
- **Head-to-head** — wins and draws between any two players.

## Configuration

- **Database**: SQLite at `prisma/dev.db` (see `DATABASE_URL` in `.env`).
- **Elo**: Default rating `1500`, K-factor `28` — edit `src/lib/elo.ts` to tune how fast ratings move.

## Security

Keep dependencies current (`npm outdated`). If `npm audit` reports issues in Next.js, upgrade with `npm install next@latest eslint-config-next@latest`.

## Deploying

- **SQLite** works great on a single server (VPS, Railway, etc.) that can persist one file.
- For **Vercel** or other serverless hosts, swap to a hosted DB (e.g. Postgres on Neon) and update `DATABASE_URL` in Prisma — the app code stays the same.

## API (optional)

- `GET/POST /api/players`
- `GET/POST /api/matches`
- `GET /api/head-to-head?a=<id>&b=<id>`
