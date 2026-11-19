import type { CheckIn, Flavor, TimeWindow } from "@/types/domain";
import { isCounted } from "./eligibility";
import { isInWindow } from "./time";

export interface FlavorCount {
  readonly flavorId: string;
  readonly count: number;
}

const GLOBAL_WINDOW_FACTOR: Readonly<Record<TimeWindow, number>> = {
  all: 1,
  year: 0.418,
  month: 0.0613,
  week: 0.0149,
};

export interface GlobalCountsOptions {
  readonly window: TimeWindow;
  readonly offBrand: boolean;
  readonly checkIns?: readonly CheckIn[];
  readonly baselineIds?: ReadonlySet<string>;
  readonly nowIso?: string;
}

export function localFlavorCounts(
  checkIns: readonly CheckIn[],
  options: { readonly window: TimeWindow; readonly nowIso: string; readonly offBrand: boolean },
): readonly FlavorCount[] {
  const counts = new Map<string, number>();
  for (const c of checkIns) {
    if (!isCounted(c) || c.flavorId === null) continue;
    if ((c.brand !== "monster") !== options.offBrand) continue;
    if (!isInWindow(c.consumedAt, options.window, options.nowIso)) continue;
    counts.set(c.flavorId, (counts.get(c.flavorId) ?? 0) + 1);
  }
  return [...counts]
    .map(([flavorId, count]) => ({ flavorId, count }))
    .toSorted((a, b) => b.count - a.count || a.flavorId.localeCompare(b.flavorId));
}

function deltaForCheckIn(c: CheckIn, baselineIds?: ReadonlySet<string>): number {
  const isBaseline = baselineIds?.has(c.id) ?? false;
  if (isBaseline) return c.status === "voided" ? -1 : 0;
  return c.status === "voided" ? 0 : 1;
}

export function globalDeltaByFlavor(
  checkIns: readonly CheckIn[],
  options: {
    readonly window: TimeWindow;
    readonly nowIso?: string;
    readonly baselineIds?: ReadonlySet<string>;
  },
): ReadonlyMap<string, number> {
  const deltas = new Map<string, number>();
  for (const c of checkIns) {
    if (c.flavorId === null) continue;
    if (options.nowIso !== undefined && !isInWindow(c.consumedAt, options.window, options.nowIso)) {
      continue;
    }
    const delta = deltaForCheckIn(c, options.baselineIds);
    if (delta !== 0) deltas.set(c.flavorId, (deltas.get(c.flavorId) ?? 0) + delta);
  }
  return deltas;
}

export function globalFlavorCounts(
  catalog: readonly Flavor[],
  options: GlobalCountsOptions,
): readonly FlavorCount[] {
  const factor = GLOBAL_WINDOW_FACTOR[options.window];
  const deltas =
    options.checkIns === undefined
      ? new Map<string, number>()
      : globalDeltaByFlavor(options.checkIns, {
          window: options.window,
          ...(options.nowIso === undefined ? {} : { nowIso: options.nowIso }),
          ...(options.baselineIds === undefined ? {} : { baselineIds: options.baselineIds }),
        });
  return catalog
    .filter((f) => (f.brand !== "monster") === options.offBrand)
    .map((f) => ({
      flavorId: f.id,
      count: Math.max(0, Math.round(f.globalCount * factor) + (deltas.get(f.id) ?? 0)),
    }))
    .toSorted((a, b) => b.count - a.count);
}

export interface GlobalRankOptions {
  readonly window: TimeWindow;
  readonly checkIns?: readonly CheckIn[];
  readonly baselineIds?: ReadonlySet<string>;
  readonly nowIso?: string;
}

export function globalRank(
  catalog: readonly Flavor[],
  flavorId: string,
  windowOrOptions: TimeWindow | GlobalRankOptions,
): { readonly rank: number; readonly count: number } | null {
  const target = catalog.find((f) => f.id === flavorId);
  if (target === undefined) return null;
  const opts = typeof windowOrOptions === "string" ? { window: windowOrOptions } : windowOrOptions;
  const ranked = globalFlavorCounts(catalog, { ...opts, offBrand: target.brand !== "monster" });
  const index = ranked.findIndex((r) => r.flavorId === flavorId);
  const entry = ranked[index];
  return entry === undefined ? null : { rank: index + 1, count: entry.count };
}

export interface MemberCount {
  readonly memberId: string;
  readonly count: number;
}

export function memberCounts(
  checkIns: readonly CheckIn[],
  options: { readonly window: TimeWindow; readonly nowIso: string },
): readonly MemberCount[] {
  const counts = new Map<string, number>();
  for (const c of checkIns) {
    if (!isCounted(c) || !isInWindow(c.consumedAt, options.window, options.nowIso)) continue;
    counts.set(c.memberId, (counts.get(c.memberId) ?? 0) + 1);
  }
  return [...counts]
    .map(([memberId, count]) => ({ memberId, count }))
    .toSorted((a, b) => b.count - a.count || a.memberId.localeCompare(b.memberId));
}

export function caffeineTotal(checkIns: readonly CheckIn[], catalog: readonly Flavor[]): number {
  const byId = new Map(catalog.map((f) => [f.id, f]));
  return checkIns
    .filter(isCounted)
    .reduce(
      (sum, c) => sum + (c.flavorId === null ? 0 : (byId.get(c.flavorId)?.caffeineMg ?? 0)),
      0,
    );
}
