import type { TimeWindow } from "@/types/domain";

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

export function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function addHours(iso: string, hours: number): string {
  return new Date(Date.parse(iso) + hours * HOUR_MS).toISOString();
}

export function addDays(iso: string, days: number): string {
  return addHours(iso, days * 24);
}

export function hoursBetween(fromIso: string, toIso: string): number {
  return (Date.parse(toIso) - Date.parse(fromIso)) / HOUR_MS;
}

export function daysUntil(nowIso: string, endIso: string): number {
  return Math.max(0, Math.ceil((Date.parse(endIso) - Date.parse(nowIso)) / DAY_MS));
}

export function formatRelative(iso: string, nowIso: string): string {
  const minutes = Math.round((Date.parse(nowIso) - Date.parse(iso)) / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateRange(startIso: string, endIso: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", timeZone: "UTC" };
  const start = new Date(startIso).toLocaleDateString("en-US", opts);
  const end = new Date(endIso).toLocaleDateString("en-US", opts);
  return `${start} – ${end}`;
}

const WINDOW_DAYS: Readonly<Record<Exclude<TimeWindow, "all">, number>> = {
  year: 365,
  month: 30,
  week: 7,
};

export function windowStart(window: TimeWindow, nowIso: string): string | null {
  if (window === "all") return null;
  return addDays(nowIso, -WINDOW_DAYS[window]);
}

export function isInWindow(iso: string, window: TimeWindow, nowIso: string): boolean {
  const start = windowStart(window, nowIso);
  return start === null || (iso >= start && iso <= nowIso);
}

export const TIME_WINDOW_LABEL: Readonly<Record<TimeWindow, string>> = {
  all: "All-Time",
  year: "This Year",
  month: "This Month",
  week: "This Week",
};
