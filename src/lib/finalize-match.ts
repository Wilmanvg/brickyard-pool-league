import type { Prisma } from "@prisma/client";
import { updateElo, type Outcome } from "@/lib/elo";

/** Apply Elo and W/L/D for a PENDING match, then mark CONFIRMED. Idempotent if already CONFIRMED. */
export async function finalizePendingMatch(
  tx: Prisma.TransactionClient,
  matchId: string,
): Promise<void> {
  const match = await tx.match.findUniqueOrThrow({ where: { id: matchId } });
  if (match.status !== "PENDING") return;

  const outcome = match.outcome as Outcome;
  const [a, b] = await Promise.all([
    tx.player.findUniqueOrThrow({ where: { id: match.playerAId } }),
    tx.player.findUniqueOrThrow({ where: { id: match.playerBId } }),
  ]);

  const [newA, newB] = updateElo(a.eloRating, b.eloRating, outcome);

  const aWins = outcome === "WIN_A" ? 1 : 0;
  const aLosses = outcome === "WIN_B" ? 1 : 0;
  const aDraws = outcome === "DRAW" ? 1 : 0;
  const bWins = outcome === "WIN_B" ? 1 : 0;
  const bLosses = outcome === "WIN_A" ? 1 : 0;
  const bDraws = outcome === "DRAW" ? 1 : 0;

  await tx.player.update({
    where: { id: match.playerAId },
    data: {
      eloRating: newA,
      matchesPlayed: { increment: 1 },
      wins: { increment: aWins },
      losses: { increment: aLosses },
      draws: { increment: aDraws },
    },
  });
  await tx.player.update({
    where: { id: match.playerBId },
    data: {
      eloRating: newB,
      matchesPlayed: { increment: 1 },
      wins: { increment: bWins },
      losses: { increment: bLosses },
      draws: { increment: bDraws },
    },
  });

  await tx.match.update({
    where: { id: matchId },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });
}
