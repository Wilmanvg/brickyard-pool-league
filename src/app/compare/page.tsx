import { prisma } from "@/lib/prisma";
import { CompareClient } from "./compare-client";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Head-to-head</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Win counts for games logged between two players (draws counted
          separately).
        </p>
      </div>
      <CompareClient players={players} />
    </div>
  );
}
