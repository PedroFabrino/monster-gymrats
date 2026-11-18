"use client";

import { Crown } from "lucide-react";
import { useMemo, useState } from "react";
import type { Club, TimeWindow } from "@/types/domain";
import { Segmented } from "@/components/ui/Controls";
import { ProgressBar } from "@/components/ui/Progress";
import { RankRow } from "@/components/ui/RankRow";
import { ME_ID } from "@/data/mock-data";
import { championCrowns, clubDex } from "@/domain/dex";
import { localFlavorCounts, memberCounts } from "@/domain/stats";
import { useAppState } from "@/state/AppStateProvider";
import { clubCheckIns, flavorById, memberById } from "@/state/selectors";

type Window = Extract<TimeWindow, "month" | "all">;

const WINDOWS: readonly { readonly value: Window; readonly label: string }[] = [
  { value: "month", label: "This Month" },
  { value: "all", label: "All-Time" },
];

export function ClubLeaderboard({ club }: { readonly club: Club }) {
  const { state } = useAppState();
  const [window, setWindow] = useState<Window>("month");
  const data = useMemo(() => {
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
    return {
      ranked,
      flavors: localFlavorCounts(checkIns, { window, nowIso: state.nowIso, offBrand: false }).slice(
        0,
        6,
      ),
    };
  }, [state, club, window]);
  const topFlavor = data.flavors[0]?.count ?? 1;

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
              sub={
                r.crowns > 0 ? (
                  <span className="inline-flex items-center gap-1 text-series-rehab">
                    <Crown className="h-3 w-3 fill-current" /> {r.crowns} Flavor Champion crown
                    {r.crowns === 1 ? "" : "s"}
                  </span>
                ) : undefined
              }
            />
          ))}
        </ol>
      </section>
      <section className="card p-4">
        <h3 className="eyebrow mb-3">Flavor Counts</h3>
        <ul className="flex flex-col gap-3">
          {data.flavors.map((f) => {
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
    </div>
  );
}
