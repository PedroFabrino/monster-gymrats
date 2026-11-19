"use client";

import { BarChart3, LayoutGrid, Plus, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useUi } from "@/state/UiProvider";

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: ReactNode;
}

const LEFT: readonly NavItem[] = [
  { href: "/clubs", label: "Clubs", icon: <Users className="h-5 w-5" /> },
  { href: "/challenges", label: "Challenges", icon: <Trophy className="h-5 w-5" /> },
];
const RIGHT: readonly NavItem[] = [
  { href: "/dex", label: "Flavor Dex", icon: <LayoutGrid className="h-5 w-5" /> },
  { href: "/stats", label: "Stats", icon: <BarChart3 className="h-5 w-5" /> },
];

function NavLink({ item, active }: { readonly item: NavItem; readonly active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`press flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${active ? "text-volt" : "text-ink-faint hover:text-ink-muted"}`}
    >
      {item.icon}
      {item.label}
      <span className={`h-1 w-1 rounded-full ${active ? "bg-volt" : "bg-transparent"}`} />
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { openSheet } = useUi();
  const isActive = (href: string) => pathname.startsWith(href);
  return (
    <nav className="absolute inset-x-0 bottom-0 z-30 border-t border-hairline bg-carbon/90 pb-[max(env(safe-area-inset-bottom),8px)] backdrop-blur-xl">
      <div className="flex items-end px-2">
        {LEFT.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={() => openSheet({ kind: "check_in" })}
            aria-label="New Check-In"
            className="press volt-glow -mt-7 flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-volt text-void transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-7 w-7" strokeWidth={3} />
            <span className="font-display text-[10px] font-bold uppercase leading-none">Log</span>
          </button>
        </div>
        {RIGHT.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </div>
    </nav>
  );
}
