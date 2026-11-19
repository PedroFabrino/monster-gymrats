import type { CheckIn } from "@/types/domain";
import { isCounted } from "./eligibility";
import { addDays, dayKey } from "./time";

export type DayKind = "monster" | "offbrand";

export interface StreakSummary {
  readonly current: number;
  readonly longest: number;
}

export interface CalendarCell {
  readonly key: string;
  readonly day: number;
  readonly kind: DayKind | "rest" | "future";
}

export function dayActivity(
  checkIns: readonly CheckIn[],
  memberId: string,
): ReadonlyMap<string, DayKind> {
  const days = new Map<string, DayKind>();
  for (const c of checkIns) {
    if (c.memberId !== memberId || !isCounted(c)) continue;
    const key = dayKey(c.consumedAt);
    if (c.brand === "monster") days.set(key, "monster");
    else if (!days.has(key)) days.set(key, "offbrand");
  }
  return days;
}

function previousDay(key: string): string {
  return dayKey(addDays(`${key}T12:00:00.000Z`, -1));
}

function runLength(activity: ReadonlyMap<string, DayKind>, fromKey: string): number {
  let length = 0;
  let cursor = fromKey;
  while (activity.get(cursor) === "monster") {
    length += 1;
    cursor = previousDay(cursor);
  }
  return length;
}

export function monsterStreak(
  activity: ReadonlyMap<string, DayKind>,
  todayKey: string,
): StreakSummary {
  const start = activity.get(todayKey) === "monster" ? todayKey : previousDay(todayKey);
  const current = runLength(activity, start);
  const longest = [...activity.keys()]
    .filter((k) => activity.get(k) === "monster" && activity.get(previousDay(k)) !== "monster")
    .reduce((max, k) => Math.max(max, runForward(activity, k)), 0);
  return { current, longest: Math.max(longest, current) };
}

function runForward(activity: ReadonlyMap<string, DayKind>, fromKey: string): number {
  let length = 0;
  let cursor = fromKey;
  while (activity.get(cursor) === "monster") {
    length += 1;
    cursor = dayKey(addDays(`${cursor}T12:00:00.000Z`, 1));
  }
  return length;
}

export function monthCalendar(
  activity: ReadonlyMap<string, DayKind>,
  monthKey: string,
  todayKey: string,
): { readonly leadingBlanks: number; readonly cells: readonly CalendarCell[] } {
  const first = new Date(`${monthKey}-01T12:00:00.000Z`);
  const daysInMonth = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const cells = Array.from({ length: daysInMonth }, (_, i): CalendarCell => {
    const key = `${monthKey}-${String(i + 1).padStart(2, "0")}`;
    const kind = key > todayKey ? "future" : (activity.get(key) ?? "rest");
    return { key, day: i + 1, kind };
  });
  return { leadingBlanks: first.getUTCDay(), cells };
}
