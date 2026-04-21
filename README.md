# Pool League

A small Next.js app to track weekly pool games between friends: **Elo ratings**, **W/L/D records**, and **head-to-head** stats.

## Quick start (local)

You need **PostgreSQL** and a `DATABASE_URL` (see `.env.example`).

Example with Docker:

```bash
docker run --name pool-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pool -p 5432:5432 -d postgres:16
cp .env.example .env
# Set: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pool"
```

Then:

```bash
cd pool-league
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Players** — add everyone in your group (names must be unique).
- **Log match** — pick two players, winner (or draw). Elo updates automatically.
- **Leaderboard** — sorted by Elo.
- **Head-to-head** — wins and draws between any two players.

## Configuration

- **Database**: **PostgreSQL** via `DATABASE_URL` in `.env`.
- **Elo**: Default rating `1500`, K-factor `28` — edit `src/lib/elo.ts` to tune how fast ratings move.

## Railway

1. In your Railway project, add a **PostgreSQL** database (New → **Database** → PostgreSQL).
2. On your **web service** → **Variables**, add **`DATABASE_URL`**. Use **“Reference variable”** and pick the Postgres service’s `DATABASE_URL`, or paste the connection string from the DB’s **Connect** tab.
3. Redeploy. The build runs `prisma migrate deploy`, which creates tables on first deploy.

Without `DATABASE_URL`, Prisma will fail with a validation / initialization error.

## Security

Keep dependencies current (`npm outdated`). If `npm audit` reports issues in Next.js, upgrade with `npm install next@latest eslint-config-next@latest`.

## API (optional)

- `GET/POST /api/players`
- `GET/POST /api/matches`
- `GET /api/head-to-head?a=<id>&b=<id>`
