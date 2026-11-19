import type { Challenge, CheckIn, RivalEntry, ScoringMode } from "@/types/domain";
import { isEligibleForChallenge } from "./eligibility";
import { dayKey } from "./time";

export interface MemberScore {
  readonly memberId: string;
  readonly points: number;
  readonly cans: number;
  readonly cappedOut: number;
}

export const SCORING_LABEL: Readonly<Record<ScoringMode, string>> = {
  total_cans: "Total Cans",
  flavor_dex: "Flavor Dex Mode",
  active_days: "Active Days",
  flavor_hunter: "Flavor Hunter Points",
};

export const SCORING_HINT: Readonly<Record<ScoringMode, string>> = {
  total_cans: "1 point per can, up to the Daily Point Cap",
  flavor_dex: "1 point per unique Flavor logged",
  active_days: "1 point per day with a Check-In",
  flavor_hunter: "1 point per capped can, +2 for every new Flavor (uncapped)",
};

const NEW_FLAVOR_BONUS = 2;

function pointsFor(mode: ScoringMode, cap: number, sorted: readonly CheckIn[]): number {
  if (mode === "flavor_dex") return new Set(sorted.map((c) => c.flavorId ?? c.id)).size;
  if (mode === "active_days") return new Set(sorted.map((c) => dayKey(c.consumedAt))).size;
  const perDay = new Map<string, number>();
  const seen = new Set<string>();
  let points = 0;
  for (const c of sorted) {
    const day = dayKey(c.consumedAt);
    const used = perDay.get(day) ?? 0;
    perDay.set(day, used + 1);
    const basePoint = used < cap ? 1 : 0;
    const flavorKey = c.flavorId ?? c.id;
    const bonus = mode === "flavor_hunter" && !seen.has(flavorKey) ? NEW_FLAVOR_BONUS : 0;
    seen.add(flavorKey);
    points += basePoint + bonus;
  }
  return points;
}

function cappedOutCount(cap: number, sorted: readonly CheckIn[]): number {
  const perDay = new Map<string, number>();
  for (const c of sorted)
    perDay.set(dayKey(c.consumedAt), (perDay.get(dayKey(c.consumedAt)) ?? 0) + 1);
  return [...perDay.values()].reduce((sum, n) => sum + Math.max(0, n - cap), 0);
}

export function scoreMember(
  challenge: Challenge,
  checkIns: readonly CheckIn[],
  memberId: string,
): MemberScore {
  const sorted = checkIns
    .filter((c) => c.memberId === memberId && isEligibleForChallenge(c, challenge))
    .toSorted((a, b) => a.consumedAt.localeCompare(b.consumedAt));
  return {
    memberId,
    points: pointsFor(challenge.scoring, challenge.dailyPointCap, sorted),
    cans: sorted.length,
    cappedOut: cappedOutCount(challenge.dailyPointCap, sorted),
  };
}

export function challengeStandings(
  challenge: Challenge,
  checkIns: readonly CheckIn[],
  memberIds: readonly string[],
): readonly MemberScore[] {
  return memberIds
    .map((id) => scoreMember(challenge, checkIns, id))
    .toSorted((a, b) => b.points - a.points || b.cans - a.cans);
}

export interface CapNotice {
  readonly cansToday: number;
  readonly pointsToday: number;
}

export function todayCapNotice(
  challenge: Challenge,
  checkIns: readonly CheckIn[],
  options: { readonly memberId: string; readonly todayKey: string },
): CapNotice {
  const today = checkIns.filter(
    (c) =>
      c.memberId === options.memberId &&
      dayKey(c.consumedAt) === options.todayKey &&
      isEligibleForChallenge(c, challenge),
  );
  return {
    cansToday: today.length,
    pointsToday: Math.min(today.length, challenge.dailyPointCap),
  };
}

export type ClubVsClubMode = "total" | "average";

export interface ClubStanding {
  readonly id: string;
  readonly name: string;
  readonly members: number;
  readonly score: number;
}

export function clubVsClub(
  entries: readonly RivalEntry[],
  mode: ClubVsClubMode,
): readonly ClubStanding[] {
  return entries
    .map((e) => ({
      id: e.id,
      name: e.name,
      members: e.members,
      score:
        mode === "total" ? e.points : Math.round((e.points / Math.max(1, e.members)) * 10) / 10,
    }))
    .toSorted((a, b) => b.score - a.score);
}
