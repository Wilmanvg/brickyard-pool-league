import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPin, validatePinFormat } from "@/lib/pin";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

const MAX_AGE_SEC = 60 * 60 * 24 * 14;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const playerId = String(body.playerId ?? "").trim();
    const pin = String(body.pin ?? "");

    const fmt = validatePinFormat(pin);
    if (fmt) {
      return NextResponse.json({ error: fmt }, { status: 400 });
    }
    if (!playerId) {
      return NextResponse.json({ error: "playerId is required" }, { status: 400 });
    }

    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      return NextResponse.json({ error: "Invalid player or PIN" }, { status: 401 });
    }

    if (!verifyPin(pin, player.pinHash)) {
      return NextResponse.json({ error: "Invalid player or PIN" }, { status: 401 });
    }

    const token = createSessionToken(player.id);
    const res = NextResponse.json({
      player: {
        id: player.id,
        name: player.name,
      },
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_SEC,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("SESSION_SECRET")) {
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
