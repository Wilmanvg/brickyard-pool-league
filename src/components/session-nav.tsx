"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Me = { id: string; name: string } | null;

export function SessionNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [player, setPlayer] = useState<Me | undefined>(undefined);

  const load = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = (await res.json()) as { player: Me };
    setPlayer(data.player);
  }, []);

  useEffect(() => {
    void load();
  }, [load, pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setPlayer(null);
    router.refresh();
  }

  if (player === undefined) {
    return (
      <span className="text-xs text-[var(--muted)]" aria-hidden>
        …
      </span>
    );
  }

  if (!player) {
    return (
      <Link
        href="/login"
        className="text-sm text-[var(--accent)] hover:underline"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-[var(--muted)]">Signed in as</span>
      <span className="font-medium text-[var(--foreground)]">{player.name}</span>
      <button
        type="button"
        onClick={() => void logout()}
        className="text-[var(--muted)] underline hover:text-[var(--foreground)]"
      >
        Sign out
      </button>
    </div>
  );
}
