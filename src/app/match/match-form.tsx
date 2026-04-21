"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Player = { id: string; name: string };

export function MatchForm({ players }: { players: Player[] }) {
  const router = useRouter();
  const [player1Id, setPlayer1Id] = useState("");
  const [player2Id, setPlayer2Id] = useState("");
  const [winnerId, setWinnerId] = useState("");
  const [isDraw, setIsDraw] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player1Id,
          player2Id,
          winnerId: isDraw ? null : winnerId,
          isDraw,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save match");
        return;
      }
      setSuccess("Match saved. Ratings updated.");
      setNotes("");
      setWinnerId("");
      setIsDraw(false);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (players.length < 2) {
    return (
      <p className="text-[var(--muted)]">
        Add at least two players before logging matches.
      </p>
    );
  }

  const same = player1Id && player2Id && player1Id === player2Id;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-[var(--muted)]">Player 1</span>
          <select
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={player1Id}
            onChange={(e) => setPlayer1Id(e.target.value)}
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
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={player2Id}
            onChange={(e) => setPlayer2Id(e.target.value)}
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

      {same && (
        <p className="text-sm text-amber-400">Choose two different players.</p>
      )}

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={isDraw}
          onChange={(e) => {
            setIsDraw(e.target.checked);
            if (e.target.checked) setWinnerId("");
          }}
          className="size-4 rounded border-[var(--border)]"
        />
        <span className="text-sm">Draw / tied game</span>
      </label>

      {!isDraw && (
        <label className="block space-y-2">
          <span className="text-sm text-[var(--muted)]">Winner</span>
          <select
            required={!isDraw}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)] sm:max-w-md"
            value={winnerId}
            onChange={(e) => setWinnerId(e.target.value)}
          >
            <option value="">Select winner…</option>
            {player1Id && (
              <option value={player1Id}>
                {players.find((p) => p.id === player1Id)?.name}
              </option>
            )}
            {player2Id && (
              <option value={player2Id}>
                {players.find((p) => p.id === player2Id)?.name}
              </option>
            )}
          </select>
        </label>
      )}

      <label className="block space-y-2">
        <span className="text-sm text-[var(--muted)]">Notes (optional)</span>
        <input
          type="text"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)]"
          placeholder="Table, location, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && (
        <p className="text-sm text-[var(--success)]">{success}</p>
      )}

      <button
        type="submit"
        disabled={loading || same || !player1Id || !player2Id}
        className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save match"}
      </button>
    </form>
  );
}
