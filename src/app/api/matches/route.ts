import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  outcomeForOrderedPair,
  orderedPair,
  type Outcome,
} from "@/lib/elo";
import { getSessionPlayerId } from "@/lib/session";

const matchInclude = {
  playerA: { select: { id: true, name: true } },
  playerB: { select: { id: true, name: true } },
  loggedBy: { select: { id: true, name: true } },
} as const;

export async function GET() {
  const matches = await prisma.match.findMany({
    where: { status: "CONFIRMED" },
    orderBy: { playedAt: "desc" },
    take: 100,
    include: matchInclude,
  });
  return NextResponse.json(matches);
}

export async function POST(request: Request) {
  try {
    const loggedById = await getSessionPlayerId();
    if (!loggedById) {
      return NextResponse.json(
        { error: "Sign in on the Login page to log a match." },
        { status: 401 },
      );
    }

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
    if (loggedById !== player1Id && loggedById !== player2Id) {
      return NextResponse.json(
        { error: "You can only log matches you played in." },
        { status: 403 },
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

    const match = await prisma.match.create({
      data: {
        playerAId,
        playerBId,
        outcome,
        notes: notes || null,
        status: "PENDING",
        loggedById,
      },
      include: matchInclude,
    });

    return NextResponse.json(
      {
        match,
        message:
          "Match submitted. Your opponent must confirm it before Elo updates.",
      },
      { status: 201 },
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
