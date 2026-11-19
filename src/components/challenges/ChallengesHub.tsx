"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { ChallengeScope } from "@/types/domain";
import { TopBar } from "@/components/shell/TopBar";
import { ME_ID } from "@/data/mock-data";
import { useAppState } from "@/state/AppStateProvider";
import { useUi } from "@/state/UiProvider";
import { ChallengeCard } from "./ChallengeCard";

const TABS: readonly { readonly value: ChallengeScope; readonly label: string }[] = [
  { value: "club", label: "Club" },
  { value: "community", label: "Community" },
];

function ChallengeTabBar({
  tab,
  onTab,
  onNew,
}: {
  readonly tab: ChallengeScope;
  readonly onTab: (next: ChallengeScope) => void;
  readonly onNew: () => void;
}) {
  return (
    <div className="mt-3 flex rounded-xl border border-hairline bg-void p-1" role="tablist">
      {TABS.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={tab === t.value}
          onClick={() => onTab(t.value)}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${tab === t.value ? "bg-graphite text-ink shadow" : "text-ink-faint hover:text-ink-muted"}`}
        >
          {t.label}
        </button>
      ))}
      <button
        type="button"
        onClick={onNew}
        className="flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold text-volt hover:bg-volt/10"
      >
        <Plus className="h-3.5 w-3.5" /> New
      </button>
    </div>
  );
}

export function ChallengesHub() {
  const { state } = useAppState();
  const { openSheet } = useUi();
  const [tab, setTab] = useState<ChallengeScope>("club");
  const myClubIds = new Set(
    state.clubs.filter((c) => c.memberIds.includes(ME_ID)).map((c) => c.id),
  );
  const list = state.challenges
    .filter(
      (c) =>
        c.scope === tab && (tab === "community" || (c.clubId !== null && myClubIds.has(c.clubId))),
    )
    .toSorted((a, b) => Number(b.joined) - Number(a.joined) || a.endsAt.localeCompare(b.endsAt));

  return (
    <>
      <TopBar title="Challenges">
        <ChallengeTabBar
          tab={tab}
          onTab={setTab}
          onNew={() => openSheet({ kind: "create_challenge", clubId: null })}
        />
      </TopBar>
      <div className="flex flex-col gap-3 px-4 pt-4">
        <p className="text-xs text-ink-muted">
          {tab === "club"
            ? "Private competitions inside your Clubs."
            : "Open to every Monster Rat. Climb the global board."}
        </p>
        {list.map((c) => (
          <ChallengeCard key={c.id} challenge={c} />
        ))}
        {list.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-muted">
            No Challenges here yet. Start one!
          </p>
        )}
      </div>
    </>
  );
}
