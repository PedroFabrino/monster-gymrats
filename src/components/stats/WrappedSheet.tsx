"use client";

import { Crown, Flame, Share2 } from "lucide-react";
import { useMemo } from "react";
import { Wordmark } from "@/components/shell/TopBar";
import { CanArt } from "@/components/ui/CanArt";
import { Sheet } from "@/components/ui/Sheet";
import { MONSTER_FLAVORS } from "@/data/flavors";
import { dexProgress } from "@/domain/dex";
import { localFlavorCounts } from "@/domain/stats";
import { useAppState } from "@/state/AppStateProvider";
import { myCrownIds, myDexCells } from "@/state/dex-selectors";
import { useMe, useStreak } from "@/state/hooks";
import { useUi } from "@/state/UiProvider";
import { flavorById, myCheckIns } from "@/state/selectors";

export function WrappedSheet({ onClose }: { readonly onClose: () => void }) {
  const { state } = useAppState();
  const { showToast } = useUi();
  const member = useMe();
  const streak = useStreak();
  const data = useMemo(() => {
    const mine = myCheckIns(state).filter((c) => c.status !== "voided");
    return {
      total: mine.length,
      top: localFlavorCounts(mine, { window: "all", nowIso: state.nowIso, offBrand: false }).slice(
        0,
        3,
      ),
      dex: dexProgress(myDexCells(state), MONSTER_FLAVORS),
      crowns: myCrownIds(state).size,
    };
  }, [state]);

  const share = () => {
    const text = `My Monster Rats Wrapped: ${data.total} cans, ${data.dex.pct}% Flavor Dex, ${streak.longest}-day streak.`;
    if (navigator.share === undefined) {
      showToast("Recap card ready to share");
      return;
    }
    navigator.share({ text }).then(
      () => showToast("Shared!"),
      () => showToast("Share cancelled"),
    );
  };

  return (
    <Sheet
      title="Wrapped"
      subtitle="Your all-time recap card"
      onClose={onClose}
      footer={
        <button type="button" className="btn-primary w-full" onClick={share}>
          <Share2 className="h-4 w-4" /> Share Recap Card
        </button>
      }
    >
      <div className="claw-bg relative overflow-hidden rounded-3xl border border-volt/40 bg-gradient-to-br from-[#16220A] via-carbon to-void p-5">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-volt/20 blur-3xl" />
        <Wordmark />
        <p className="mt-4 text-sm text-ink-muted">{member.displayName} cracked open</p>
        <p className="metric font-display text-6xl font-extrabold leading-none text-volt">
          {data.total}
        </p>
        <p className="text-sm text-ink-muted">cans of Monster</p>
        <ol className="mt-5 flex flex-col gap-2">
          {data.top.map((t, i) => {
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
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-void/60 p-2">
            <p className="metric text-lg font-bold">{data.dex.pct}%</p>
            <p className="text-[10px] uppercase text-ink-faint">Flavor Dex</p>
          </div>
          <div className="rounded-xl bg-void/60 p-2">
            <p className="metric flex items-center justify-center gap-1 text-lg font-bold">
              <Flame className="h-4 w-4 text-volt" />
              {streak.longest}
            </p>
            <p className="text-[10px] uppercase text-ink-faint">Best streak</p>
          </div>
          <div className="rounded-xl bg-void/60 p-2">
            <p className="metric flex items-center justify-center gap-1 text-lg font-bold">
              <Crown className="h-4 w-4 fill-series-rehab text-series-rehab" />
              {data.crowns}
            </p>
            <p className="text-[10px] uppercase text-ink-faint">Crowns</p>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
