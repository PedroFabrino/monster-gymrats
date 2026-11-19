"use client";

import { ArrowRight, Download, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Club, Member } from "@/types/domain";
import { Wordmark } from "@/components/shell/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { MONSTER_FLAVORS } from "@/data/flavors";
import type { ProfileUpdate } from "@/state/app-state";
import { useAppState } from "@/state/AppStateProvider";
import { clubDexCells } from "@/state/dex-selectors";
import { useMe } from "@/state/hooks";
import { useUi } from "@/state/UiProvider";
import { FlairFields } from "./FlairFields";

const PROVIDERS = [
  { id: "google", label: "Continue with Google", cls: "bg-white text-void" },
  { id: "discord", label: "Continue with Discord", cls: "bg-[#5865F2] text-white" },
] as const;

function InvalidInviteView() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
      <Wordmark />
      <p className="text-sm text-ink-muted">This invite link is invalid or has expired.</p>
      <Link href="/clubs" className="btn-ghost">
        Go to Clubs
      </Link>
    </div>
  );
}

function InviteCard({
  club,
  owner,
  unlocked,
}: {
  readonly club: Club;
  readonly owner: Member | undefined;
  readonly unlocked: number;
}) {
  return (
    <div className="card relative overflow-hidden border-volt/40 p-5">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-volt/15 blur-3xl" />
      {owner !== undefined && <Avatar member={owner} size="lg" />}
      <p className="mt-4 text-sm text-ink-muted">
        {owner?.displayName ?? "A friend"} invited you to join
      </p>
      <h1 className="font-display text-4xl font-extrabold uppercase leading-tight">{club.name}</h1>
      <p className="metric mt-2 text-sm text-ink-muted">
        {club.memberIds.length} members •{" "}
        <span className="text-volt">
          {unlocked}/{MONSTER_FLAVORS.length}
        </span>{" "}
        Flavors Unlocked
      </p>
    </div>
  );
}

function AuthButtons({
  onAuth,
  onInstall,
}: {
  readonly onAuth: () => void;
  readonly onInstall: () => void;
}) {
  return (
    <div className="mt-auto flex flex-col gap-2.5 pt-8">
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`press flex h-12 items-center justify-center rounded-xl text-sm font-semibold ${p.cls}`}
          onClick={onAuth}
        >
          {p.label}
        </button>
      ))}
      <button type="button" className="btn-ghost h-12" onClick={onAuth}>
        <Mail className="h-4 w-4" /> Continue with Email
      </button>
      <button
        type="button"
        className="mt-2 flex items-center justify-center gap-1.5 text-xs text-ink-muted hover:text-ink"
        onClick={onInstall}
      >
        <Download className="h-3.5 w-3.5" /> How to install the app
      </button>
    </div>
  );
}

function FlairStep({
  clubName,
  profile,
  onChange,
  onEnter,
}: {
  readonly clubName: string;
  readonly profile: ProfileUpdate;
  readonly onChange: (next: ProfileUpdate) => void;
  readonly onEnter: () => void;
}) {
  return (
    <div className="animate-fade-in mt-8 flex flex-1 flex-col">
      <p className="eyebrow">Step 2 of 2</p>
      <h1 className="mb-6 font-display text-3xl font-extrabold uppercase">Set your flair</h1>
      <FlairFields value={profile} onChange={onChange} />
      <button
        type="button"
        className="btn-primary mt-auto w-full"
        disabled={profile.displayName.trim() === ""}
        onClick={onEnter}
      >
        Enter {clubName} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function InviteStep({
  club,
  onAuth,
  onInstall,
}: {
  readonly club: Club;
  readonly onAuth: () => void;
  readonly onInstall: () => void;
}) {
  const { state } = useAppState();
  const owner = state.members.find((m) => m.id === club.adminIds[0]);
  const unlocked = [...clubDexCells(state, club.id).values()].filter((c) => c.count > 0).length;
  return (
    <div className="animate-fade-in mt-8 flex flex-1 flex-col">
      <InviteCard club={club} owner={owner} unlocked={unlocked} />
      <AuthButtons onAuth={onAuth} onInstall={onInstall} />
    </div>
  );
}

export function JoinScreen({ code }: { readonly code: string }) {
  const { state, dispatch } = useAppState();
  const { openSheet, showToast } = useUi();
  const router = useRouter();
  const me = useMe();
  const [step, setStep] = useState<"invite" | "flair">("invite");
  const [profile, setProfile] = useState<ProfileUpdate>({
    displayName: me.displayName,
    avatarColor: me.avatarColor,
    signatureFlavorId: me.signatureFlavorId,
  });
  const needle = code.toLowerCase();
  const club = state.clubs.find((c) => c.id === needle || c.inviteCode.toLowerCase() === needle);
  if (club === undefined) return <InvalidInviteView />;
  const enter = () => {
    dispatch({
      type: "update_profile",
      profile: { ...profile, displayName: profile.displayName.trim() },
    });
    if (!club.memberIds.includes(me.id)) dispatch({ type: "join_club", clubId: club.id });
    showToast(`Welcome to ${club.name}`);
    router.push(`/clubs/${club.id}`);
  };
  return (
    <div className="claw-bg flex min-h-full flex-col px-5 pb-8 pt-10">
      <Wordmark />
      {step === "invite" ? (
        <InviteStep
          club={club}
          onAuth={() => setStep("flair")}
          onInstall={() => openSheet({ kind: "install" })}
        />
      ) : (
        <FlairStep clubName={club.name} profile={profile} onChange={setProfile} onEnter={enter} />
      )}
    </div>
  );
}
