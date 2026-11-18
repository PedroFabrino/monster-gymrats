import { Crown } from "lucide-react";
import type { ReactNode } from "react";
import type { Member } from "@/types/domain";
import { Avatar } from "./Avatar";

const PODIUM = ["#FFB703", "#E2E8F0", "#D97706"];

interface RankRowProps {
  readonly rank: number;
  readonly name: string;
  readonly value: ReactNode;
  readonly sub?: ReactNode;
  readonly member?: Member | undefined;
  readonly highlight?: boolean;
}

export function RankRow({ rank, name, value, sub, member, highlight = false }: RankRowProps) {
  const podium = PODIUM[rank - 1];
  return (
    <li
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${highlight ? "border border-volt/40 bg-volt/[0.07]" : "bg-carbon"}`}
    >
      <span
        className="metric w-6 text-center text-sm font-bold"
        style={{ color: podium ?? "#6B7385" }}
      >
        {rank === 1 ? <Crown className="mx-auto h-4 w-4 fill-current" /> : rank}
      </span>
      {member !== undefined ? (
        <Avatar member={member} size="sm" />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-graphite font-display text-sm font-bold uppercase text-ink-muted">
          {name.slice(0, 2)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${highlight ? "text-volt" : "text-ink"}`}>
          {name}
        </p>
        {sub !== undefined && <div className="truncate text-[11px] text-ink-faint">{sub}</div>}
      </div>
      <span className="metric text-base font-bold text-ink">{value}</span>
    </li>
  );
}
