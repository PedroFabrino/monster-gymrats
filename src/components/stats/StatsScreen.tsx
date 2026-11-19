"use client";

import { Share2, UserCog } from "lucide-react";
import { useMemo, useState } from "react";
import type { TimeWindow } from "@/types/domain";
import { TopBar } from "@/components/shell/TopBar";
import { Segmented } from "@/components/ui/Controls";
import { FLAVORS } from "@/data/flavors";
import { caffeineTotal } from "@/domain/stats";
import { isInWindow, TIME_WINDOW_LABEL } from "@/domain/time";
import { useAppState } from "@/state/AppStateProvider";
import { useUi } from "@/state/UiProvider";
import { myCheckIns } from "@/state/selectors";
import { FlavorLeaderboard } from "./FlavorLeaderboard";
import { StreakCard } from "./StreakCard";

const WINDOWS: readonly { readonly value: TimeWindow; readonly label: string }[] = (
  ["all", "year", "month", "week"] as const
).map((w) => ({ value: w, label: TIME_WINDOW_LABEL[w] }));

function SummaryCards({
  cans,
  flavors,
  caffeine,
}: {
  readonly cans: number;
  readonly flavors: number;
  readonly caffeine: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        ["Cans", cans.toLocaleString("en-US")],
        ["Flavors", String(flavors)],
        ["Caffeine", `${(caffeine / 1000).toFixed(1)}g`],
      ].map(([label, value]) => (
        <div key={label} className="card p-3">
          <p className="text-[10px] uppercase tracking-wider text-ink-faint">{label}</p>
          <p className="metric mt-0.5 text-xl font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}

function StatsActions({
  onProfile,
  onWrapped,
}: {
  readonly onProfile: () => void;
  readonly onWrapped: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button type="button" className="btn-ghost" onClick={onProfile}>
        <UserCog className="h-4 w-4 text-volt" /> Profile &amp; Alerts
      </button>
      <button type="button" className="btn-primary !text-base" onClick={onWrapped}>
        <Share2 className="h-4 w-4" /> Wrapped
      </button>
    </div>
  );
}

export function StatsScreen() {
  const { state } = useAppState();
  const { openSheet } = useUi();
  const [window, setWindow] = useState<TimeWindow>("month");
  const summary = useMemo(() => {
    const mine = myCheckIns(state).filter(
      (c) => c.status !== "voided" && isInWindow(c.consumedAt, window, state.nowIso),
    );
    return {
      cans: mine.length,
      flavors: new Set(mine.flatMap((c) => (c.flavorId === null ? [] : [c.flavorId]))).size,
      caffeine: caffeineTotal(mine, FLAVORS),
    };
  }, [state, window]);

  return (
    <>
      <TopBar title="Stats">
        <div className="mt-3">
          <Segmented options={WINDOWS} value={window} onChange={setWindow} />
        </div>
      </TopBar>
      <div className="flex flex-col gap-4 px-4 pt-4">
        <SummaryCards cans={summary.cans} flavors={summary.flavors} caffeine={summary.caffeine} />
        <FlavorLeaderboard window={window} />
        <StreakCard />
        <StatsActions
          onProfile={() => openSheet({ kind: "profile" })}
          onWrapped={() => openSheet({ kind: "wrapped" })}
        />
      </div>
    </>
  );
}
