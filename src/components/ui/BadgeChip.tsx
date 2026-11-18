import { AlertTriangle, Clock3, Gavel, Hourglass, ShieldCheck, Skull } from "lucide-react";
import type { ReactNode } from "react";

export type BadgeKind =
  "retro" | "offbrand" | "pending" | "unverified" | "disputed" | "verified" | "voided";

const STYLES: Readonly<Record<BadgeKind, { readonly color: string; readonly icon: ReactNode }>> = {
  retro: { color: "#38BDF8", icon: <Clock3 className="h-3 w-3" /> },
  offbrand: { color: "#F97316", icon: <Skull className="h-3 w-3" /> },
  pending: { color: "#C084FC", icon: <Hourglass className="h-3 w-3" /> },
  unverified: { color: "#EAB308", icon: <AlertTriangle className="h-3 w-3" /> },
  disputed: { color: "#EF4444", icon: <Gavel className="h-3 w-3" /> },
  voided: { color: "#EF4444", icon: <Gavel className="h-3 w-3" /> },
  verified: { color: "#22C55E", icon: <ShieldCheck className="h-3 w-3" /> },
};

export function BadgeChip({
  kind,
  children,
}: {
  readonly kind: BadgeKind;
  readonly children: ReactNode;
}) {
  const { color, icon } = STYLES[kind];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold"
      style={{ color, borderColor: `${color}55`, background: `${color}14` }}
    >
      {icon}
      {children}
    </span>
  );
}
