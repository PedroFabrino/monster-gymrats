import type { CheckIn } from "@/types/domain";
import { createCheckIn } from "@/domain/check-in";
import { addHours } from "@/domain/time";
import { DEMO_NOW, ME_ID } from "./mock-data";

const at = (time: string): string => `2026-11-18T${time}:00.000Z`;

export const FEATURED_CHECK_INS: readonly CheckIn[] = [
  {
    ...createCheckIn({
      id: "f-pedro-uz",
      memberId: "u-pedro",
      brand: "monster",
      flavorId: "ultra-zero",
      volumeMl: 473,
      rating: 5,
      priceCents: 299,
      caption: "Night shift fuel. Clear shot so the AI gets it right.",
      consumedAt: at("12:40"),
      postedAt: at("12:41"),
      scene: "studio",
    }),
    reactions: {
      bolt: ["u-lucas", "u-bia", ME_ID, "u-joao"],
      heart: ["u-marina", "u-ana"],
      siren: [],
    },
    comments: [
      {
        id: "cm-1",
        memberId: "u-lucas",
        body: "The white can never misses",
        postedAt: at("12:50"),
      },
      { id: "cm-2", memberId: ME_ID, body: "Saving one for 3am", postedAt: at("12:58") },
    ],
  },
  {
    ...createCheckIn({
      id: "f-marina-rosa",
      memberId: "u-marina",
      brand: "monster",
      flavorId: "ultra-rosa",
      volumeMl: 473,
      rating: 4,
      caption: "Forgot to log this one on the drive in",
      consumedAt: at("10:15"),
      postedAt: at("13:15"),
      scene: "car",
    }),
    reactions: { bolt: ["u-pedro"], heart: ["u-bia", "u-julia"], siren: [] },
  },
  {
    ...createCheckIn({
      id: "f-diego-import",
      memberId: "u-diego",
      brand: "monster",
      flavorId: null,
      requestedFlavorName: "Ultra Strawberry Lime (JP Import)",
      volumeMl: 355,
      rating: 5,
      priceCents: 549,
      caption: "Found this at the Japanese market. Submitted a Flavor Request!",
      consumedAt: at("15:18"),
      postedAt: at("15:20"),
      scene: "desk",
    }),
    reactions: { bolt: ["u-lucas", "u-ana", ME_ID], heart: [], siren: [] },
  },
  {
    ...createCheckIn({
      id: "f-lucas-bad-apple",
      memberId: "u-lucas",
      brand: "monster",
      flavorId: "bad-apple",
      volumeMl: 473,
      rating: 4,
      priceCents: 349,
      caption: "Club unlock! Tastes like a green candy apple.",
      consumedAt: at("16:38"),
      postedAt: at("16:40"),
      scene: "gym",
    }),
    reactions: {
      bolt: ["u-pedro", "u-bia", "u-thiago", "u-joao", "u-camila"],
      heart: [ME_ID],
      siren: [],
    },
  },
  {
    ...createCheckIn({
      id: "f-camila-rb",
      memberId: "u-camila",
      brand: "redbull",
      flavorId: "redbull-sugarfree",
      volumeMl: 355,
      rating: 3,
      caption: "They were out of Pipeline. Forgive me.",
      consumedAt: at("17:05"),
      postedAt: at("17:06"),
      scene: "studio",
    }),
    reactions: { bolt: [], heart: ["u-julia"], siren: ["u-pedro", "u-lucas", "u-bia"] },
  },
  {
    ...createCheckIn({
      id: "f-thiago-shelf",
      memberId: "u-thiago",
      brand: "monster",
      flavorId: "original",
      volumeMl: 473,
      rating: 5,
      caption: "Cracked three today, trust me",
      consumedAt: at("18:02"),
      postedAt: at("18:03"),
      scene: "shelf",
      unverified: true,
    }),
    reactions: { bolt: ["u-felipe"], heart: [], siren: ["u-bia", "u-pedro"] },
    dispute: {
      id: "d-1",
      raisedBy: "u-bia",
      reason: "This is a store shelf photo, not a can in hand.",
      voterIds: ["u-bia", "u-pedro"],
      votesNeeded: 3,
      expiresAt: addHours(DEMO_NOW, 41),
      status: "open",
    },
  },
];
