"use client";

import { useState, type FormEvent } from "react";
import type { Challenge, Club } from "@/types/domain";
import { Sheet } from "@/components/ui/Sheet";
import { addDays } from "@/domain/time";
import { useAppState } from "@/state/AppStateProvider";
import { useUi } from "@/state/UiProvider";
import { myClubs } from "@/state/selectors";
import { ChallengeFormFields, type ChallengeFormState } from "./CreateChallengeFields";

function validateForm(form: ChallengeFormState, club: Club | undefined): string | null {
  if (form.name.trim() === "") return "Give it a name";
  if (form.end < form.start) return "End date must be after start";
  if (form.scope === "club" && club === undefined) return "Pick a Club";
  return null;
}

function buildChallenge(form: ChallengeFormState, club: Club | undefined): Omit<Challenge, "id"> {
  return {
    name: form.name.trim(),
    scope: form.scope,
    clubId: form.scope === "club" ? form.targetClub : null,
    brandRule: form.brandRule,
    scoring: form.scoring,
    dailyPointCap: form.cap,
    startsAt: `${form.start}T00:00:00.000Z`,
    endsAt: `${form.end}T23:59:59.000Z`,
    playerCount: form.scope === "club" ? (club?.memberIds.length ?? 1) : 1,
    joined: true,
  };
}

function defaultForm(
  nowIso: string,
  clubId: string | null,
  clubs: readonly Club[],
): ChallengeFormState {
  return {
    name: "",
    start: nowIso.slice(0, 10),
    end: addDays(nowIso, 30).slice(0, 10),
    brandRule: "monster_only",
    scoring: "total_cans",
    cap: 1,
    scope: "club",
    targetClub: clubId ?? clubs[0]?.id ?? "",
  };
}

function CreateChallengeForm({
  form,
  clubs,
  error,
  onUpdate,
  onSubmit,
}: {
  readonly form: ChallengeFormState;
  readonly clubs: readonly Club[];
  readonly error: string | null;
  readonly onUpdate: (patch: Partial<ChallengeFormState>) => void;
  readonly onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <ChallengeFormFields form={form} clubs={clubs} onUpdate={onUpdate} />
      {error !== null && form.name !== "" && <p className="text-xs text-status-dispute">{error}</p>}
      <button
        type="submit"
        disabled={error !== null}
        className="btn-primary w-full disabled:opacity-40"
      >
        Create Challenge
      </button>
    </form>
  );
}

export function CreateChallengeSheet({
  clubId,
  onClose,
}: {
  readonly clubId: string | null;
  readonly onClose: () => void;
}) {
  const { state, dispatch } = useAppState();
  const { showToast } = useUi();
  const clubs = myClubs(state);
  const [form, setForm] = useState<ChallengeFormState>(() =>
    defaultForm(state.nowIso, clubId, clubs),
  );
  const club = clubs.find((c) => c.id === form.targetClub);
  const error = validateForm(form, club);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (error !== null) return;
    dispatch({ type: "create_challenge", challenge: buildChallenge(form, club) });
    showToast(`${form.name.trim()} is live`);
    onClose();
  };
  return (
    <Sheet
      title="New Challenge"
      subtitle="Set the rules. Check-Ins fan out automatically."
      onClose={onClose}
      tall
    >
      <CreateChallengeForm
        form={form}
        clubs={clubs}
        error={error}
        onUpdate={(patch) => setForm((f) => ({ ...f, ...patch }))}
        onSubmit={submit}
      />
    </Sheet>
  );
}
