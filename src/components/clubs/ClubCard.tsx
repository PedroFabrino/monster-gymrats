"use client";

import { ChevronRight, Crown } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import type { Club } from "@/types/domain";
import { AvatarStack } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/Progress";
import { MONSTER_FLAVORS } from "@/data/flavors";
import { clubDex, dexProgress } from "@/domain/dex";
import { memberCounts } from "@/domain/stats";
import { useAppState } from "@/state/AppStateProvider";
import { useTodayKey } from "@/state/hooks";
import { clubCheckIns, memberById, todayCount } from "@/state/selectors";

export function ClubCard({ club }: { readonly club: Club }) {
  const { state } = useAppState();
  const today = useTodayKey();
  const stats = useMemo(() => {
    const checkIns = clubCheckIns(state, club.id);
    const leader = memberCounts(checkIns, { window: "month", nowIso: state.nowIso })[0];
    return {
      today: todayCount(checkIns, today),
      leader,
      dex: dexProgress(clubDex(checkIns), MONSTER_FLAVORS),
    };
  }, [state, club.id, today]);
  const members = club.memberIds.flatMap((id) => memberById(state, id) ?? []);
  const leader = stats.leader === undefined ? undefined : memberById(state, stats.leader.memberId);

  return (
    <Link
      href={`/clubs/${club.id}`}
      className="card group block p-4 transition-all hover:-translate-y-0.5 hover:border-volt/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-2xl font-bold uppercase tracking-tight">
            {club.name}
          </h3>
          <p className="truncate text-xs text-ink-muted">{club.tagline}</p>
        </div>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-volt" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AvatarStack members={members} />
          <span className="metric text-xs text-ink-faint">{members.length}</span>
        </div>
        <div className="text-right">
          <p className="metric text-xl font-bold text-volt">{stats.today}</p>
          <p className="text-[10px] uppercase tracking-wider text-ink-faint">cans today</p>
        </div>
      </div>
      {leader !== undefined && stats.leader !== undefined && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
          <Crown className="h-3.5 w-3.5 text-series-rehab" />
          Monthly leader <span className="font-semibold text-ink">{leader.displayName}</span>
          <span className="metric text-ink-faint">• {stats.leader.count} cans</span>
        </p>
      )}
      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="eyebrow !text-[10px]">Club Flavor Dex</span>
          <span className="metric text-ink-muted">
            {stats.dex.unlocked} / {stats.dex.total} Flavors • {stats.dex.pct}%
          </span>
        </div>
        <ProgressBar pct={stats.dex.pct} />
      </div>
    </Link>
  );
}
