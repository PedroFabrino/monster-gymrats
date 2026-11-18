"use client";

import { useMemo, useState } from "react";
import type { TimeWindow } from "@/types/domain";
import { Segmented, Toggle } from "@/components/ui/Controls";
import { ProgressBar } from "@/components/ui/Progress";
import { FLAVORS } from "@/data/flavors";
import { HOME_CLUB_ID } from "@/data/mock-data";
import { globalFlavorCounts, localFlavorCounts } from "@/domain/stats";
import { useAppState } from "@/state/AppStateProvider";
import { clubCheckIns, flavorById, myCheckIns } from "@/state/selectors";

type Scope = "personal" | "club" | "global";

const SCOPES: readonly { readonly value: Scope; readonly label: string }[] = [
  { value: "personal", label: "Personal" },
  { value: "club", label: "Club" },
  { value: "global", label: "Global" },
];

const UNIT: Readonly<Record<Scope, string>> = {
  personal: "cans",
  club: "club cans",
  global: "global cans",
};

export function FlavorLeaderboard({ window }: { readonly window: TimeWindow }) {
  const { state } = useAppState();
  const [scope, setScope] = useState<Scope>("personal");
  const [offBrand, setOffBrand] = useState(false);
  const rows = useMemo(() => {
    if (scope === "global") return globalFlavorCounts(FLAVORS, { window, offBrand });
    const source = scope === "personal" ? myCheckIns(state) : clubCheckIns(state, HOME_CLUB_ID);
    return localFlavorCounts(source, { window, nowIso: state.nowIso, offBrand });
  }, [state, scope, window, offBrand]);
  const top = rows.slice(0, 8);
  const max = top[0]?.count ?? 1;

  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="eyebrow">Flavor Counts</h2>
        <label className="flex items-center gap-2 text-xs text-ink-muted">
          Off-Brand
          <Toggle
            checked={offBrand}
            onChange={() => setOffBrand((v) => !v)}
            label="Show Off-Brand cans"
          />
        </label>
      </div>
      <Segmented options={SCOPES} value={scope} onChange={setScope} />
      <ol className="mt-4 flex flex-col gap-3">
        {top.map((r, i) => {
          const flavor = flavorById(r.flavorId);
          return (
            <li key={r.flavorId} className="animate-fade-in">
              <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                <span className="truncate font-semibold">
                  <span className="metric mr-1.5 text-ink-faint">#{i + 1}</span>
                  {flavor?.name}
                </span>
                <span className="metric shrink-0 text-ink-muted">
                  {r.count.toLocaleString("en-US")} {UNIT[scope]}
                </span>
              </div>
              <ProgressBar
                pct={(r.count / max) * 100}
                color={flavor?.color ?? "#95D600"}
                className="h-2"
              />
            </li>
          );
        })}
        {top.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-muted">No cans in this time range.</p>
        )}
      </ol>
    </section>
  );
}
