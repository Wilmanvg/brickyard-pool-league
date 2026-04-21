"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddPlayerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not add player");
        return;
      }
      setMessage(`Added ${data.name}`);
      setName("");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="flex max-w-md flex-col gap-3 sm:flex-row sm:items-end"
      >
        <label className="block min-w-0 flex-1 space-y-2">
          <span className="text-sm text-[var(--muted)]">Name</span>
          <input
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
            placeholder="e.g. Alex"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
        </label>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add player"}
        </button>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {message && <p className="text-sm text-[var(--success)]">{message}</p>}
    </>
  );
}
