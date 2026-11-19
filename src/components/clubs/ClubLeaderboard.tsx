"use client";

import { Crown } from "lucide-react";
import { useMemo, useState } from "react";
import type { Club, TimeWindow } from "@/types/domain";
import { Segmented } from "@/components/ui/Controls";
import { ProgressBar } from "@/components/ui/Progress";
import { RankRow } from "@/components/ui/RankRow";
import { ME_ID } from "@/data/mock-data";
import { championCrowns, clubDex } from "@/domain/dex";
import { localFlavorCounts, memberCounts, type FlavorCount } from "@/domain/stats";
import type { AppState } from "@/state/app-state";
import { useAppState } from "@/state/AppStateProvider";
import { clubCheckIns, flavorById, memberById } from "@/state/selectors";

type Window = Extract<TimeWindow, "month" | "all">;

const WINDOWS: readonly { readonly value: Window; readonly label: string }[] = [
  { value: "month", label: "This Month" },
  { value: "all", label: "All-Time" },
];

function buildLeaderboard(state: AppState, club: Club, window: Window) {
  const checkIns = clubCheckIns(state, club.id);
  const dex = clubDex(checkIns);
  const counts = memberCounts(checkIns, { window, nowIso: state.nowIso });
  const ranked = club.memberIds
    .map((id) => ({
      id,
      count: counts.find((c) => c.memberId === id)?.count ?? 0,
      crowns: championCrowns(dex, id).length,
    }))
    .toSorted((a, b) => b.count - a.count || b.crowns - a.crowns);
  const flavors = localFlavorCounts(checkIns, { window, nowIso: state.nowIso, offBrand: false });
  return { ranked, flavors: flavors.slice(0, 6) };
}

function FlavorBreakdown({ flavors }: { readonly flavors: readonly FlavorCount[] }) {
  const topFlavor = flavors[0]?.count ?? 1;
  return (
    <section className="card p-4">
      <h3 className="eyebrow mb-3">Flavor Counts</h3>
      <ul className="flex flex-col gap-3">
        {flavors.map((f) => {
          const flavor = flavorById(f.flavorId);
          return (
            <li key={f.flavorId}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium">{flavor?.name}</span>
                <span className="metric text-ink-muted">{f.count}</span>
              </div>
              <ProgressBar pct={(f.count / topFlavor) * 100} color={flavor?.color ?? "#95D600"} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CrownBadge({ count }: { readonly count: number }) {
  if (count <= 0) return undefined;
  return (
    <span className="inline-flex items-center gap-1 text-series-rehab">
      <Crown className="h-3 w-3 fill-current" /> {count} Flavor Champion crown
      {count === 1 ? "" : "s"}
    </span>
  );
}

export function ClubLeaderboard({ club }: { readonly club: Club }) {
  const { state } = useAppState();
  const [window, setWindow] = useState<Window>("month");
  const data = useMemo(() => buildLeaderboard(state, club, window), [state, club, window]);

  return (
    <div className="flex flex-col gap-5 px-4 pt-4">
      <Segmented options={WINDOWS} value={window} onChange={setWindow} />
      <section>
        <h3 className="eyebrow mb-2">Cans logged</h3>
        <ol className="flex flex-col gap-1.5">
          {data.ranked.map((r, i) => (
            <RankRow
              key={r.id}
              rank={i + 1}
              name={memberById(state, r.id)?.displayName ?? "Member"}
              member={memberById(state, r.id)}
              value={r.count}
              highlight={r.id === ME_ID}
              sub={CrownBadge({ count: r.crowns })}
            />
          ))}
        </ol>
      </section>
      <FlavorBreakdown flavors={data.flavors} />
    </div>
  );
}
