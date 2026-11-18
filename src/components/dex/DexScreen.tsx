"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { TopBar } from "@/components/shell/TopBar";
import { Segmented } from "@/components/ui/Controls";
import { HOME_CLUB_ID } from "@/data/mock-data";
import { useAppState } from "@/state/AppStateProvider";
import { clubDexCells, myDexCells } from "@/state/dex-selectors";
import { myClubs } from "@/state/selectors";
import { DexBrowser } from "./DexBrowser";
import { FlavorRequestsList } from "./FlavorRequestsList";

type DexMode = "my" | "club" | "requests";

const MODES: readonly { readonly value: DexMode; readonly label: string }[] = [
  { value: "my", label: "My Dex" },
  { value: "club", label: "Club Dex" },
  { value: "requests", label: "Flavor Requests" },
];

export function DexScreen() {
  const { state } = useAppState();
  const [mode, setMode] = useState<DexMode>("my");
  const clubs = myClubs(state);
  const [clubId, setClubId] = useState(
    clubs.find((c) => c.id === HOME_CLUB_ID)?.id ?? clubs[0]?.id ?? "",
  );
  const club = clubs.find((c) => c.id === clubId);
  const myCells = useMemo(() => myDexCells(state), [state]);
  const clubCells = useMemo(() => clubDexCells(state, clubId), [state, clubId]);

  return (
    <>
      <TopBar title="Flavor Dex">
        <div className="mt-3">
          <Segmented options={MODES} value={mode} onChange={setMode} />
        </div>
      </TopBar>
      <div className="flex flex-col gap-4 px-4 pt-4">
        {mode === "club" && (
          <label className="relative block">
            <span className="sr-only">Choose Club</span>
            <select
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              className="input appearance-none pr-10 font-semibold"
            >
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          </label>
        )}
        {mode === "my" && (
          <DexBrowser key="my" cells={myCells} clubId={null} caption="Your Flavor Dex" />
        )}
        {mode === "club" && club !== undefined && (
          <DexBrowser
            key={club.id}
            cells={clubCells}
            clubId={club.id}
            caption={`${club.name} Dex`}
          />
        )}
        {mode === "club" && club === undefined && (
          <p className="py-10 text-center text-sm text-ink-muted">
            Join a Club to see a shared Flavor Dex.
          </p>
        )}
        {mode === "requests" && <FlavorRequestsList />}
      </div>
    </>
  );
}
