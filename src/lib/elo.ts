/** Default Elo for new players */
export const DEFAULT_ELO = 1500;

/** K-factor: higher = faster rating swings (typical 16–32) */
export const K_FACTOR = 28;

export type Outcome = "WIN_A" | "WIN_B" | "DRAW";

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/** Returns new ratings [newA, newB] after one game */
export function updateElo(
  ratingA: number,
  ratingB: number,
  outcome: Outcome,
  k: number = K_FACTOR,
): [number, number] {
  const ea = expectedScore(ratingA, ratingB);
  const eb = 1 - ea;

  let sa: number;
  let sb: number;
  if (outcome === "WIN_A") {
    sa = 1;
    sb = 0;
  } else if (outcome === "WIN_B") {
    sa = 0;
    sb = 1;
  } else {
    sa = 0.5;
    sb = 0.5;
  }

  const newA = Math.round(ratingA + k * (sa - ea));
  const newB = Math.round(ratingB + k * (sb - eb));
  return [newA, newB];
}

/** Order two player ids so playerA is always the smaller string (stable storage) */
export function orderedPair(
  id1: string,
  id2: string,
): { playerAId: string; playerBId: string } {
  return id1 < id2
    ? { playerAId: id1, playerBId: id2 }
    : { playerAId: id2, playerBId: id1 };
}

/**
 * Map outcome from UI (winner/loser) to stored outcome relative to ordered A/B
 */
export function outcomeForOrderedPair(
  playerAId: string,
  playerBId: string,
  winnerId: string | null,
  isDraw: boolean,
): Outcome {
  if (isDraw) return "DRAW";
  if (!winnerId) return "DRAW";
  if (winnerId === playerAId) return "WIN_A";
  if (winnerId === playerBId) return "WIN_B";
  throw new Error("winnerId must match one of the players");
}
