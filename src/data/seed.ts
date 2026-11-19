import type { CheckIn, GroupShare, Member, PhotoScene } from "@/types/domain";
import { createCheckIn } from "@/domain/check-in";
import { buildShareOptions } from "@/domain/fanout";
import { addDays, addHours, dayKey } from "@/domain/time";
import { FLAVORS, MONSTER_FLAVORS } from "./flavors";
import { CHALLENGES, CLUBS, DEMO_NOW, ME_ID, MEMBERS } from "./mock-data";
import { FEATURED_CHECK_INS } from "./featured-check-ins";

const HISTORY_DAYS = 90;
const CLUB_LOCKED = new Set([
  "ultra-ruby",
  "ultra-wild-passion",
  "papillon",
  "java-irish-blend",
  "nitro-cosmic-peach",
  "reserve-kiwi-strawberry",
  "bad-apple",
  "monster-super-cola",
  "juice-viking-berry",
  "reserve-peaches-creme",
]);
const CAPTIONS = [
  "",
  "",
  "",
  "Pre-shift ritual",
  "Leg day fuel",
  "3am debugging juice",
  "Ice cold",
];
const SCENES: readonly PhotoScene[] = ["studio", "studio", "car", "gym", "desk", "dark"];
const PRICES = [null, null, 249, 299, 329, 349] as const;

type Rng = () => number;

function mulberry32(seed: number): Rng {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: Rng, items: readonly T[], fallback: T): T {
  return items[Math.floor(rng() * items.length)] ?? fallback;
}

function flavorPool(rng: Rng, signature: string, size: number): readonly string[] {
  const eligible = MONSTER_FLAVORS.filter((f) => !CLUB_LOCKED.has(f.id) && f.id !== signature)
    .map((f) => ({ id: f.id, sort: rng() }))
    .toSorted((a, b) => a.sort - b.sort)
    .map((x) => x.id);
  return [signature, ...eligible.slice(0, size - 1)];
}

type DayPlan = { readonly cans: number; readonly offBrandOnly: boolean };

function myDayPlan(d: number, rng: Rng): DayPlan {
  if (d === 0) return { cans: 2, offBrandOnly: false };
  if (d === 14) return { cans: 1, offBrandOnly: true };
  if (d === 19 || d === 49) return { cans: 0, offBrandOnly: false };
  if (d < 49) return { cans: rng() < 0.15 ? 2 : 1, offBrandOnly: false };
  return { cans: rng() < 0.6 ? 1 : 0, offBrandOnly: false };
}

function otherDayPlan(rng: Rng, activity: number): DayPlan {
  if (rng() > activity) return { cans: 0, offBrandOnly: false };
  return { cans: rng() < 0.15 ? 2 : 1, offBrandOnly: rng() < 0.05 };
}

interface HistoryContext {
  readonly profile: Member;
  readonly rng: Rng;
  readonly pool: readonly string[];
  readonly reactors: readonly string[];
}

interface Slot {
  readonly d: number;
  readonly n: number;
  readonly offBrand: boolean;
}

function slotTime(rng: Rng, slot: Slot): string {
  const hour = slot.d === 0 ? 8 + slot.n * 5 + Math.floor(rng() * 4) : 7 + Math.floor(rng() * 16);
  const minute = Math.floor(rng() * 60);
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `${dayKey(addDays(DEMO_NOW, -slot.d))}T${hh}:${mm}:00.000Z`;
}

function slotFlavor(ctx: HistoryContext, offBrand: boolean): string {
  const signature = ctx.profile.signatureFlavorId;
  if (offBrand) return pick(ctx.rng, ["redbull-sugarfree", "reign-melon-mania"], signature);
  return ctx.rng() < 0.35 ? signature : pick(ctx.rng, ctx.pool, signature);
}

function historyCheckIn(ctx: HistoryContext, slot: Slot): CheckIn {
  const { rng, profile, reactors } = ctx;
  const consumedAt = slotTime(rng, slot);
  const flavorId = slotFlavor(ctx, slot.offBrand);
  const flavor = FLAVORS.find((f) => f.id === flavorId);
  const base = createCheckIn({
    id: `h-${profile.id}-${slot.d}-${slot.n}`,
    memberId: profile.id,
    brand: flavor?.brand ?? "monster",
    flavorId,
    volumeMl: flavor?.volumeMl ?? 473,
    rating: 3 + Math.floor(rng() * 3),
    priceCents: pick(rng, PRICES, null),
    caption: pick(rng, CAPTIONS, ""),
    consumedAt,
    postedAt: addHours(consumedAt, slot.d > 1 && rng() < 0.04 ? 4 : 0.05),
    scene: pick(rng, SCENES, "studio"),
  });
  const boltCount = Math.floor(rng() * 5);
  return {
    ...base,
    reactions: {
      bolt: reactors.slice(0, boltCount),
      heart: reactors.slice(boltCount, boltCount + Math.floor(rng() * 3)),
      siren: slot.offBrand ? reactors.slice(-2) : [],
    },
  };
}

function generateMemberHistory(profile: Member, memberIndex: number): readonly CheckIn[] {
  const rng = mulberry32(1000 + memberIndex * 97);
  const isMe = profile.id === ME_ID;
  const poolSize = isMe ? 28 : 6 + Math.floor(rng() * 14);
  const ctx: HistoryContext = {
    profile,
    rng,
    pool: flavorPool(rng, profile.signatureFlavorId, poolSize),
    reactors: MEMBERS.slice(0, 12)
      .map((m) => m.id)
      .filter((id) => id !== profile.id),
  };
  const activity = 0.45 + rng() * 0.45;
  const days = Array.from({ length: HISTORY_DAYS }, (_, i) => HISTORY_DAYS - 1 - i);
  return days.flatMap((d) => {
    const plan = isMe ? myDayPlan(d, rng) : otherDayPlan(rng, activity);
    return Array.from({ length: plan.cans }, (_, n) =>
      historyCheckIn(ctx, { d, n, offBrand: plan.offBrandOnly }),
    );
  });
}

export function buildSharesFor(checkIn: CheckIn): readonly GroupShare[] {
  return buildShareOptions(
    { memberId: checkIn.memberId, brand: checkIn.brand, consumedAt: checkIn.consumedAt },
    CLUBS,
    CHALLENGES,
  )
    .filter((o) => o.selected)
    .map((o) => ({ checkInId: checkIn.id, targetType: o.targetType, targetId: o.targetId }));
}

export interface SeedWorld {
  readonly checkIns: readonly CheckIn[];
  readonly shares: readonly GroupShare[];
}

export function generateSeedWorld(): SeedWorld {
  const history = MEMBERS.flatMap((m, index) => generateMemberHistory(m, index));
  const checkIns = [...history, ...FEATURED_CHECK_INS].toSorted((a, b) =>
    a.postedAt.localeCompare(b.postedAt),
  );
  return { checkIns, shares: checkIns.flatMap(buildSharesFor) };
}
