"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import type { Club, TimeWindow } from "@/types/domain";
import { Segmented, Toggle } from "@/components/ui/Controls";
import { ProgressBar } from "@/components/ui/Progress";
import { FLAVORS } from "@/data/flavors";
import { HOME_CLUB_ID } from "@/data/mock-data";
import { globalFlavorCounts, localFlavorCounts, type FlavorCount } from "@/domain/stats";
import type { AppState } from "@/state/app-state";
import { useAppState } from "@/state/AppStateProvider";
import { clubCheckIns, flavorById, myCheckIns, myClubs } from "@/state/selectors";

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

function computeRows(
  state: AppState,
  opts: {
    readonly scope: Scope;
    readonly window: TimeWindow;
    readonly offBrand: boolean;
    readonly clubId: string;
  },
): readonly FlavorCount[] {
  if (opts.scope === "global") {
    return globalFlavorCounts(FLAVORS, {
      window: opts.window,
      offBrand: opts.offBrand,
      checkIns: state.checkIns,
      baselineIds: state.baselineIds,
      nowIso: state.nowIso,
    });
  }
  const source = opts.scope === "personal" ? myCheckIns(state) : clubCheckIns(state, opts.clubId);
  return localFlavorCounts(source, {
    window: opts.window,
    nowIso: state.nowIso,
    offBrand: opts.offBrand,
  });
}

function ClubScopeSelect({
  clubs,
  clubId,
  onChange,
}: {
  readonly clubs: readonly Club[];
  readonly clubId: string;
  readonly onChange: (id: string) => void;
}) {
  if (clubs.length <= 1) return null;
  return (
    <label className="relative mt-3 block">
      <span className="sr-only">Choose Club</span>
      <select
        value={clubId}
        onChange={(e) => onChange(e.target.value)}
        className="input appearance-none py-2 pr-9 text-xs font-semibold"
      >
        {clubs.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
    </label>
  );
}

function FlavorCountRow({
  row,
  rank,
  max,
  unit,
}: {
  readonly row: FlavorCount;
  readonly rank: number;
  readonly max: number;
  readonly unit: string;
}) {
  const flavor = flavorById(row.flavorId);
  return (
    <li className="animate-fade-in">
      <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
        <span className="truncate font-semibold">
          <span className="metric mr-1.5 text-ink-faint">#{rank}</span>
          {flavor?.name}
        </span>
        <span className="metric shrink-0 text-ink-muted">
          {row.count.toLocaleString("en-US")} {unit}
        </span>
      </div>
      <ProgressBar
        pct={(row.count / max) * 100}
        color={flavor?.color ?? "#95D600"}
        className="h-2"
      />
    </li>
  );
}

function LeaderboardHeader({
  offBrand,
  onToggle,
}: {
  readonly offBrand: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="eyebrow">Flavor Counts</h2>
      <label className="flex items-center gap-2 text-xs text-ink-muted">
        Off-Brand
        <Toggle checked={offBrand} onChange={onToggle} label="Show Off-Brand cans" />
      </label>
    </div>
  );
}

export function FlavorLeaderboard({ window }: { readonly window: TimeWindow }) {
  const { state } = useAppState();
  const [scope, setScope] = useState<Scope>("personal");
  const [offBrand, setOffBrand] = useState(false);
  const clubs = myClubs(state);
  const [clubId, setClubId] = useState(
    clubs.find((c) => c.id === HOME_CLUB_ID)?.id ?? clubs[0]?.id ?? HOME_CLUB_ID,
  );
  const top = useMemo(
    () => computeRows(state, { scope, window, offBrand, clubId }).slice(0, 8),
    [state, scope, window, offBrand, clubId],
  );
  const max = top[0]?.count ?? 1;

  return (
    <section className="card min-w-0 overflow-hidden p-4">
      <LeaderboardHeader offBrand={offBrand} onToggle={() => setOffBrand((v) => !v)} />
      <Segmented options={SCOPES} value={scope} onChange={setScope} />
      {scope === "club" && <ClubScopeSelect clubs={clubs} clubId={clubId} onChange={setClubId} />}
      <ol className="mt-4 flex flex-col gap-3">
        {top.map((r, i) => (
          <FlavorCountRow key={r.flavorId} row={r} rank={i + 1} max={max} unit={UNIT[scope]} />
        ))}
        {top.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-muted">No cans in this time range.</p>
        )}
      </ol>
    </section>
  );
}
