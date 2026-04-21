import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { playerPublicSelect } from "@/lib/player-select";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await prisma.player.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: p ? `${p.name} · Pool League` : "Player" };
}

type Outcome = "WIN_A" | "WIN_B" | "DRAW";

function resultLabel(
  outcome: string,
  viewerIsA: boolean,
): { label: string; kind: "win" | "loss" | "draw" } {
  const o = outcome as Outcome;
  if (o === "DRAW") return { label: "Draw", kind: "draw" };
  const viewerWon =
    (viewerIsA && o === "WIN_A") || (!viewerIsA && o === "WIN_B");
  return viewerWon
    ? { label: "Win", kind: "win" }
    : { label: "Loss", kind: "loss" };
}

function formatDelta(delta: number | null | undefined): string {
  if (delta == null) return "—";
  if (delta === 0) return "0";
  return delta > 0 ? `+${delta}` : `${delta}`;
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const player = await prisma.player.findUnique({
    where: { id },
    select: playerPublicSelect,
  });
  if (!player) notFound();

  const matches = await prisma.match.findMany({
    where: {
      status: "CONFIRMED",
      OR: [{ playerAId: id }, { playerBId: id }],
    },
    orderBy: { playedAt: "desc" },
    include: {
      playerA: { select: { id: true, name: true } },
      playerB: { select: { id: true, name: true } },
    },
  });

  const rows = matches.map((m) => {
    const viewerIsA = m.playerAId === id;
    const opponent = viewerIsA ? m.playerB : m.playerA;
    const { label, kind } = resultLabel(m.outcome, viewerIsA);
    const delta = viewerIsA ? m.eloDeltaA : m.eloDeltaB;
    return {
      id: m.id,
      playedAt: m.playedAt,
      opponent,
      resultLabel: label,
      resultKind: kind,
      eloDelta: delta,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← Leaderboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {player.name}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Elo {player.eloRating} · {player.wins}W – {player.losses}L
          {player.draws > 0 ? ` – ${player.draws}D` : ""} ·{" "}
          {matches.length} confirmed game{matches.length === 1 ? "" : "s"}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">
          No confirmed games yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--card)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Opponent</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">Elo Δ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--card)]/50"
                >
                  <td className="px-4 py-3 tabular-nums text-[var(--muted)]">
                    {r.playedAt.toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/players/${r.opponent.id}`}
                      className="font-medium text-[var(--accent)] hover:underline"
                    >
                      {r.opponent.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        r.resultKind === "win"
                          ? "text-emerald-400"
                          : r.resultKind === "loss"
                            ? "text-rose-400"
                            : "text-[var(--muted)]"
                      }
                    >
                      {r.resultLabel}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 tabular-nums ${
                      r.eloDelta == null
                        ? "text-[var(--muted)]"
                        : r.eloDelta > 0
                          ? "text-emerald-400"
                          : r.eloDelta < 0
                            ? "text-rose-400"
                            : "text-[var(--muted)]"
                    }`}
                  >
                    {formatDelta(r.eloDelta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-[var(--border)] px-4 py-2 text-xs text-[var(--muted)]">
            Elo Δ is recorded when the match is confirmed. Older games may show
            “—” if played before this was tracked.
          </p>
        </div>
      )}
    </div>
  );
}
