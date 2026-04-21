import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderedPair } from "@/lib/elo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idA = searchParams.get("a");
  const idB = searchParams.get("b");
  if (!idA || !idB || idA === idB) {
    return NextResponse.json(
      { error: "Query params a and b must be two different player ids" },
      { status: 400 },
    );
  }

  const { playerAId, playerBId } = orderedPair(idA, idB);

  const matches = await prisma.match.findMany({
    where: { playerAId, playerBId },
  });

  let winsForOrderedA = 0;
  let winsForOrderedB = 0;
  let draws = 0;

  for (const m of matches) {
    if (m.outcome === "DRAW") draws++;
    else if (m.outcome === "WIN_A") winsForOrderedA++;
    else if (m.outcome === "WIN_B") winsForOrderedB++;
  }

  const winsForQueryA =
    idA === playerAId ? winsForOrderedA : winsForOrderedB;
  const winsForQueryB =
    idB === playerAId ? winsForOrderedA : winsForOrderedB;

  return NextResponse.json({
    queryPlayerAId: idA,
    queryPlayerBId: idB,
    winsForQueryA,
    winsForQueryB,
    draws,
    total: matches.length,
  });
}
