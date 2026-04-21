"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddPlayerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (pin !== pinConfirm) {
      setError("PINs do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not add player");
        return;
      }
      setMessage(`Added ${data.name}`);
      setName("");
      setPin("");
      setPinConfirm("");
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
        className="grid max-w-lg gap-4 sm:grid-cols-2"
      >
        <label className="block space-y-2 sm:col-span-2">
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
        <label className="block space-y-2">
          <span className="text-sm text-[var(--muted)]">PIN (min 4)</span>
          <input
            required
            type="password"
            autoComplete="new-password"
            minLength={4}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-[var(--muted)]">Confirm PIN</span>
          <input
            required
            type="password"
            autoComplete="new-password"
            minLength={4}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={pinConfirm}
            onChange={(e) => setPinConfirm(e.target.value)}
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading || !name.trim() || pin.length < 4}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Adding…" : "Add player"}
          </button>
        </div>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {message && <p className="text-sm text-[var(--success)]">{message}</p>}
    </>
  );
}
