"use client";

import { ArrowRight, Globe2, KeyRound, Mail, Plus } from "lucide-react";
import Link from "next/link";
import { TopBar } from "@/components/shell/TopBar";
import { daysUntil } from "@/domain/time";
import { useAppState } from "@/state/AppStateProvider";
import { useUi } from "@/state/UiProvider";
import { myClubs } from "@/state/selectors";
import { ClubCard } from "./ClubCard";

function CommunityBanner() {
  const { state } = useAppState();
  const { openSheet } = useUi();
  const featured = state.challenges.find((c) => c.id === "g-dex-2026");
  if (featured === undefined) return null;
  return (
    <button
      type="button"
      onClick={() => openSheet({ kind: "challenge", challengeId: featured.id })}
      className="press relative w-full overflow-hidden rounded-2xl border border-volt/30 bg-gradient-to-br from-[#1B2A05] via-carbon to-carbon p-4 text-left"
    >
      <div className="absolute -right-6 -top-10 h-36 w-36 rounded-full bg-volt/20 blur-3xl" />
      <span className="eyebrow flex items-center gap-1.5 !text-volt">
        <Globe2 className="h-3.5 w-3.5" /> Community Challenge
      </span>
      <h2 className="mt-1 font-display text-3xl font-extrabold uppercase leading-none">
        {featured.name}
      </h2>
      <p className="metric mt-2 text-xs text-ink-muted">
        {featured.playerCount.toLocaleString("en-US")} players • Ends in{" "}
        {daysUntil(state.nowIso, featured.endsAt)}d
      </p>
      <span className="mt-3 inline-flex items-center gap-1 rounded-lg bg-volt px-3 py-1.5 font-display text-sm font-bold uppercase text-void">
        View standings <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}

function ClubActions() {
  const { openSheet } = useUi();
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        className="btn-ghost"
        onClick={() => openSheet({ kind: "create_club" })}
      >
        <Plus className="h-4 w-4 text-volt" /> Create Club
      </button>
      <button type="button" className="btn-ghost" onClick={() => openSheet({ kind: "join_club" })}>
        <KeyRound className="h-4 w-4 text-volt" /> Join by Code
      </button>
    </div>
  );
}

export function ClubsHome() {
  const { state } = useAppState();
  const clubs = myClubs(state);
  return (
    <>
      <TopBar />
      <div className="flex flex-col gap-4 px-4 pt-4">
        <ClubActions />
        <CommunityBanner />
        <div className="flex items-center justify-between pt-2">
          <h2 className="eyebrow">Your Clubs • {clubs.length}</h2>
        </div>
        <div className="flex flex-col gap-3">
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
        <Link
          href="/join/night-shift"
          className="flex items-center gap-3 rounded-2xl border border-dashed border-hairline p-4 text-sm text-ink-muted transition-colors hover:border-volt/40 hover:text-ink"
        >
          <Mail className="h-5 w-5 text-series-ultra" />
          <span className="flex-1">Preview the friend invite and onboarding flow</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </>
  );
}
