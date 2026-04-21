import { prisma } from "@/lib/prisma";
import { playerPublicSelect } from "@/lib/player-select";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
    select: playerPublicSelect,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Choose your player and enter your PIN. You need to be signed in to log
          a match; confirming results always asks for your PIN again.
        </p>
      </div>
      <LoginForm players={players} />
    </div>
  );
}
