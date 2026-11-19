import type {
  AppNotification,
  FlavorRequest,
  NotificationPrefs,
  RivalEntry,
  TimelineItem,
} from "@/types/domain";
import { ME_ID } from "./mock-data";

export const RIVAL_CLUBS: readonly RivalEntry[] = [
  { id: "r-1", name: "Can Crushers CWB", members: 31, points: 1184 },
  { id: "r-2", name: "Ultra Bros Lisbon", members: 9, points: 402 },
  { id: "r-3", name: "Midnight Coders", members: 18, points: 655 },
  { id: "r-4", name: "Lift & Sip", members: 24, points: 701 },
  { id: "r-5", name: "Juice Loco Crew", members: 6, points: 251 },
];

export const RIVAL_PLAYERS: readonly RivalEntry[] = [
  { id: "p-1", name: "ultra_hunter_br", members: 1, points: 44 },
  { id: "p-2", name: "kaito.cans", members: 1, points: 42 },
  { id: "p-3", name: "mango_maria", members: 1, points: 39 },
  { id: "p-4", name: "zero_sugar_zed", members: 1, points: 33 },
  { id: "p-5", name: "nightowl.dev", members: 1, points: 30 },
];

export const SEED_TIMELINE_EVENTS: readonly TimelineItem[] = [
  {
    kind: "chat",
    id: "t-1",
    memberId: "u-pedro",
    body: "Who drained the gas station Ultra Rosa? Shelf is empty again",
    postedAt: "2026-11-18T13:05:00.000Z",
  },
  {
    kind: "chat",
    id: "t-2",
    memberId: "u-marina",
    body: "Not me. Okay maybe two of them.",
    postedAt: "2026-11-18T13:07:00.000Z",
  },
  {
    kind: "system",
    id: "t-3",
    body: "Lucas unlocked Juice Bad Apple for the Club!",
    postedAt: "2026-11-18T16:41:00.000Z",
  },
  {
    kind: "chat",
    id: "t-4",
    memberId: "u-lucas",
    body: "Imported from a tiny shop downtown, worth every cent",
    postedAt: "2026-11-18T16:44:00.000Z",
  },
  {
    kind: "chat",
    id: "t-5",
    memberId: "u-bia",
    body: "@Thiago that is literally a store shelf photo",
    postedAt: "2026-11-18T18:12:00.000Z",
  },
  {
    kind: "system",
    id: "t-6",
    body: "Rafa hit a 14-day Monster Streak",
    postedAt: "2026-11-18T19:02:00.000Z",
  },
];

export const SEED_FLAVOR_REQUESTS: readonly FlavorRequest[] = [
  {
    id: "fr-1",
    name: "Ultra Strawberry Lime (JP Import)",
    brand: "monster",
    series: "Ultra",
    submittedBy: "u-diego",
    checkInId: "f-diego-import",
    submittedAt: "2026-11-18T15:20:00.000Z",
    upvoterIds: ["u-lucas", "u-ana"],
    status: "pending",
  },
  {
    id: "fr-2",
    name: "Ultra Citron (EU)",
    brand: "monster",
    series: "Ultra",
    submittedBy: "u-bia",
    checkInId: null,
    submittedAt: "2026-11-12T10:00:00.000Z",
    upvoterIds: ["u-marina", "u-julia", ME_ID],
    status: "pending",
  },
  {
    id: "fr-3",
    name: "Juice Aussie Lemonade",
    brand: "monster",
    series: "Juice",
    submittedBy: "u-joao",
    checkInId: null,
    submittedAt: "2026-10-02T10:00:00.000Z",
    upvoterIds: ["u-pedro"],
    status: "merged",
  },
  {
    id: "fr-4",
    name: "Homemade Monster Slushie",
    brand: "monster",
    series: "Original",
    submittedBy: "u-felipe",
    checkInId: null,
    submittedAt: "2026-09-21T10:00:00.000Z",
    upvoterIds: [],
    status: "rejected",
  },
];

export const SEED_NOTIFICATIONS: readonly AppNotification[] = [
  {
    id: "n-1",
    kind: "dispute",
    body: "Bia called BS on Thiago's Check-In. Cast your vote.",
    postedAt: "2026-11-18T18:10:00.000Z",
    read: false,
  },
  {
    id: "n-2",
    kind: "reaction",
    body: "Pedro and 3 others reacted to your Ultra Zero",
    postedAt: "2026-11-18T17:30:00.000Z",
    read: false,
  },
  {
    id: "n-3",
    kind: "mention",
    body: "Marina mentioned you in Night Shift Monsters",
    postedAt: "2026-11-18T13:08:00.000Z",
    read: false,
  },
  {
    id: "n-4",
    kind: "check_in",
    body: "Lucas unlocked Juice Bad Apple for the Club",
    postedAt: "2026-11-18T16:41:00.000Z",
    read: true,
  },
  {
    id: "n-5",
    kind: "recap",
    body: "Weekly recap: you logged 9 cans and 3 new Flavors",
    postedAt: "2026-11-16T09:00:00.000Z",
    read: true,
  },
];

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  check_in: true,
  dispute: true,
  reaction: true,
  mention: true,
  recap: false,
};
