import { ME_ID } from "@/data/mock-data";
import { championCrowns, clubDex, personalDex } from "@/domain/dex";
import type { AppState } from "./app-state";
import { clubCheckIns, myClubs } from "./selectors";

export interface DexCellView {
  readonly count: number;
  readonly crowned: boolean;
}

export function myCrownIds(state: AppState): ReadonlySet<string> {
  return new Set(
    myClubs(state).flatMap((c) => championCrowns(clubDex(clubCheckIns(state, c.id)), ME_ID)),
  );
}

export function myDexCells(state: AppState): ReadonlyMap<string, DexCellView> {
  const crowns = myCrownIds(state);
  return new Map(
    [...personalDex(state.checkIns, ME_ID)].map(([id, e]) => [
      id,
      { count: e.count, crowned: crowns.has(id) },
    ]),
  );
}

export function clubDexCells(state: AppState, clubId: string): ReadonlyMap<string, DexCellView> {
  return new Map(
    [...clubDex(clubCheckIns(state, clubId))].map(([id, e]) => [
      id,
      { count: e.count, crowned: e.championId === ME_ID },
    ]),
  );
}
