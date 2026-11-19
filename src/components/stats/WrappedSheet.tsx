"use client";

import { Crown, Flame, Share2 } from "lucide-react";
import { useMemo } from "react";
import { Wordmark } from "@/components/shell/TopBar";
import { CanArt } from "@/components/ui/CanArt";
import { Sheet } from "@/components/ui/Sheet";
import { MONSTER_FLAVORS } from "@/data/flavors";
import { dexProgress } from "@/domain/dex";
import { localFlavorCounts, type FlavorCount } from "@/domain/stats";
import { useAppState } from "@/state/AppStateProvider";
import { myCrownIds, myDexCells } from "@/state/dex-selectors";
import { useMe, useStreak } from "@/state/hooks";
import { useUi } from "@/state/UiProvider";
import { flavorById, myCheckIns } from "@/state/selectors";

function TopFlavorsList({ top }: { readonly top: readonly FlavorCount[] }) {
  return (
    <ol className="mt-5 flex flex-col gap-2">
      {top.map((t, i) => {
        const f = flavorById(t.flavorId);
        return (
          <li key={t.flavorId} className="flex items-center gap-3">
            <span className="metric w-4 text-sm font-bold text-ink-faint">{i + 1}</span>
            {f !== undefined && <CanArt color={f.color} accent={f.accent} className="h-8" />}
            <span className="flex-1 truncate text-sm font-semibold">{f?.name}</span>
            <span className="metric text-xs text-ink-muted">x{t.count}</span>
          </li>
        );
      })}
    </ol>
  );
}

function WrappedMetricsGrid({
  dexPct,
  longestStreak,
  crowns,
}: {
  readonly dexPct: number;
  readonly longestStreak: number;
  readonly crowns: number;
}) {
  return (
    <div className="mt-5 grid grid-cols-3 gap-2 text-center">
      <div className="rounded-xl bg-void/60 p-2">
        <p className="metric text-lg font-bold">{dexPct}%</p>
        <p className="text-[10px] uppercase text-ink-faint">Flavor Dex</p>
      </div>
      <div className="rounded-xl bg-void/60 p-2">
        <p className="metric flex items-center justify-center gap-1 text-lg font-bold">
          <Flame className="h-4 w-4 text-volt" />
          {longestStreak}
        </p>
        <p className="text-[10px] uppercase text-ink-faint">Best streak</p>
      </div>
      <div className="rounded-xl bg-void/60 p-2">
        <p className="metric flex items-center justify-center gap-1 text-lg font-bold">
          <Crown className="h-4 w-4 fill-series-rehab text-series-rehab" />
          {crowns}
        </p>
        <p className="text-[10px] uppercase text-ink-faint">Crowns</p>
      </div>
    </div>
  );
}

function WrappedPoster({
  displayName,
  total,
  top,
  dexPct,
  longestStreak,
  crowns,
}: {
  readonly displayName: string;
  readonly total: number;
  readonly top: readonly FlavorCount[];
  readonly dexPct: number;
  readonly longestStreak: number;
  readonly crowns: number;
}) {
  return (
    <div className="claw-bg relative overflow-hidden rounded-3xl border border-volt/40 bg-gradient-to-br from-[#16220A] via-carbon to-void p-5">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-volt/20 blur-3xl" />
      <Wordmark />
      <p className="mt-4 text-sm text-ink-muted">{displayName} cracked open</p>
      <p className="metric font-display text-6xl font-extrabold leading-none text-volt">{total}</p>
      <p className="text-sm text-ink-muted">cans of Monster</p>
      <TopFlavorsList top={top} />
      <WrappedMetricsGrid dexPct={dexPct} longestStreak={longestStreak} crowns={crowns} />
    </div>
  );
}

function shareWrapped(text: string, showToast: (msg: string) => void) {
  if (navigator.share === undefined) {
    showToast("Recap card ready to share");
    return;
  }
  navigator.share({ text }).then(
    () => showToast("Shared!"),
    () => showToast("Share cancelled"),
  );
}

function useWrappedSummary() {
  const { state } = useAppState();
  return useMemo(() => {
    const mine = myCheckIns(state).filter((c) => c.status !== "voided");
    const top = localFlavorCounts(mine, { window: "all", nowIso: state.nowIso, offBrand: false });
    return {
      total: mine.length,
      top: top.slice(0, 3),
      dex: dexProgress(myDexCells(state), MONSTER_FLAVORS),
      crowns: myCrownIds(state).size,
    };
  }, [state]);
}

function ShareWrappedButton({ onClick }: { readonly onClick: () => void }) {
  return (
    <button type="button" className="btn-primary w-full" onClick={onClick}>
      <Share2 className="h-4 w-4" /> Share Recap Card
    </button>
  );
}

export function WrappedSheet({ onClose }: { readonly onClose: () => void }) {
  const { showToast } = useUi();
  const member = useMe();
  const streak = useStreak();
  const data = useWrappedSummary();
  const summary = `My Monster Rats Wrapped: ${data.total} cans, ${data.dex.pct}% Flavor Dex, ${streak.longest}-day streak.`;
  return (
    <Sheet
      title="Wrapped"
      subtitle="Your all-time recap card"
      onClose={onClose}
      footer={<ShareWrappedButton onClick={() => shareWrapped(summary, showToast)} />}
    >
      <WrappedPoster
        displayName={member.displayName}
        total={data.total}
        top={data.top}
        dexPct={data.dex.pct}
        longestStreak={streak.longest}
        crowns={data.crowns}
      />
    </Sheet>
  );
}
