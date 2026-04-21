import { PendingMatches } from "@/components/pending-matches";
import { prisma } from "@/lib/prisma";
import { DEFAULT_ELO, K_FACTOR } from "@/lib/elo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const players = await prisma.player.findMany({
    orderBy: [{ eloRating: "desc" }, { name: "asc" }],
  });

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
          <a href="/players" className="text-[var(--accent)] underline">
            Players
          </a>{" "}
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
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  Record
                </th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr
                  key={p.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--card)]/50"
                >
                  <td className="px-4 py-3 text-[var(--muted)]">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 tabular-nums">{p.eloRating}</td>
                  <td className="hidden px-4 py-3 tabular-nums text-[var(--muted)] sm:table-cell">
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
