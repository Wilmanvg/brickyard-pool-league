import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pool League",
  description: "Weekly pool stats and Elo rankings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <header className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Pool League
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
              <Link href="/" className="hover:text-[var(--foreground)]">
                Leaderboard
              </Link>
              <Link href="/match" className="hover:text-[var(--foreground)]">
                Log match
              </Link>
              <Link href="/players" className="hover:text-[var(--foreground)]">
                Players
              </Link>
              <Link href="/compare" className="hover:text-[var(--foreground)]">
                Head-to-head
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
