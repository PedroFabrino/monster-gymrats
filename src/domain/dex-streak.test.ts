import { describe, expect, it } from "vitest";
import type { CheckIn } from "@/types/domain";
import { FLAVORS, MONSTER_FLAVORS } from "@/data/flavors";
import { createCheckIn, isWithinRetroWindow } from "./check-in";
import { clubDex, dexProgress, personalDex } from "./dex";
import { globalFlavorCounts, globalRank, localFlavorCounts } from "./stats";
import { dayActivity, monsterStreak, monthCalendar } from "./streak";

function can(
  id: string,
  memberId: string,
  opts: { readonly day: string; readonly extra?: Partial<CheckIn> },
): CheckIn {
  return {
    ...createCheckIn({
      id,
      memberId,
      brand: "monster",
      flavorId: "ultra-zero",
      volumeMl: 473,
      rating: 4,
      consumedAt: `${opts.day}T10:00:00.000Z`,
      postedAt: `${opts.day}T10:00:00.000Z`,
      scene: "studio",
    }),
    ...opts.extra,
  };
}

describe("Flavor Dex", () => {
  it("tracks personal counts and average rating", () => {
    const dex = personalDex(
      [
        can("1", "a", { day: "2026-11-01" }),
        can("2", "a", { day: "2026-11-02", extra: { rating: 2 } }),
      ],
      "a",
    );
    expect(dex.get("ultra-zero")).toMatchObject({ count: 2, avgRating: 3 });
  });

  it("records first discoverer and champion for the Club", () => {
    const dex = clubDex([
      can("1", "b", { day: "2026-11-03" }),
      can("2", "a", { day: "2026-11-01" }),
      can("3", "b", { day: "2026-11-04" }),
    ]);
    expect(dex.get("ultra-zero")).toMatchObject({
      count: 3,
      firstDiscovererId: "a",
      championId: "b",
      championCount: 2,
    });
  });

  it("skips pending flavors and voided cans", () => {
    const dex = personalDex(
      [
        can("1", "a", { day: "2026-11-01", extra: { flavorId: null } }),
        can("2", "a", { day: "2026-11-01", extra: { status: "voided" } }),
      ],
      "a",
    );
    expect(dex.size).toBe(0);
    expect(dexProgress(dex, MONSTER_FLAVORS).pct).toBe(0);
  });

  it("handles an empty catalog", () => {
    expect(dexProgress(new Set(), [])).toEqual({ unlocked: 0, total: 0, pct: 0 });
  });
});

describe("Monster Streak", () => {
  it("counts consecutive Monster days and ignores Off-Brand days", () => {
    const activity = dayActivity(
      [
        can("1", "a", { day: "2026-11-15" }),
        can("2", "a", { day: "2026-11-16", extra: { brand: "redbull" } }),
        can("3", "a", { day: "2026-11-17" }),
        can("4", "a", { day: "2026-11-18" }),
      ],
      "a",
    );
    expect(activity.get("2026-11-16")).toBe("offbrand");
    expect(monsterStreak(activity, "2026-11-18")).toEqual({ current: 2, longest: 2 });
  });

  it("keeps the streak alive if today has no Check-In yet", () => {
    const activity = dayActivity([can("1", "a", { day: "2026-11-17" })], "a");
    expect(monsterStreak(activity, "2026-11-18").current).toBe(1);
  });

  it("returns zero for no activity", () => {
    expect(monsterStreak(new Map(), "2026-11-18")).toEqual({ current: 0, longest: 0 });
  });

  it("builds a month calendar with future days", () => {
    const cal = monthCalendar(new Map([["2026-11-02", "monster"]]), "2026-11", "2026-11-18");
    expect(cal.cells).toHaveLength(30);
    expect(cal.cells[1]?.kind).toBe("monster");
    expect(cal.cells[0]?.kind).toBe("rest");
    expect(cal.cells[29]?.kind).toBe("future");
  });
});

describe("Flavor Counts & retro window", () => {
  it("separates Monster and Off-Brand counts", () => {
    const list = [
      can("1", "a", { day: "2026-11-18" }),
      can("2", "a", {
        day: "2026-11-18",
        extra: { brand: "redbull", flavorId: "redbull-sugarfree" },
      }),
    ];
    const opts = { window: "all" as const, nowIso: "2026-11-18T21:00:00.000Z" };
    expect(localFlavorCounts(list, { ...opts, offBrand: false })).toEqual([
      { flavorId: "ultra-zero", count: 1 },
    ]);
    expect(localFlavorCounts(list, { ...opts, offBrand: true })[0]?.flavorId).toBe(
      "redbull-sugarfree",
    );
  });

  it("ranks Ultra Zero first globally, adds new cans once, and excludes voided cans", () => {
    expect(globalRank(FLAVORS, "ultra-zero", "all")?.rank).toBe(1);
    expect(globalRank(FLAVORS, "nope", "all")).toBeNull();
    const base = globalRank(FLAVORS, "ultra-zero", "all")?.count ?? 0;
    const withLive = globalFlavorCounts(FLAVORS, {
      window: "all",
      offBrand: false,
      checkIns: [
        can("seed-1", "a", { day: "2026-11-18", extra: { status: "voided" } }),
        can("new-1", "a", { day: "2026-11-18" }),
        can("new-2", "a", { day: "2026-11-18", extra: { status: "voided" } }),
      ],
      baselineIds: new Set(["seed-1"]),
    });
    expect(withLive.find((r) => r.flavorId === "ultra-zero")?.count).toBe(base);
  });

  it("allows retroactive Check-Ins up to 24h only", () => {
    expect(isWithinRetroWindow("2026-11-17T22:00:00.000Z", "2026-11-18T21:00:00.000Z")).toBe(true);
    expect(isWithinRetroWindow("2026-11-17T20:00:00.000Z", "2026-11-18T21:00:00.000Z")).toBe(false);
  });
});
