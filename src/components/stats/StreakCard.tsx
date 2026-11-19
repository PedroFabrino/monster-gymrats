"use client";

import { Flame, Trophy } from "lucide-react";
import { useMemo } from "react";
import { ME_ID } from "@/data/mock-data";
import { dayActivity, monthCalendar, type CalendarCell, type StreakSummary } from "@/domain/streak";
import { useAppState } from "@/state/AppStateProvider";
import { useStreak, useTodayKey } from "@/state/hooks";

const CELL_STYLE: Readonly<Record<CalendarCell["kind"], string>> = {
  monster: "bg-volt text-void font-bold shadow-[0_0_10px_rgba(149,214,0,0.35)]",
  offbrand: "bg-status-offbrand text-void font-bold",
  rest: "bg-graphite text-ink-faint",
  future: "border border-dashed border-hairline text-ink-faint/50",
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function StreakTotals({ streak }: { readonly streak: StreakSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-volt/10 p-3">
        <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-volt">
          <Flame className="h-3.5 w-3.5" /> Current
        </p>
        <p className="metric text-3xl font-bold text-volt">
          {streak.current}
          <span className="text-base"> days</span>
        </p>
      </div>
      <div className="rounded-xl bg-graphite p-3">
        <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-ink-muted">
          <Trophy className="h-3.5 w-3.5" /> Longest
        </p>
        <p className="metric text-3xl font-bold">
          {streak.longest}
          <span className="text-base text-ink-muted"> days</span>
        </p>
      </div>
    </div>
  );
}

function CalendarLegend() {
  return (
    <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-ink-muted">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm bg-volt" /> Monster
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm bg-status-offbrand" /> Off-Brand only (no streak)
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm bg-graphite" /> Rest day
      </span>
    </div>
  );
}

export function StreakCard() {
  const { state } = useAppState();
  const today = useTodayKey();
  const streak = useStreak();
  const calendar = useMemo(
    () => monthCalendar(dayActivity(state.checkIns, ME_ID), today.slice(0, 7), today),
    [state.checkIns, today],
  );
  const monthLabel = new Date(`${today}T12:00:00.000Z`).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <section className="card p-4">
      <StreakTotals streak={streak} />
      <h3 className="eyebrow mb-2 mt-4">Monster Streak • {monthLabel}</h3>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={`${d}-${i}`} className="text-[10px] text-ink-faint">
            {d}
          </span>
        ))}
        {Array.from({ length: calendar.leadingBlanks }, (_, i) => (
          <span key={`b-${i}`} />
        ))}
        {calendar.cells.map((c) => (
          <span
            key={c.key}
            title={`${c.key}: ${c.kind}`}
            className={`metric flex aspect-square items-center justify-center rounded-md text-[11px] ${CELL_STYLE[c.kind]} ${c.key === today ? "ring-2 ring-ink" : ""}`}
          >
            {c.day}
          </span>
        ))}
      </div>
      <CalendarLegend />
    </section>
  );
}
