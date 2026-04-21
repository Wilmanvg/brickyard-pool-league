import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  outcomeForOrderedPair,
  orderedPair,
  updateElo,
  type Outcome,
} from "@/lib/elo";

export async function GET() {
  const matches = await prisma.match.findMany({
    orderBy: { playedAt: "desc" },
    take: 100,
    include: {
      playerA: { select: { id: true, name: true } },
      playerB: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(matches);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const player1Id = String(body.player1Id ?? "").trim();
    const player2Id = String(body.player2Id ?? "").trim();
    const isDraw = Boolean(body.isDraw);
    const winnerId = body.winnerId != null ? String(body.winnerId).trim() : null;
    const notes =
      body.notes != null ? String(body.notes).trim().slice(0, 500) : null;

    if (!player1Id || !player2Id) {
      return NextResponse.json(
        { error: "player1Id and player2Id are required" },
        { status: 400 },
      );
    }
    if (player1Id === player2Id) {
      return NextResponse.json(
        { error: "Players must be different" },
        { status: 400 },
      );
    }
    if (!isDraw && !winnerId) {
      return NextResponse.json(
        { error: "Pick a winner or mark as draw" },
        { status: 400 },
      );
    }
    if (!isDraw && winnerId !== player1Id && winnerId !== player2Id) {
      return NextResponse.json(
        { error: "Winner must be one of the two players" },
        { status: 400 },
      );
    }

    const { playerAId, playerBId } = orderedPair(player1Id, player2Id);
    const outcome: Outcome = outcomeForOrderedPair(
      playerAId,
      playerBId,
      isDraw ? null : winnerId,
      isDraw,
    );

    const result = await prisma.$transaction(async (tx) => {
      const [a, b] = await Promise.all([
        tx.player.findUniqueOrThrow({ where: { id: playerAId } }),
        tx.player.findUniqueOrThrow({ where: { id: playerBId } }),
      ]);

      const [newA, newB] = updateElo(a.eloRating, b.eloRating, outcome);

      const match = await tx.match.create({
        data: {
          playerAId,
          playerBId,
          outcome,
          notes: notes || null,
        },
      });

      const aWins = outcome === "WIN_A" ? 1 : 0;
      const aLosses = outcome === "WIN_B" ? 1 : 0;
      const aDraws = outcome === "DRAW" ? 1 : 0;
      const bWins = outcome === "WIN_B" ? 1 : 0;
      const bLosses = outcome === "WIN_A" ? 1 : 0;
      const bDraws = outcome === "DRAW" ? 1 : 0;

      await tx.player.update({
        where: { id: playerAId },
        data: {
          eloRating: newA,
          matchesPlayed: { increment: 1 },
          wins: { increment: aWins },
          losses: { increment: aLosses },
          draws: { increment: aDraws },
        },
      });
      await tx.player.update({
        where: { id: playerBId },
        data: {
          eloRating: newB,
          matchesPlayed: { increment: 1 },
          wins: { increment: bWins },
          losses: { increment: bLosses },
          draws: { increment: bDraws },
        },
      });

      return { match, ratings: { playerA: newA, playerB: newB } };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
