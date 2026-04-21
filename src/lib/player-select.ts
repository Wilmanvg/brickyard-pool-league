import type { Prisma } from "@prisma/client";

/** Fields safe to return to the browser (never includes pinHash) */
export const playerPublicSelect = {
  id: true,
  name: true,
  eloRating: true,
  matchesPlayed: true,
  wins: true,
  losses: true,
  draws: true,
  createdAt: true,
} satisfies Prisma.PlayerSelect;

export type PlayerPublic = Prisma.PlayerGetPayload<{
  select: typeof playerPublicSelect;
}>;
