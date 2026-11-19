"use client";

import { CalendarDays, Globe2, Users } from "lucide-react";
import type { Challenge } from "@/types/domain";
import { SCORING_LABEL } from "@/domain/scoring";
import { daysUntil, formatDateRange } from "@/domain/time";
import { useAppState } from "@/state/AppStateProvider";
import { useUi } from "@/state/UiProvider";

export function BrandRulePill({ challenge }: { readonly challenge: Challenge }) {
  const monster = challenge.brandRule === "monster_only";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${monster ? "bg-volt/10 text-volt" : "bg-status-offbrand/10 text-status-offbrand"}`}
    >
      {monster ? "Monster Only" : "Any Energy Drink"}
    </span>
  );
}

export function CapPill({ cap }: { readonly cap: number }) {
  return (
    <span className="metric rounded-full border border-hairline px-2 py-0.5 text-[10px] text-ink-muted">
      Daily Point Cap: {cap} can{cap === 1 ? "" : "s"}/day
    </span>
  );
}

function ChallengeCardHeader({
  challenge,
  clubName,
}: {
  readonly challenge: Challenge;
  readonly clubName: string | undefined;
}) {
  const community = challenge.scope === "community";
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="eyebrow flex items-center gap-1.5">
          {community ? (
            <Globe2 className="h-3.5 w-3.5 text-series-ultra" />
          ) : (
            <Users className="h-3.5 w-3.5 text-volt" />
          )}
          {community ? "Community Challenge" : (clubName ?? "Club Challenge")}
        </p>
        <h3 className="mt-1 truncate font-display text-2xl font-bold uppercase leading-tight">
          {challenge.name}
        </h3>
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${challenge.joined ? "bg-volt text-void" : "border border-hairline text-ink-muted"}`}
      >
        {challenge.joined ? "Joined" : "Open"}
      </span>
    </div>
  );
}

export function ChallengeCard({ challenge }: { readonly challenge: Challenge }) {
  const { state } = useAppState();
  const { openSheet } = useUi();
  const club = state.clubs.find((c) => c.id === challenge.clubId);
  const left = daysUntil(state.nowIso, challenge.endsAt);
  const ended = challenge.endsAt < state.nowIso;
  return (
    <button
      type="button"
      onClick={() => openSheet({ kind: "challenge", challengeId: challenge.id })}
      className="card press block w-full p-4 text-left transition-colors hover:border-volt/40"
    >
      <ChallengeCardHeader challenge={challenge} clubName={club?.name} />
      <div className="mt-3 flex flex-wrap gap-1.5">
        <BrandRulePill challenge={challenge} />
        <span className="rounded-full bg-graphite px-2 py-0.5 text-[10px] font-semibold text-ink">
          {SCORING_LABEL[challenge.scoring]}
        </span>
        <CapPill cap={challenge.dailyPointCap} />
      </div>
      <div className="metric mt-3 flex items-center justify-between text-[11px] text-ink-faint">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDateRange(challenge.startsAt, challenge.endsAt)}
        </span>
        <span>
          {challenge.playerCount.toLocaleString("en-US")} players •{" "}
          {ended ? "Ended" : `${left}d left`}
        </span>
      </div>
    </button>
  );
}
