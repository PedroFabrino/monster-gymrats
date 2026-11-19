"use client";

import { useMemo } from "react";
import type { Member } from "@/types/domain";
import { ME_ID } from "@/data/mock-data";
import { dayActivity, monsterStreak, type StreakSummary } from "@/domain/streak";
import { dayKey } from "@/domain/time";
import { useAppState } from "./AppStateProvider";
import { me } from "./selectors";

export function useMe(): Member {
  const { state } = useAppState();
  return me(state);
}

export function useTodayKey(): string {
  const { state } = useAppState();
  return dayKey(state.nowIso);
}

export function useStreak(memberId: string = ME_ID): StreakSummary {
  const { state } = useAppState();
  const today = dayKey(state.nowIso);
  return useMemo(
    () => monsterStreak(dayActivity(state.checkIns, memberId), today),
    [state.checkIns, memberId, today],
  );
}
