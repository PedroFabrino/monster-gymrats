import { describe, expect, it } from "vitest";
import { FLAVORS } from "@/data/flavors";
import { CHALLENGES, CLUBS } from "@/data/mock-data";
import { SAMPLE_PRESETS } from "@/data/presets";
import { openDispute, resolveDispute, voteOnDispute } from "./disputes";
import { buildShareOptions, toggleShareOption } from "./fanout";
import { interpretVision, lookupBarcode, parseVisionResponse } from "./vision";

function presetResponse(id: string): unknown {
  return SAMPLE_PRESETS.find((p) => p.id === id)?.visionResponse;
}

describe("vision interpretation", () => {
  it("matches a clear shot with runners-up", () => {
    const result = interpretVision(presetResponse("clear"), FLAVORS);
    expect(result).toMatchObject({ kind: "match", flavorId: "ultra-zero", confidence: 0.98 });
    if (result.kind === "match") expect(result.runnersUp).toHaveLength(3);
  });

  it("falls back to barcode for low confidence", () => {
    expect(interpretVision(presetResponse("dark"), FLAVORS).kind).toBe("low_confidence");
    const preset = SAMPLE_PRESETS.find((p) => p.id === "dark");
    expect(lookupBarcode(preset?.barcode ?? "", FLAVORS)?.id).toBe("mango-loco");
  });

  it("detects not-in-catalog flavors and non-can photos", () => {
    expect(interpretVision(presetResponse("unknown"), FLAVORS)).toMatchObject({
      kind: "not_in_catalog",
      guessName: "Monster Ultra Yuzu (KR Import)",
    });
    expect(interpretVision(presetResponse("noncan"), FLAVORS).kind).toBe("non_can");
  });

  it("rejects malformed responses", () => {
    expect(parseVisionResponse(null)).toBeNull();
    expect(interpretVision({ is_can: "yes" }, FLAVORS).kind).toBe("invalid");
    expect(lookupBarcode("", FLAVORS)).toBeNull();
  });
});

describe("Group Share fan-out", () => {
  const ctx = { memberId: "u-me", consumedAt: "2026-11-18T20:00:00.000Z" };

  it("selects every joined Club and active joined Challenge for Monster cans", () => {
    const options = buildShareOptions({ ...ctx, brand: "monster" }, CLUBS, CHALLENGES);
    expect(options.every((o) => o.selected)).toBe(true);
    expect(options.some((o) => o.targetId === "gas-station-gang")).toBe(false);
    expect(options.some((o) => o.targetId === "g-any-can-open")).toBe(false);
  });

  it("auto-deselects Monster-only Challenges for Off-Brand cans and locks them", () => {
    const options = buildShareOptions({ ...ctx, brand: "redbull" }, CLUBS, CHALLENGES);
    const blocked = options.find((o) => o.targetId === "c-no-skip");
    expect(blocked).toMatchObject({ selected: false, blockedReason: "Monster-only Challenge" });
    const toggled = toggleShareOption(options, blocked?.key ?? "");
    expect(toggled.find((o) => o.targetId === "c-no-skip")?.selected).toBe(false);
  });
});

describe("Disputes", () => {
  const dispute = openDispute({
    id: "d",
    raisedBy: "a",
    reason: "shelf",
    nowIso: "2026-11-18T00:00:00.000Z",
  });

  it("voids after reaching the vote threshold and ignores duplicate votes", () => {
    const twice = voteOnDispute(voteOnDispute(dispute, "b"), "b");
    expect(twice.voterIds).toHaveLength(2);
    expect(voteOnDispute(twice, "c").status).toBe("voided");
  });

  it("lets admins clear an open dispute but not reopen a settled one", () => {
    const cleared = resolveDispute(dispute, "cleared");
    expect(cleared.status).toBe("cleared");
    expect(resolveDispute(cleared, "voided").status).toBe("cleared");
  });
});
