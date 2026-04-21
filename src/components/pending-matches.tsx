"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type P = { id: string; name: string };
type PendingMatch = {
  id: string;
  outcome: string;
  playedAt: string;
  notes: string | null;
  playerA: P;
  playerB: P;
  loggedBy: P;
};

function outcomeLabel(m: PendingMatch): string {
  if (m.outcome === "DRAW") return "Recorded as a draw";
  const winner =
    m.outcome === "WIN_A" ? m.playerA.name : m.playerB.name;
  return `Recorded win: ${winner}`;
}

export function PendingMatches() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [needsMyApproval, setNeeds] = useState<PendingMatch[]>([]);
  const [waitingOnOpponent, setWaiting] = useState<PendingMatch[]>([]);
  const [pins, setPins] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    const me = (await meRes.json()) as { player: { id: string } | null };
    if (!me.player) {
      setSignedIn(false);
      setNeeds([]);
      setWaiting([]);
      return;
    }
    setSignedIn(true);
    const res = await fetch("/api/matches/pending");
    const data = (await res.json()) as {
      needsMyApproval: PendingMatch[];
      waitingOnOpponent: PendingMatch[];
    };
    setNeeds(data.needsMyApproval ?? []);
    setWaiting(data.waitingOnOpponent ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function confirm(id: string) {
    const pin = pins[id]?.trim() ?? "";
    if (pin.length < 4) {
      setError("Enter your PIN (min 4 characters) to confirm.");
      return;
    }
    setError(null);
    setLoadingId(id);
    try {
      const res = await fetch(`/api/matches/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not confirm");
        return;
      }
      setPins((p) => ({ ...p, [id]: "" }));
      await load();
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  async function reject(id: string) {
    const pin = pins[id]?.trim() ?? "";
    if (pin.length < 4) {
      setError("Enter your PIN to reject.");
      return;
    }
    setError(null);
    setLoadingId(id);
    try {
      const res = await fetch(`/api/matches/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not reject");
        return;
      }
      setPins((p) => ({ ...p, [id]: "" }));
      await load();
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  async function cancelOwn(id: string) {
    const pin = pins[`cancel:${id}`]?.trim() ?? "";
    if (pin.length < 4) {
      setError("Enter your PIN to cancel your entry.");
      return;
    }
    setError(null);
    setLoadingId(id);
    try {
      const res = await fetch(`/api/matches/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not cancel");
        return;
      }
      setPins((p) => ({ ...p, [`cancel:${id}`]: "" }));
      await load();
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  if (signedIn === false) {
    return (
      <section className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/40 p-4 text-sm text-[var(--muted)]">
        <a href="/login" className="text-[var(--accent)] underline">
          Sign in
        </a>{" "}
        to see matches waiting for your approval.
      </section>
    );
  }

  if (signedIn === null) {
    return null;
  }

  const total = needsMyApproval.length + waitingOnOpponent.length;
  if (total === 0) return null;

  return (
    <section className="space-y-4 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
      <h2 className="text-lg font-semibold text-amber-200/90">Pending matches</h2>
      <p className="text-sm text-[var(--muted)]">
        Elo updates only after the other player confirms (or rejects) the result.
      </p>
      {error && <p className="text-sm text-red-400">{error}</p>}

      {needsMyApproval.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--foreground)]">
            Needs your confirmation
          </h3>
          <ul className="space-y-3">
            {needsMyApproval.map((m) => (
              <li
                key={m.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3"
              >
                <p className="text-sm">
                  <span className="text-[var(--muted)]">Logged by</span>{" "}
                  <span className="font-medium">{m.loggedBy.name}</span>
                  <span className="text-[var(--muted)]"> · </span>
                  {m.playerA.name} vs {m.playerB.name}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">{outcomeLabel(m)}</p>
                {m.notes && (
                  <p className="mt-1 text-xs text-[var(--muted)]">Note: {m.notes}</p>
                )}
                <label className="mt-3 block space-y-1">
                  <span className="text-xs text-[var(--muted)]">Your PIN</span>
                  <input
                    type="password"
                    autoComplete="off"
                    className="w-full max-w-xs rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                    value={pins[m.id] ?? ""}
                    onChange={(e) =>
                      setPins((p) => ({ ...p, [m.id]: e.target.value }))
                    }
                  />
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={loadingId === m.id}
                    onClick={() => void confirm(m.id)}
                    className="rounded bg-[var(--success)] px-3 py-1.5 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
                  >
                    {loadingId === m.id ? "…" : "Confirm result"}
                  </button>
                  <button
                    type="button"
                    disabled={loadingId === m.id}
                    onClick={() => void reject(m.id)}
                    className="rounded border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--card)] disabled:opacity-50"
                  >
                    Reject (dispute)
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {waitingOnOpponent.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--foreground)]">
            Waiting on opponent
          </h3>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            {waitingOnOpponent.map((m) => (
              <li
                key={m.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)]/60 p-3"
              >
                <p>
                  {m.playerA.name} vs {m.playerB.name} — {outcomeLabel(m)}
                </p>
                <p className="mt-1 text-xs">Waiting for the other player to confirm.</p>
                <label className="mt-2 block space-y-1">
                  <span className="text-xs text-[var(--muted)]">Your PIN to cancel</span>
                  <input
                    type="password"
                    autoComplete="off"
                    className="w-full max-w-xs rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                    value={pins[`cancel:${m.id}`] ?? ""}
                    onChange={(e) =>
                      setPins((p) => ({ ...p, [`cancel:${m.id}`]: e.target.value }))
                    }
                  />
                </label>
                <button
                  type="button"
                  disabled={loadingId === m.id}
                  className="mt-2 text-xs text-amber-400 underline hover:text-amber-300 disabled:opacity-50"
                  onClick={() => void cancelOwn(m.id)}
                >
                  Cancel this entry
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
