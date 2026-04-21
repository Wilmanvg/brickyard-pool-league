"use client";

import { useMemo, useState } from "react";

type Player = { id: string; name: string };

export function CompareClient({ players }: { players: Player[] }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    winsForQueryA: number;
    winsForQueryB: number;
    draws: number;
    total: number;
    queryPlayerAId: string;
    queryPlayerBId: string;
  } | null>(null);

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of players) m.set(p.id, p.name);
    return m;
  }, [players]);

  async function loadStats() {
    if (!a || !b || a === b) return;
    setLoading(true);
    setError(null);
    setStats(null);
    try {
      const res = await fetch(
        `/api/head-to-head?${new URLSearchParams({ a, b }).toString()}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load");
        return;
      }
      setStats(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (players.length < 2) {
    return (
      <p className="text-[var(--muted)]">
        Add at least two players to compare head-to-head records.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-[var(--muted)]">Player 1</span>
          <select
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={a}
            onChange={(e) => {
              setA(e.target.value);
              setStats(null);
            }}
          >
            <option value="">Select…</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-[var(--muted)]">Player 2</span>
          <select
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={b}
            onChange={(e) => {
              setB(e.target.value);
              setStats(null);
            }}
          >
            <option value="">Select…</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={loadStats}
        disabled={loading || !a || !b || a === b}
        className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Loading…" : "Show record"}
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {stats && stats.total > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/50 p-4">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-[var(--muted)]">
                {nameById.get(stats.queryPlayerAId)}
              </dt>
              <dd className="text-3xl font-semibold tabular-nums">
                {stats.winsForQueryA}
              </dd>
              <dd className="text-xs text-[var(--muted)]">wins</dd>
            </div>
            <div>
              <dt className="text-sm text-[var(--muted)]">Draws</dt>
              <dd className="text-3xl font-semibold tabular-nums">
                {stats.draws}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-[var(--muted)]">
                {nameById.get(stats.queryPlayerBId)}
              </dt>
              <dd className="text-3xl font-semibold tabular-nums">
                {stats.winsForQueryB}
              </dd>
              <dd className="text-xs text-[var(--muted)]">wins</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-[var(--muted)]">
            {stats.total} game{stats.total === 1 ? "" : "s"} between these two.
          </p>
        </div>
      )}

      {stats && stats.total === 0 && (
        <p className="text-sm text-[var(--muted)]">
          No matches between these two yet.
        </p>
      )}
    </div>
  );
}
