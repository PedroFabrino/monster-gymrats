import type { CheckIn, Flavor } from "@/types/domain";
import { isCounted } from "./eligibility";

export interface PersonalDexEntry {
  readonly count: number;
  readonly avgRating: number;
  readonly firstAt: string;
}

export interface ClubDexEntry {
  readonly count: number;
  readonly firstDiscovererId: string;
  readonly firstAt: string;
  readonly championId: string;
  readonly championCount: number;
}

export interface DexProgress {
  readonly unlocked: number;
  readonly total: number;
  readonly pct: number;
}

function dexCheckIns(checkIns: readonly CheckIn[]): readonly CheckIn[] {
  return checkIns
    .filter((c) => isCounted(c) && c.flavorId !== null)
    .toSorted((a, b) => a.consumedAt.localeCompare(b.consumedAt));
}

export function personalDex(
  checkIns: readonly CheckIn[],
  memberId: string,
): ReadonlyMap<string, PersonalDexEntry> {
  const sums = new Map<string, { count: number; ratingSum: number; firstAt: string }>();
  for (const c of dexCheckIns(checkIns.filter((x) => x.memberId === memberId))) {
    const key = c.flavorId ?? "";
    const prev = sums.get(key);
    sums.set(key, {
      count: (prev?.count ?? 0) + 1,
      ratingSum: (prev?.ratingSum ?? 0) + c.rating,
      firstAt: prev?.firstAt ?? c.consumedAt,
    });
  }
  return new Map(
    [...sums].map(([id, s]) => [
      id,
      { count: s.count, avgRating: s.ratingSum / s.count, firstAt: s.firstAt },
    ]),
  );
}

function topMember(perMember: ReadonlyMap<string, number>): [string, number] {
  return [...perMember].reduce<[string, number]>(
    (best, entry) => (entry[1] > best[1] ? entry : best),
    ["", 0],
  );
}

export function clubDex(checkIns: readonly CheckIn[]): ReadonlyMap<string, ClubDexEntry> {
  const firsts = new Map<string, { memberId: string; at: string }>();
  const perFlavor = new Map<string, Map<string, number>>();
  for (const c of dexCheckIns(checkIns)) {
    const key = c.flavorId ?? "";
    if (!firsts.has(key)) firsts.set(key, { memberId: c.memberId, at: c.consumedAt });
    const members = perFlavor.get(key) ?? new Map<string, number>();
    members.set(c.memberId, (members.get(c.memberId) ?? 0) + 1);
    perFlavor.set(key, members);
  }
  return new Map(
    [...perFlavor].map(([id, members]) => {
      const first = firsts.get(id) ?? { memberId: "", at: "" };
      const [championId, championCount] = topMember(members);
      const count = [...members.values()].reduce((sum, n) => sum + n, 0);
      return [
        id,
        { count, firstDiscovererId: first.memberId, firstAt: first.at, championId, championCount },
      ];
    }),
  );
}

export function dexProgress(
  unlockedIds: ReadonlySet<string> | ReadonlyMap<string, unknown>,
  catalog: readonly Flavor[],
): DexProgress {
  const total = catalog.length;
  const unlocked = catalog.filter((f) => unlockedIds.has(f.id)).length;
  return { unlocked, total, pct: total === 0 ? 0 : Math.round((unlocked / total) * 100) };
}

export function championCrowns(
  dex: ReadonlyMap<string, ClubDexEntry>,
  memberId: string,
): readonly string[] {
  return [...dex].filter(([, e]) => e.championId === memberId).map(([id]) => id);
}
