-- Per-player PIN (bcrypt). Existing players get PIN "0000" until they change it (see README).
ALTER TABLE "Player" ADD COLUMN "pinHash" TEXT;

UPDATE "Player"
SET "pinHash" = '$2b$10$u7sTIUTNCRg5vnaQ7P9NCOJapqaBOonobbQvhEELhtumIz/uxY3pW'
WHERE "pinHash" IS NULL;

ALTER TABLE "Player" ALTER COLUMN "pinHash" SET NOT NULL;

-- Match approval flow
ALTER TABLE "Match" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'CONFIRMED';
ALTER TABLE "Match" ADD COLUMN "loggedById" TEXT;
ALTER TABLE "Match" ADD COLUMN "confirmedAt" TIMESTAMP(3);

UPDATE "Match" SET "loggedById" = "playerAId" WHERE "loggedById" IS NULL;

ALTER TABLE "Match" ALTER COLUMN "loggedById" SET NOT NULL;

UPDATE "Match" SET "confirmedAt" = "playedAt" WHERE "status" = 'CONFIRMED' AND "confirmedAt" IS NULL;

ALTER TABLE "Match" ADD CONSTRAINT "Match_loggedById_fkey" FOREIGN KEY ("loggedById") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Match_status_idx" ON "Match"("status");
CREATE INDEX "Match_loggedById_idx" ON "Match"("loggedById");
