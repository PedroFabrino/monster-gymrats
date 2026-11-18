"use client";

import { ArrowLeft, Link2, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Club } from "@/types/domain";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { DexBrowser } from "@/components/dex/DexBrowser";
import { TimelineTab } from "@/components/timeline/TimelineTab";
import { useAppState } from "@/state/AppStateProvider";
import { clubDexCells } from "@/state/dex-selectors";
import { useUi } from "@/state/UiProvider";
import { ClubLeaderboard } from "./ClubLeaderboard";

type ClubTab = "timeline" | "leaderboard" | "dex" | "challenges";

const TABS: readonly { readonly value: ClubTab; readonly label: string }[] = [
  { value: "timeline", label: "Timeline" },
  { value: "leaderboard", label: "Leaderboard" },
  { value: "dex", label: "Club Flavor Dex" },
  { value: "challenges", label: "Challenges" },
];

function ClubChallenges({ club }: { readonly club: Club }) {
  const { state } = useAppState();
  const { openSheet } = useUi();
  const list = state.challenges.filter((c) => c.clubId === club.id);
  return (
    <div className="flex flex-col gap-3 px-4 pt-4">
      <button
        type="button"
        className="btn-ghost"
        onClick={() => openSheet({ kind: "create_challenge", clubId: club.id })}
      >
        <Plus className="h-4 w-4 text-volt" /> New Club Challenge
      </button>
      {list.map((c) => (
        <ChallengeCard key={c.id} challenge={c} />
      ))}
      {list.length === 0 && (
        <p className="py-8 text-center text-sm text-ink-muted">No Challenges in this Club yet.</p>
      )}
    </div>
  );
}

function ClubDexTab({ club }: { readonly club: Club }) {
  const { state } = useAppState();
  const cells = useMemo(() => clubDexCells(state, club.id), [state, club.id]);
  return (
    <div className="px-4 pt-4">
      <DexBrowser cells={cells} clubId={club.id} caption="Club Flavor Dex" />
    </div>
  );
}

function copyInvite(url: string, onDone: (msg: string) => void) {
  if (navigator.clipboard === undefined) {
    onDone(`Invite link: ${url}`);
    return;
  }
  navigator.clipboard.writeText(url).then(
    () => onDone("Invite link copied"),
    () => onDone(`Invite link: ${url}`),
  );
}

export function ClubView({ club }: { readonly club: Club }) {
  const { showToast } = useUi();
  const [tab, setTab] = useState<ClubTab>("timeline");
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-hairline/60 bg-void/90 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4">
          <Link
            href="/clubs"
            aria-label="Back to Clubs"
            className="press rounded-full bg-carbon p-2 text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-2xl font-extrabold uppercase leading-none">
              {club.name}
            </h1>
            <p className="metric mt-0.5 text-[11px] text-ink-faint">
              {club.memberIds.length} members • Code {club.inviteCode}
            </p>
          </div>
          <button
            type="button"
            onClick={() => copyInvite(`${window.location.origin}/join/${club.id}`, showToast)}
            className="press flex items-center gap-1.5 rounded-full border border-volt/40 bg-volt/10 px-3 py-1.5 text-xs font-semibold text-volt"
          >
            <Link2 className="h-3.5 w-3.5" /> Copy Invite
          </button>
        </div>
        <nav className="no-scrollbar mt-3 flex gap-5 overflow-x-auto px-4" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => setTab(t.value)}
              className={`shrink-0 border-b-2 pb-2.5 text-sm font-semibold transition-colors ${tab === t.value ? "border-volt text-ink" : "border-transparent text-ink-faint hover:text-ink-muted"}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      {tab === "timeline" && <TimelineTab club={club} />}
      {tab === "leaderboard" && <ClubLeaderboard club={club} />}
      {tab === "dex" && <ClubDexTab club={club} />}
      {tab === "challenges" && <ClubChallenges club={club} />}
    </>
  );
}
