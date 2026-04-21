import { prisma } from "@/lib/prisma";
import { playerPublicSelect } from "@/lib/player-select";
import { AddPlayerForm } from "./add-player-form";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
    select: playerPublicSelect,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Players</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Each player chooses a PIN (min 4 characters). PINs are used to sign in
          and to confirm or dispute match results.
        </p>
      </div>

      <AddPlayerForm />

      {players.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-[var(--muted)]">
            Roster ({players.length})
          </h2>
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
            {players.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <span className="font-medium">{p.name}</span>
                <span className="tabular-nums text-sm text-[var(--muted)]">
                  Elo {p.eloRating}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
