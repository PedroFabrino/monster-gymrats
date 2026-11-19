"use client";

import { Crown } from "lucide-react";
import type { CSSProperties } from "react";
import type { Flavor } from "@/types/domain";
import { CanArt } from "@/components/ui/CanArt";
import { SERIES_ACCENT } from "@/data/flavors";
import type { DexCellView as DexCell } from "@/state/dex-selectors";

interface DexGridProps {
  readonly flavors: readonly Flavor[];
  readonly cells: ReadonlyMap<string, DexCell>;
  readonly onSelect: (flavorId: string) => void;
}

function ChampionBadge() {
  return (
    <span
      className="absolute right-1.5 top-1.5 rounded-full bg-series-rehab/15 p-1 text-series-rehab"
      title="Flavor Champion"
    >
      <Crown className="h-3 w-3 fill-series-rehab" />
    </span>
  );
}

function tileStyle(locked: boolean, border: string): CSSProperties {
  if (locked) return { borderColor: "#262B36" };
  return { borderColor: `${border}80`, boxShadow: `inset 0 0 24px ${border}14` };
}

function DexTile({
  flavor,
  cell,
  onSelect,
}: {
  readonly flavor: Flavor;
  readonly cell: DexCell | undefined;
  readonly onSelect: () => void;
}) {
  const locked = cell === undefined;
  const border = SERIES_ACCENT[flavor.series];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={locked ? "Locked flavor" : `${flavor.name}, ${cell.count} logged`}
      className="press group relative flex flex-col items-center rounded-2xl border bg-carbon px-1.5 pb-2 pt-3 transition-colors"
      style={tileStyle(locked, border)}
    >
      {cell?.crowned === true && <ChampionBadge />}
      <CanArt
        color={flavor.color}
        accent={flavor.accent}
        locked={locked}
        className="h-16 transition-transform group-hover:-translate-y-0.5"
      />
      <p
        className={`mt-2 line-clamp-2 min-h-[2rem] text-center text-[11px] font-semibold leading-4 ${locked ? "text-ink-faint" : "text-ink"}`}
      >
        {locked ? "???" : flavor.name}
      </p>
      <p className="metric text-[10px]" style={{ color: locked ? "#6B7385" : border }}>
        {locked ? "0 logged" : `x${cell.count}`}
      </p>
    </button>
  );
}

export function DexGrid({ flavors, cells, onSelect }: DexGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {flavors.map((f) => (
        <DexTile key={f.id} flavor={f} cell={cells.get(f.id)} onSelect={() => onSelect(f.id)} />
      ))}
    </div>
  );
}
