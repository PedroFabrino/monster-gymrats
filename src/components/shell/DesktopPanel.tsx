"use client";

import { Smartphone } from "lucide-react";
import Link from "next/link";
import { Wordmark } from "./TopBar";

const SCREENS: readonly { readonly href: string; readonly label: string }[] = [
  { href: "/join/night-shift", label: "Invite Landing & Onboarding" },
  { href: "/clubs", label: "Clubs Home" },
  { href: "/clubs/night-shift", label: "Club Timeline" },
  { href: "/challenges", label: "Challenges Hub" },
  { href: "/dex", label: "Flavor Dex" },
  { href: "/stats", label: "Stats & Profile" },
];

export function DesktopPanel({
  framed,
  onToggleFrame,
}: {
  readonly framed: boolean;
  readonly onToggleFrame: () => void;
}) {
  return (
    <aside className="hidden w-72 flex-col gap-6 lg:flex">
      <Wordmark />
      <p className="text-sm text-ink-muted">
        Interactive prototype. Everything is clickable: post Check-Ins, react, Call BS, and watch
        the Flavor Dex fill up.
      </p>
      <div className="flex flex-col gap-1">
        <span className="eyebrow mb-1">Jump to screen</span>
        {SCREENS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-carbon hover:text-ink"
          >
            {s.label}
          </Link>
        ))}
      </div>
      <button type="button" onClick={onToggleFrame} className="btn-ghost justify-start">
        <Smartphone className="h-4 w-4" />
        {framed ? "Hide phone bezel" : "Show phone bezel"}
      </button>
    </aside>
  );
}
