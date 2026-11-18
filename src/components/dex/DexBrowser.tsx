"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { FlavorSeries } from "@/types/domain";
import { ChipRow } from "@/components/ui/Controls";
import { ProgressRing } from "@/components/ui/Progress";
import { MONSTER_FLAVORS } from "@/data/flavors";
import { dexProgress } from "@/domain/dex";
import { useUi } from "@/state/UiProvider";
import type { DexCellView } from "@/state/dex-selectors";
import { DexGrid } from "./DexGrid";

type SeriesFilter = "All" | Exclude<FlavorSeries, "Off-Brand">;

const SERIES_OPTIONS: readonly { readonly value: SeriesFilter; readonly label: string }[] = (
  ["All", "Ultra", "Original", "Juice", "Rehab", "Java", "Reserve", "Nitro"] as const
).map((s) => ({ value: s, label: s }));

interface DexBrowserProps {
  readonly cells: ReadonlyMap<string, DexCellView>;
  readonly clubId: string | null;
  readonly caption: string;
}

export function DexBrowser({ cells, clubId, caption }: DexBrowserProps) {
  const { openSheet } = useUi();
  const [query, setQuery] = useState("");
  const [series, setSeries] = useState<SeriesFilter>("All");
  const progress = dexProgress(cells, MONSTER_FLAVORS);
  const flavors = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MONSTER_FLAVORS.filter(
      (f) =>
        (series === "All" || f.series === series) &&
        (q === "" || (cells.has(f.id) && f.name.toLowerCase().includes(q))),
    );
  }, [query, series, cells]);

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex items-center gap-4 p-4">
        <ProgressRing pct={progress.pct} size={92} stroke={9}>
          <span className="metric text-xl font-bold">{progress.pct}%</span>
        </ProgressRing>
        <div className="min-w-0">
          <p className="eyebrow">{caption}</p>
          <p className="mt-1 font-display text-3xl font-extrabold leading-none">
            <span className="metric">{progress.unlocked}</span>
            <span className="text-ink-faint"> / </span>
            <span className="metric">{progress.total}</span>
          </p>
          <p className="mt-1 text-xs text-ink-muted">Monster Flavors • {progress.pct}% unlocked</p>
        </div>
      </div>
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search unlocked flavors"
          className="input !pl-9"
          aria-label="Search flavors"
        />
      </label>
      <ChipRow options={SERIES_OPTIONS} value={series} onChange={setSeries} />
      {flavors.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-muted">
          No unlocked flavors match that search.
        </p>
      ) : (
        <DexGrid
          flavors={flavors}
          cells={cells}
          onSelect={(flavorId) => openSheet({ kind: "flavor", flavorId, clubId })}
        />
      )}
    </div>
  );
}
