import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPin, validatePinFormat } from "@/lib/pin";
import { finalizePendingMatch } from "@/lib/finalize-match";
import { getSessionPlayerId } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const sessionId = await getSessionPlayerId();
    if (!sessionId) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }

    const { id: matchId } = await context.params;
    const body = await request.json();
    const pin = String(body.pin ?? "");
    const fmt = validatePinFormat(pin);
    if (fmt) {
      return NextResponse.json({ error: fmt }, { status: 400 });
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    if (match.status !== "PENDING") {
      return NextResponse.json(
        { error: "This match is not waiting for confirmation." },
        { status: 400 },
      );
    }
    if (match.loggedById === sessionId) {
      return NextResponse.json(
        { error: "You cannot confirm your own result entry." },
        { status: 403 },
      );
    }
    if (match.playerAId !== sessionId && match.playerBId !== sessionId) {
      return NextResponse.json(
        { error: "You are not a player in this match." },
        { status: 403 },
      );
    }

    const player = await prisma.player.findUniqueOrThrow({ where: { id: sessionId } });
    if (!verifyPin(pin, player.pinHash)) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    await prisma.$transaction((tx) => finalizePendingMatch(tx, matchId));
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
