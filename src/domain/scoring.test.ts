import { describe, expect, it } from "vitest";
import type { Challenge, CheckIn } from "@/types/domain";
import { createCheckIn } from "./check-in";
import { challengeStandings, clubVsClub, scoreMember, todayCapNotice } from "./scoring";

const base: Challenge = {
  id: "c",
  name: "Test",
  scope: "club",
  clubId: "club",
  brandRule: "monster_only",
  scoring: "total_cans",
  dailyPointCap: 1,
  startsAt: "2026-11-01T00:00:00.000Z",
  endsAt: "2026-11-30T23:59:59.000Z",
  playerCount: 2,
  joined: true,
};

function can(id: string, consumedAt: string, extra: Partial<CheckIn> = {}): CheckIn {
  return {
    ...createCheckIn({
      id,
      memberId: "a",
      brand: "monster",
      flavorId: "ultra-zero",
      volumeMl: 473,
      rating: 4,
      consumedAt,
      postedAt: consumedAt,
      scene: "studio",
    }),
    ...extra,
  };
}

const twoToday = [
  can("1", "2026-11-18T08:00:00.000Z"),
  can("2", "2026-11-18T14:00:00.000Z", { flavorId: "mango-loco" }),
];

describe("scoreMember", () => {
  it("applies the daily point cap to total cans", () => {
    expect(scoreMember(base, twoToday, "a")).toMatchObject({ points: 1, cans: 2, cappedOut: 1 });
  });

  it("counts unique flavors in Flavor Dex mode regardless of cap", () => {
    expect(scoreMember({ ...base, scoring: "flavor_dex" }, twoToday, "a").points).toBe(2);
  });

  it("awards a new-flavor bonus only on capped cans in Flavor Hunter mode", () => {
    expect(scoreMember({ ...base, scoring: "flavor_hunter" }, twoToday, "a").points).toBe(3);
  });

  it("excludes Off-Brand and voided Check-Ins from Monster-only Challenges", () => {
    const list = [
      can("1", "2026-11-18T08:00:00.000Z", { brand: "redbull" }),
      can("2", "2026-11-17T08:00:00.000Z", { status: "voided" }),
    ];
    expect(scoreMember(base, list, "a").points).toBe(0);
    expect(scoreMember({ ...base, brandRule: "multi_brand" }, list, "a").points).toBe(1);
  });

  it("returns zero for a member with no Check-Ins", () => {
    expect(scoreMember(base, [], "nobody")).toEqual({
      memberId: "nobody",
      points: 0,
      cans: 0,
      cappedOut: 0,
    });
  });

  it("ignores Check-Ins outside the Challenge window", () => {
    expect(scoreMember(base, [can("1", "2026-10-31T23:00:00.000Z")], "a").points).toBe(0);
  });
});

describe("challengeStandings & caps", () => {
  it("ranks members by points", () => {
    const list = [...twoToday, can("3", "2026-11-17T08:00:00.000Z", { memberId: "b" })];
    const ranked = challengeStandings({ ...base, scoring: "flavor_dex" }, list, ["b", "a"]);
    expect(ranked.map((r) => r.memberId)).toEqual(["a", "b"]);
  });

  it("explains the second can of the day gives no volume points", () => {
    expect(todayCapNotice(base, twoToday, { memberId: "a", todayKey: "2026-11-18" })).toEqual({
      cansToday: 2,
      pointsToday: 1,
    });
  });

  it("computes Club vs. Club averages", () => {
    const result = clubVsClub(
      [
        { id: "x", name: "Big", members: 10, points: 100 },
        { id: "y", name: "Small", members: 2, points: 40 },
      ],
      "average",
    );
    expect(result.map((r) => r.id)).toEqual(["y", "x"]);
    expect(result[0]?.score).toBe(20);
  });
});
