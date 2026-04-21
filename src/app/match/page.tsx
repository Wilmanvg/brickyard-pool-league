import { prisma } from "@/lib/prisma";
import { playerPublicSelect } from "@/lib/player-select";
import { MatchForm } from "./match-form";

export const dynamic = "force-dynamic";

export default async function MatchPage() {
  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
    select: playerPublicSelect,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Log a match</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Sign in first. You can only log games you played in. The other player
          must confirm before Elo updates. Draws split points once confirmed.
        </p>
      </div>
      <MatchForm players={players} />
    </div>
  );
}
