import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "pool_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 14; // 14 days

function sessionSecret(): string | null {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) return null;
  return s;
}

function sign(payload: string): string {
  const secret = sessionSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(playerId: string): string {
  if (!sessionSecret()) {
    throw new Error(
      "SESSION_SECRET must be set (min 16 characters). Add it to .env and Railway variables.",
    );
  }
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payload = Buffer.from(
    JSON.stringify({ playerId, exp }),
    "utf8",
  ).toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function readSessionToken(
  token: string | undefined,
): { playerId: string } | null {
  if (!token || !sessionSecret()) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(payload);
  if (!expected) return null;
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const raw = Buffer.from(payload, "base64url").toString("utf8");
    const data = JSON.parse(raw) as { playerId?: string; exp?: number };
    if (typeof data.playerId !== "string" || typeof data.exp !== "number")
      return null;
    if (Math.floor(Date.now() / 1000) > data.exp) return null;
    return { playerId: data.playerId };
  } catch {
    return null;
  }
}

export async function getSessionPlayerId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return readSessionToken(token)?.playerId ?? null;
}

export function randomSessionSecret(): string {
  return randomBytes(32).toString("hex");
}
