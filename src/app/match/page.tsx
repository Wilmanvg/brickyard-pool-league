import { prisma } from "@/lib/prisma";
import { MatchForm } from "./match-form";

export const dynamic = "force-dynamic";

export default async function MatchPage() {
  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Log a match</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Winner gets Elo points from the loser (standard Elo). Draws split
          points.
        </p>
      </div>
      <MatchForm players={players} />
    </div>
  );
}
