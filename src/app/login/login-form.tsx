"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Player = { id: string; name: string };

export function LoginForm({ players }: { players: Player[] }) {
  const router = useRouter();
  const [playerId, setPlayerId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not sign in");
        return;
      }
      setPin("");
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (players.length === 0) {
    return (
      <p className="text-[var(--muted)]">
        Add players first, each with a PIN, on the{" "}
        <a href="/players" className="text-[var(--accent)] underline">
          Players
        </a>{" "}
        page.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <label className="block space-y-2">
        <span className="text-sm text-[var(--muted)]">Player</span>
        <select
          required
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
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
        <span className="text-sm text-[var(--muted)]">PIN</span>
        <input
          required
          type="password"
          autoComplete="current-password"
          minLength={4}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading || !playerId}
        className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
