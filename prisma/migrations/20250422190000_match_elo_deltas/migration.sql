-- Per-match Elo deltas (player A / B in stored order) for history on player profiles
ALTER TABLE "Match" ADD COLUMN "eloDeltaA" INTEGER;
ALTER TABLE "Match" ADD COLUMN "eloDeltaB" INTEGER;
