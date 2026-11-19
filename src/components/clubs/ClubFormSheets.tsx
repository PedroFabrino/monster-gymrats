"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Club } from "@/types/domain";
import { Sheet } from "@/components/ui/Sheet";
import { ME_ID } from "@/data/mock-data";
import { newClubId } from "@/domain/club";
import { useAppState } from "@/state/AppStateProvider";
import { useUi } from "@/state/UiProvider";
import { findClubByCode } from "@/state/selectors";

export function CreateClubSheet({ onClose }: { readonly onClose: () => void }) {
  const { state, dispatch } = useAppState();
  const { showToast } = useUi();
  const router = useRouter();
  const [name, setName] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) return;
    const id = newClubId(name, state.seq);
    dispatch({ type: "create_club", name });
    showToast(`${name.trim()} created`);
    onClose();
    router.push(`/clubs/${id}`);
  };

  return (
    <Sheet title="Create Club" subtitle="A permanent home for your crew" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="eyebrow">Club name</span>
          <input
            className="input"
            autoFocus
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ultra Zero Ultras"
          />
        </label>
        <p className="text-xs text-ink-muted">
          You will be the Club admin. Share the invite link once it is created.
        </p>
        <button type="submit" className="btn-primary" disabled={name.trim().length < 3}>
          Create Club
        </button>
      </form>
    </Sheet>
  );
}

function validateJoin(club: Club | undefined): string | null {
  if (club === undefined) return "No Club matches that code. Double-check it with your friend.";
  if (club.memberIds.includes(ME_ID)) return `You are already in ${club.name}.`;
  return null;
}

function JoinCodeForm({
  code,
  error,
  onCode,
  onSubmit,
}: {
  readonly code: string;
  readonly error: string | null;
  readonly onCode: (value: string) => void;
  readonly onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input
        className="input metric text-center text-lg uppercase tracking-[0.3em]"
        autoFocus
        value={code}
        onChange={(e) => onCode(e.target.value)}
        placeholder="GAS-777"
        aria-invalid={error !== null}
      />
      {error !== null && <p className="text-sm text-status-dispute">{error}</p>}
      <p className="text-xs text-ink-faint">Try the demo code GAS-777</p>
      <button type="submit" className="btn-primary" disabled={code.trim().length === 0}>
        Join Club
      </button>
    </form>
  );
}

export function JoinClubSheet({ onClose }: { readonly onClose: () => void }) {
  const { state, dispatch } = useAppState();
  const { showToast } = useUi();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const club = findClubByCode(state, code);
    const issue = validateJoin(club);
    if (issue !== null || club === undefined) {
      setError(issue);
      return;
    }
    dispatch({ type: "join_club", clubId: club.id });
    showToast(`Joined ${club.name}`);
    onClose();
    router.push(`/clubs/${club.id}`);
  };

  return (
    <Sheet title="Join by Code" subtitle="Enter the invite code a friend shared" onClose={onClose}>
      <JoinCodeForm
        code={code}
        error={error}
        onCode={(v) => {
          setCode(v);
          setError(null);
        }}
        onSubmit={submit}
      />
    </Sheet>
  );
}
