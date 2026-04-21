import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";

const include = {
  playerA: { select: { id: true, name: true } },
  playerB: { select: { id: true, name: true } },
  loggedBy: { select: { id: true, name: true } },
} as const;

export async function GET() {
  const playerId = await getSessionPlayerId();
  if (!playerId) {
    return NextResponse.json({
      needsMyApproval: [] as unknown[],
      waitingOnOpponent: [] as unknown[],
    });
  }

  const pending = await prisma.match.findMany({
    where: {
      status: "PENDING",
      OR: [{ playerAId: playerId }, { playerBId: playerId }],
    },
    orderBy: { playedAt: "desc" },
    take: 50,
    include,
  });

  const needsMyApproval = pending.filter((m) => m.loggedById !== playerId);
  const waitingOnOpponent = pending.filter((m) => m.loggedById === playerId);

  return NextResponse.json({ needsMyApproval, waitingOnOpponent });
}
