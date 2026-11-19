import { describe, expect, it } from "vitest";
import { FLAVORS, MONSTER_FLAVORS } from "@/data/flavors";
import { ME_ID } from "@/data/mock-data";
import { createCheckIn } from "@/domain/check-in";
import { clubDex, dexProgress } from "@/domain/dex";
import { globalRank } from "@/domain/stats";
import { dayActivity, monsterStreak } from "@/domain/streak";
import { addHours } from "@/domain/time";
import { createInitialState } from "./app-state";
import { appReducer } from "./reducer";
import { clubCheckIns, clubFeed, findClubByCode, me } from "./selectors";

const initial = createInitialState();

describe("seed world", () => {
  it("seeds at least 60 canonical Monster flavors", () => {
    expect(MONSTER_FLAVORS.length).toBeGreaterThanOrEqual(60);
  });

  it("gives the demo member a 14-day current and 29-day longest Monster Streak", () => {
    expect(monsterStreak(dayActivity(initial.checkIns, ME_ID), "2026-11-18")).toEqual({
      current: 14,
      longest: 29,
    });
  });

  it("leaves some Club Flavor Dex slots locked", () => {
    const progress = dexProgress(clubDex(clubCheckIns(initial, "night-shift")), MONSTER_FLAVORS);
    expect(progress.unlocked).toBeGreaterThan(30);
    expect(progress.unlocked).toBeLessThan(progress.total);
  });
});

describe("appReducer", () => {
  it("posts a Check-In once to Global counts even when shared across multiple Clubs", () => {
    const beforeGlobal =
      globalRank(FLAVORS, "papillon", {
        window: "all",
        checkIns: initial.checkIns,
        baselineIds: initial.baselineIds,
        nowIso: initial.nowIso,
      })?.count ?? 0;
    const checkIn = createCheckIn({
      id: "new-1",
      memberId: ME_ID,
      brand: "monster",
      flavorId: "papillon",
      volumeMl: 473,
      rating: 5,
      consumedAt: initial.nowIso,
      postedAt: initial.nowIso,
      scene: "studio",
    });
    const next = appReducer(initial, {
      type: "post_check_in",
      payload: {
        checkIn,
        shares: [
          { checkInId: "new-1", targetType: "club", targetId: "night-shift" },
          { checkInId: "new-1", targetType: "club", targetId: "ultra-society" },
        ],
        flavorRequest: null,
      },
    });
    const afterGlobal =
      globalRank(FLAVORS, "papillon", {
        window: "all",
        checkIns: next.checkIns,
        baselineIds: next.baselineIds,
        nowIso: next.nowIso,
      })?.count ?? 0;
    expect(afterGlobal).toBe(beforeGlobal + 1);
    expect(clubFeed(next, "night-shift").at(-1)?.kind).toBe("system");
    expect(clubFeed(next, "ultra-society").some((i) => i.id === "new-1")).toBe(true);
  });

  it("accepts a 24h retroactive Check-In and rejects Check-Ins older than 24h", () => {
    const within = createCheckIn({
      id: "ok-24",
      memberId: ME_ID,
      brand: "monster",
      flavorId: "ultra-zero",
      volumeMl: 473,
      rating: 4,
      consumedAt: addHours(initial.nowIso, -24),
      postedAt: initial.nowIso,
      scene: "studio",
    });
    const tooOld = createCheckIn({
      id: "old-25",
      memberId: ME_ID,
      brand: "monster",
      flavorId: "ultra-zero",
      volumeMl: 473,
      rating: 4,
      consumedAt: addHours(initial.nowIso, -25),
      postedAt: initial.nowIso,
      scene: "studio",
    });
    expect(
      appReducer(initial, {
        type: "post_check_in",
        payload: { checkIn: within, shares: [], flavorRequest: null },
      }).checkIns.some((c) => c.id === "ok-24"),
    ).toBe(true);
    expect(
      appReducer(initial, {
        type: "post_check_in",
        payload: { checkIn: tooOld, shares: [], flavorRequest: null },
      }),
    ).toBe(initial);
  });

  it("toggles reactions on and off", () => {
    const on = appReducer(initial, {
      type: "toggle_reaction",
      checkInId: "f-camila-rb",
      kind: "bolt",
    });
    expect(on.checkIns.find((c) => c.id === "f-camila-rb")?.reactions.bolt).toContain(ME_ID);
    const off = appReducer(on, { type: "toggle_reaction", checkInId: "f-camila-rb", kind: "bolt" });
    expect(off.checkIns.find((c) => c.id === "f-camila-rb")?.reactions.bolt).not.toContain(ME_ID);
  });

  it("voids a Check-In on quorum vote and removes it from Global counts", () => {
    const before =
      globalRank(FLAVORS, "original", {
        window: "all",
        checkIns: initial.checkIns,
        baselineIds: initial.baselineIds,
        nowIso: initial.nowIso,
      })?.count ?? 0;
    const next = appReducer(initial, { type: "vote_dispute", checkInId: "f-thiago-shelf" });
    expect(next.checkIns.find((c) => c.id === "f-thiago-shelf")?.status).toBe("voided");
    const after =
      globalRank(FLAVORS, "original", {
        window: "all",
        checkIns: next.checkIns,
        baselineIds: next.baselineIds,
        nowIso: next.nowIso,
      })?.count ?? 0;
    expect(after).toBe(before - 1);
  });

  it("ignores blank chat messages and blank profile names", () => {
    expect(appReducer(initial, { type: "send_chat", clubId: "night-shift", body: "  " })).toBe(
      initial,
    );
    const renamed = appReducer(initial, {
      type: "update_profile",
      profile: { displayName: " ", avatarColor: "#fff", signatureFlavorId: "ultra-zero" },
    });
    expect(me(renamed).displayName).toBe("Rafa");
  });

  it("joins a Club by invite code", () => {
    const club = findClubByCode(initial, "gas-777");
    expect(club?.id).toBe("gas-station-gang");
    const next = appReducer(initial, { type: "join_club", clubId: club?.id ?? "" });
    expect(next.clubs.find((c) => c.id === "gas-station-gang")?.memberIds).toContain(ME_ID);
    expect(findClubByCode(initial, "NOPE")).toBeUndefined();
  });
});
