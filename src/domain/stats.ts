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

export function globalFlavorCounts(
  catalog: readonly Flavor[],
  options: { readonly window: TimeWindow; readonly offBrand: boolean },
): readonly FlavorCount[] {
  const factor = GLOBAL_WINDOW_FACTOR[options.window];
  return catalog
    .filter((f) => (f.brand !== "monster") === options.offBrand)
    .map((f) => ({ flavorId: f.id, count: Math.round(f.globalCount * factor) }))
    .toSorted((a, b) => b.count - a.count);
}

export function globalRank(
  catalog: readonly Flavor[],
  flavorId: string,
  window: TimeWindow,
): { readonly rank: number; readonly count: number } | null {
  const target = catalog.find((f) => f.id === flavorId);
  if (target === undefined) return null;
  const ranked = globalFlavorCounts(catalog, { window, offBrand: target.brand !== "monster" });
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
