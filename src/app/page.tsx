import Link from "next/link";
import { PendingMatches } from "@/components/pending-matches";
import { prisma } from "@/lib/prisma";
import { playerPublicSelect } from "@/lib/player-select";
import { DEFAULT_ELO, K_FACTOR } from "@/lib/elo";

export const dynamic = "force-dynamic";

type Outcome = "WIN_A" | "WIN_B" | "DRAW";

async function getCurrentWinStreak(playerId: string, maxLookback = 5) {
  const recent = await prisma.match.findMany({
    where: {
      status: "CONFIRMED",
      OR: [{ playerAId: playerId }, { playerBId: playerId }],
    },
    orderBy: { playedAt: "desc" },
    take: maxLookback,
    select: { playerAId: true, playerBId: true, outcome: true },
  });

  let streak = 0;
  for (const m of recent) {
    const o = m.outcome as Outcome;
    if (o === "DRAW") break;
    const isA = m.playerAId === playerId;
    const won = (isA && o === "WIN_A") || (!isA && o === "WIN_B");
    if (!won) break;
    streak += 1;
  }
  return streak;
}

export default async function HomePage() {
  const players = await prisma.player.findMany({
    orderBy: [{ eloRating: "desc" }, { name: "asc" }],
    select: playerPublicSelect,
  });

  const badgeById = new Map(
    await Promise.all(
      players.map(async (p) => {
        const streak = await getCurrentWinStreak(p.id, 5);
        const badge = streak >= 5 ? " 👑" : streak >= 3 ? " 🔥" : "";
        return [p.id, badge] as const;
      }),
    ),
  );

  return (
    <div className="space-y-6">
      <PendingMatches />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Elo starts at {DEFAULT_ELO}. K-factor {K_FACTOR} (tweak in{" "}
          <code className="rounded bg-[var(--card)] px-1 py-0.5 text-xs">
            src/lib/elo.ts
          </code>
          ). Only{" "}
          <span className="font-medium text-[var(--foreground)]">confirmed</span>{" "}
          matches affect ratings. Pending approvals appear above.
        </p>
      </div>

      {players.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-[var(--muted)]">
          No players yet. Add names on the{" "}
          <Link href="/players" className="text-[var(--accent)] underline">
            Players
          </Link>{" "}
          page, then log a match.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--card)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Elo</th>
                <th className="px-4 py-3 font-medium">Record</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr
                  key={p.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--card)]/50"
                >
                  <td className="px-4 py-3 text-[var(--muted)]">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/players/${p.id}`}
                      className="text-[var(--accent)] hover:underline"
                    >
                      {p.name}
                      {badgeById.get(p.id) ?? ""}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{p.eloRating}</td>
                  <td className="px-4 py-3 tabular-nums text-[var(--muted)]">
                    {p.wins}W – {p.losses}L
                    {p.draws > 0 ? ` – ${p.draws}D` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
