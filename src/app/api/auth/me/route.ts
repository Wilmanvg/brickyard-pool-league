import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";
import { playerPublicSelect } from "@/lib/player-select";

export async function GET() {
  const id = await getSessionPlayerId();
  if (!id) {
    return NextResponse.json({ player: null });
  }
  const player = await prisma.player.findUnique({
    where: { id },
    select: playerPublicSelect,
  });
  return NextResponse.json({ player });
}
