"use client";

import { Info } from "lucide-react";
import { useMemo, useState } from "react";
import type { Challenge } from "@/types/domain";
import { Segmented } from "@/components/ui/Controls";
import { RankRow } from "@/components/ui/RankRow";
import { Sheet } from "@/components/ui/Sheet";
import { ME_ID } from "@/data/mock-data";
import { personalDex } from "@/domain/dex";
import { SCORING_HINT, SCORING_LABEL, todayCapNotice, type ClubVsClubMode } from "@/domain/scoring";
import { daysUntil, dayKey, formatDateRange } from "@/domain/time";
import { useAppState } from "@/state/AppStateProvider";
import { clubRows, individualRows } from "@/state/challenge-selectors";
import { useTodayKey } from "@/state/hooks";
import { challengeCheckIns, memberById, myClubs } from "@/state/selectors";
import { BrandRulePill, CapPill } from "./ChallengeCard";

type View = "individual" | ClubVsClubMode;

const VIEWS: readonly { readonly value: View; readonly label: string }[] = [
  { value: "individual", label: "Individual" },
  { value: "total", label: "Club vs. Club (Total)" },
  { value: "average", label: "(Average)" },
];

const ORDINAL = ["1st", "2nd", "3rd"];

function CapExplainer({ challenge }: { readonly challenge: Challenge }) {
  const { state } = useAppState();
  const todayKey = useTodayKey();
  const notice = todayCapNotice(challenge, challengeCheckIns(state, challenge.id), {
    memberId: ME_ID,
    todayKey,
  });
  const capped = challenge.scoring === "total_cans" || challenge.scoring === "flavor_hunter";
  if (!capped || notice.cansToday <= challenge.dailyPointCap) return null;
  const nth = ORDINAL[notice.cansToday - 1] ?? `${notice.cansToday}th`;
  const dex = personalDex(state.checkIns, ME_ID);
  const pastCap = challengeCheckIns(state, challenge.id)
    .filter((c) => c.memberId === ME_ID && dayKey(c.consumedAt) === todayKey)
    .toSorted((a, b) => a.consumedAt.localeCompare(b.consumedAt))
    .slice(challenge.dailyPointCap);
  const unlockedSlot = pastCap.some(
    (c) => c.flavorId !== null && dex.get(c.flavorId)?.firstAt === c.consumedAt,
  );
  return (
    <div className="flex gap-3 rounded-2xl border border-status-unverified/40 bg-status-unverified/[0.08] p-3 text-xs leading-5 text-ink">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-status-unverified" />
      <p>
        <span className="font-bold text-status-unverified">
          Daily Point Cap ({challenge.dailyPointCap}/day):
        </span>{" "}
        Your {nth} can today gave +0 volume points here, but still counted +1 to Flavor Counts
        {unlockedSlot ? " & unlocked a new Flavor Dex slot" : " & your Flavor Dex history"}!
      </p>
    </div>
  );
}

function Standings({ challenge, view }: { readonly challenge: Challenge; readonly view: View }) {
  const { state } = useAppState();
  const clubIds = new Set(myClubs(state).map((c) => c.id));
  const rows = useMemo(
    () => (view === "individual" ? null : clubRows(state, challenge, view)),
    [state, challenge, view],
  );
  const people = useMemo(() => individualRows(state, challenge), [state, challenge]);
  if (rows !== null) {
    return (
      <ol className="flex flex-col gap-1.5">
        {rows.map((r, i) => (
          <RankRow
            key={r.id}
            rank={i + 1}
            name={r.name}
            value={r.score.toLocaleString("en-US")}
            sub={`${r.members} members${view === "average" ? " • pts / member" : ""}`}
            highlight={clubIds.has(r.id)}
          />
        ))}
      </ol>
    );
  }
  return (
    <ol className="flex flex-col gap-1.5">
      {people.slice(0, 15).map((r, i) => (
        <RankRow
          key={r.id}
          rank={i + 1}
          name={r.name}
          member={r.memberId === null ? undefined : memberById(state, r.memberId)}
          value={r.points}
          sub={r.cappedOut > 0 ? `${r.cappedOut} cans past the cap` : undefined}
          highlight={r.id === ME_ID}
        />
      ))}
    </ol>
  );
}

export function ChallengeDetailSheet({
  challengeId,
  onClose,
}: {
  readonly challengeId: string;
  readonly onClose: () => void;
}) {
  const { state, dispatch } = useAppState();
  const [view, setView] = useState<View>("individual");
  const challenge = state.challenges.find((c) => c.id === challengeId);
  if (challenge === undefined) return null;
  const club = state.clubs.find((c) => c.id === challenge.clubId);
  const subtitle =
    challenge.scope === "community" ? "Community Challenge" : `${club?.name ?? "Club"} Challenge`;
  const footer = (
    <button
      type="button"
      onClick={() => dispatch({ type: "toggle_join_challenge", challengeId })}
      className={challenge.joined ? "btn-ghost w-full" : "btn-primary w-full"}
    >
      {challenge.joined ? "Leave Challenge" : "Join Challenge"}
    </button>
  );

  return (
    <Sheet title={challenge.name} subtitle={subtitle} onClose={onClose} footer={footer} tall>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          <BrandRulePill challenge={challenge} />
          <CapPill cap={challenge.dailyPointCap} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Scoring", SCORING_LABEL[challenge.scoring]],
            ["Players", challenge.playerCount.toLocaleString("en-US")],
            ["Ends in", `${daysUntil(state.nowIso, challenge.endsAt)}d`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-carbon p-2.5">
              <p className="text-[10px] uppercase tracking-wider text-ink-faint">{label}</p>
              <p className="metric mt-0.5 text-sm font-bold">{value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-muted">
          {SCORING_HINT[challenge.scoring]} •{" "}
          {formatDateRange(challenge.startsAt, challenge.endsAt)}
        </p>
        {challenge.joined && <CapExplainer challenge={challenge} />}
        {challenge.scope === "community" && (
          <Segmented options={VIEWS} value={view} onChange={setView} />
        )}
        <Standings
          challenge={challenge}
          view={challenge.scope === "community" ? view : "individual"}
        />
      </div>
    </Sheet>
  );
}
