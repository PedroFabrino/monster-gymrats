import type { Challenge, Club, Member } from "@/types/domain";

export const DEMO_NOW = "2026-11-18T21:30:00.000Z";
export const ME_ID = "u-me";
export const HOME_CLUB_ID = "night-shift";

function member(
  id: string,
  displayName: string,
  avatarColor: string,
  signatureFlavorId: string,
): Member {
  return { id, displayName, handle: displayName.toLowerCase(), avatarColor, signatureFlavorId };
}

export const MEMBERS: readonly Member[] = [
  member(ME_ID, "Rafa", "#95D600", "ultra-zero"),
  member("u-pedro", "Pedro", "#00D4FF", "ultra-paradise"),
  member("u-lucas", "Lucas", "#FF9F1C", "mango-loco"),
  member("u-bia", "Bia", "#FF4D8D", "ultra-rosa"),
  member("u-thiago", "Thiago", "#F97316", "original"),
  member("u-marina", "Marina", "#38BDF8", "ultra-rosa"),
  member("u-joao", "Joao", "#FFB703", "rehab-tea-lemonade"),
  member("u-camila", "Camila", "#22C55E", "pipeline-punch"),
  member("u-diego", "Diego", "#D97706", "java-mean-bean"),
  member("u-ana", "Ana", "#E2E8F0", "ultra-strawberry"),
  member("u-felipe", "Felipe", "#EAB308", "zero-sugar"),
  member("u-julia", "Julia", "#F472B6", "ultra-watermelon"),
  member("u-nico", "Nico", "#60A5FA", "pacific-punch"),
  member("u-leo", "Leo", "#4ADE80", "ultra-gold"),
  member("u-sam", "Sam", "#FB7185", "khaotic"),
  member("u-vic", "Vic", "#A3E635", "lo-carb"),
];

const NIGHT_SHIFT_MEMBERS = MEMBERS.slice(0, 12).map((m) => m.id);

export const CLUBS: readonly Club[] = [
  {
    id: HOME_CLUB_ID,
    name: "Night Shift Monsters",
    inviteCode: "NIGHT-SHIFT",
    memberIds: NIGHT_SHIFT_MEMBERS,
    adminIds: ["u-pedro", ME_ID],
    tagline: "Graveyard shift. Green cans. No excuses.",
  },
  {
    id: "ultra-society",
    name: "Ultra Zero Society",
    inviteCode: "ULTRA-ZERO",
    memberIds: [ME_ID, "u-bia", "u-marina", "u-ana", "u-julia"],
    adminIds: ["u-bia"],
    tagline: "White cans only (mostly).",
  },
  {
    id: "fridge-raiders",
    name: "Office Fridge Raiders",
    inviteCode: "FRIDGE-42",
    memberIds: [ME_ID, "u-diego", "u-felipe", "u-camila", "u-joao", "u-nico", "u-leo"],
    adminIds: ["u-diego"],
    tagline: "Whoever empties the fridge restocks it.",
  },
  {
    id: "gas-station-gang",
    name: "Gas Station Gang",
    inviteCode: "GAS-777",
    memberIds: ["u-nico", "u-leo", "u-sam", "u-vic"],
    adminIds: ["u-sam"],
    tagline: "Every pump stop is a Check-In.",
  },
];

export const CHALLENGES: readonly Challenge[] = [
  {
    id: "c-no-skip",
    name: "November No-Skip",
    scope: "club",
    clubId: HOME_CLUB_ID,
    brandRule: "monster_only",
    scoring: "active_days",
    dailyPointCap: 1,
    startsAt: "2026-11-01T00:00:00.000Z",
    endsAt: "2026-11-30T23:59:59.000Z",
    playerCount: 12,
    joined: true,
  },
  {
    id: "c-flavor-hunt",
    name: "Q4 Flavor Hunt",
    scope: "club",
    clubId: HOME_CLUB_ID,
    brandRule: "multi_brand",
    scoring: "flavor_hunter",
    dailyPointCap: 1,
    startsAt: "2026-10-01T00:00:00.000Z",
    endsAt: "2026-12-31T23:59:59.000Z",
    playerCount: 11,
    joined: true,
  },
  {
    id: "c-ultra-month",
    name: "Ultra Monthly Volume",
    scope: "club",
    clubId: "ultra-society",
    brandRule: "monster_only",
    scoring: "total_cans",
    dailyPointCap: 1,
    startsAt: "2026-11-01T00:00:00.000Z",
    endsAt: "2026-11-30T23:59:59.000Z",
    playerCount: 5,
    joined: true,
  },
  {
    id: "c-fridge-sprint",
    name: "Fridge Raid Sprint",
    scope: "club",
    clubId: "fridge-raiders",
    brandRule: "multi_brand",
    scoring: "total_cans",
    dailyPointCap: 2,
    startsAt: "2026-11-10T00:00:00.000Z",
    endsAt: "2026-11-24T23:59:59.000Z",
    playerCount: 7,
    joined: true,
  },
  {
    id: "g-dex-2026",
    name: "Global Monster Dex 2026",
    scope: "community",
    clubId: null,
    brandRule: "monster_only",
    scoring: "flavor_dex",
    dailyPointCap: 1,
    startsAt: "2026-01-01T00:00:00.000Z",
    endsAt: "2026-11-30T21:30:00.000Z",
    playerCount: 4812,
    joined: true,
  },
  {
    id: "g-winter-cup",
    name: "Winter Volume Cup",
    scope: "community",
    clubId: null,
    brandRule: "monster_only",
    scoring: "total_cans",
    dailyPointCap: 1,
    startsAt: "2026-11-15T00:00:00.000Z",
    endsAt: "2026-12-15T23:59:59.000Z",
    playerCount: 2140,
    joined: true,
  },
  {
    id: "g-any-can-open",
    name: "Any-Can Active Days Open",
    scope: "community",
    clubId: null,
    brandRule: "multi_brand",
    scoring: "active_days",
    dailyPointCap: 1,
    startsAt: "2026-11-01T00:00:00.000Z",
    endsAt: "2026-12-31T23:59:59.000Z",
    playerCount: 1367,
    joined: false,
  },
];
