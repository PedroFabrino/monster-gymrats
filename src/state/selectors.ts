import type { CheckIn, Club, Flavor, Member, TimelineItem } from "@/types/domain";
import { FLAVORS } from "@/data/flavors";
import { ME_ID } from "@/data/mock-data";
import type { AppState } from "./app-state";

export type FeedItem =
  | {
      readonly kind: "check_in";
      readonly id: string;
      readonly postedAt: string;
      readonly checkIn: CheckIn;
    }
  | Exclude<TimelineItem, { readonly kind: "check_in" }>;

const FLAVOR_BY_ID = new Map(FLAVORS.map((f) => [f.id, f]));

export function flavorById(id: string | null): Flavor | undefined {
  return id === null ? undefined : FLAVOR_BY_ID.get(id);
}

export function memberById(state: AppState, id: string): Member | undefined {
  return state.members.find((m) => m.id === id);
}

export function me(state: AppState): Member {
  const found = memberById(state, ME_ID);
  if (found === undefined) throw new Error("Current member missing from state");
  return found;
}

export function myClubs(state: AppState): readonly Club[] {
  return state.clubs.filter((c) => c.memberIds.includes(ME_ID));
}

export function myCheckIns(state: AppState): readonly CheckIn[] {
  return state.checkIns.filter((c) => c.memberId === ME_ID);
}

function sharedIds(
  state: AppState,
  targetType: "club" | "challenge",
  targetId: string,
): Set<string> {
  return new Set(
    state.shares
      .filter((s) => s.targetType === targetType && s.targetId === targetId)
      .map((s) => s.checkInId),
  );
}

export function clubCheckIns(state: AppState, clubId: string): readonly CheckIn[] {
  const ids = sharedIds(state, "club", clubId);
  return state.checkIns.filter((c) => ids.has(c.id));
}

export function challengeCheckIns(state: AppState, challengeId: string): readonly CheckIn[] {
  const ids = sharedIds(state, "challenge", challengeId);
  return state.checkIns.filter((c) => ids.has(c.id));
}

export function clubFeed(state: AppState, clubId: string): readonly FeedItem[] {
  const checkIns: FeedItem[] = clubCheckIns(state, clubId).map((c) => ({
    kind: "check_in",
    id: c.id,
    postedAt: c.postedAt,
    checkIn: c,
  }));
  const events = state.events
    .filter((e) => e.clubId === clubId && e.item.kind !== "check_in")
    .map((e) => e.item)
    .filter((i): i is Exclude<TimelineItem, { kind: "check_in" }> => i.kind !== "check_in");
  return [...checkIns, ...events].toSorted((a, b) => a.postedAt.localeCompare(b.postedAt));
}

export function todayCount(checkIns: readonly CheckIn[], todayKey: string): number {
  return checkIns.filter((c) => c.consumedAt.startsWith(todayKey) && c.status !== "voided").length;
}

export function findClubByCode(state: AppState, code: string): Club | undefined {
  const normalized = code.trim().toUpperCase();
  return state.clubs.find((c) => c.inviteCode === normalized);
}
