"use client";

import { useState, type FormEvent } from "react";
import type { BrandRule, ChallengeScope, ScoringMode } from "@/types/domain";
import { Segmented, Stepper } from "@/components/ui/Controls";
import { Sheet } from "@/components/ui/Sheet";
import { SCORING_HINT, SCORING_LABEL } from "@/domain/scoring";
import { addDays } from "@/domain/time";
import { useAppState } from "@/state/AppStateProvider";
import { useUi } from "@/state/UiProvider";
import { myClubs } from "@/state/selectors";

const SCORING_MODES: readonly ScoringMode[] = [
  "total_cans",
  "flavor_dex",
  "active_days",
  "flavor_hunter",
];
const BRAND_OPTIONS: readonly { readonly value: BrandRule; readonly label: string }[] = [
  { value: "monster_only", label: "Monster Only" },
  { value: "multi_brand", label: "Any Energy Drink" },
];
const SCOPE_OPTIONS: readonly { readonly value: ChallengeScope; readonly label: string }[] = [
  { value: "club", label: "Club Challenge" },
  { value: "community", label: "Community" },
];

function FieldLabel({ children }: { readonly children: string }) {
  return <span className="eyebrow mb-1.5 block">{children}</span>;
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
  const today = state.nowIso.slice(0, 10);
  const [name, setName] = useState("");
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(addDays(state.nowIso, 30).slice(0, 10));
  const [brandRule, setBrandRule] = useState<BrandRule>("monster_only");
  const [scoring, setScoring] = useState<ScoringMode>("total_cans");
  const [cap, setCap] = useState(1);
  const [scope, setScope] = useState<ChallengeScope>("club");
  const [targetClub, setTargetClub] = useState(clubId ?? clubs[0]?.id ?? "");
  const club = clubs.find((c) => c.id === targetClub);
  const error =
    name.trim() === ""
      ? "Give it a name"
      : end < start
        ? "End date must be after start"
        : scope === "club" && club === undefined
          ? "Pick a Club"
          : null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (error !== null) return;
    dispatch({
      type: "create_challenge",
      challenge: {
        name: name.trim(),
        scope,
        clubId: scope === "club" ? targetClub : null,
        brandRule,
        scoring,
        dailyPointCap: cap,
        startsAt: `${start}T00:00:00.000Z`,
        endsAt: `${end}T23:59:59.000Z`,
        playerCount: scope === "club" ? (club?.memberIds.length ?? 1) : 1,
        joined: true,
      },
    });
    showToast(`${name.trim()} is live`);
    onClose();
  };

  return (
    <Sheet
      title="New Challenge"
      subtitle="Set the rules. Check-Ins fan out automatically."
      onClose={onClose}
      tall
    >
      <form onSubmit={submit} className="flex flex-col gap-5">
        <label>
          <FieldLabel>Name</FieldLabel>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="December Dex Sprint"
            maxLength={40}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <FieldLabel>Starts</FieldLabel>
            <input
              type="date"
              className="input"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            <FieldLabel>Ends</FieldLabel>
            <input
              type="date"
              className="input"
              value={end}
              min={start}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>
        <div>
          <FieldLabel>Who competes</FieldLabel>
          <Segmented options={SCOPE_OPTIONS} value={scope} onChange={setScope} />
          {scope === "club" && (
            <select
              className="input mt-2"
              value={targetClub}
              onChange={(e) => setTargetClub(e.target.value)}
              aria-label="Club"
            >
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <FieldLabel>Brand scope</FieldLabel>
          <Segmented options={BRAND_OPTIONS} value={brandRule} onChange={setBrandRule} />
        </div>
        <div>
          <FieldLabel>Scoring mode</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {SCORING_MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setScoring(m)}
                aria-pressed={scoring === m}
                className={`press rounded-xl border p-3 text-left transition-colors ${scoring === m ? "border-volt bg-volt/10" : "border-hairline bg-carbon"}`}
              >
                <p className={`text-sm font-semibold ${scoring === m ? "text-volt" : "text-ink"}`}>
                  {SCORING_LABEL[m]}
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-ink-faint">{SCORING_HINT[m]}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <FieldLabel>Daily Point Cap</FieldLabel>
            <p className="text-xs text-ink-muted">Max cans per day that score volume points.</p>
          </div>
          <Stepper value={cap} onChange={setCap} min={1} max={5} />
        </div>
        {error !== null && name !== "" && <p className="text-xs text-status-dispute">{error}</p>}
        <button
          type="submit"
          disabled={error !== null}
          className="btn-primary w-full disabled:opacity-40"
        >
          Create Challenge
        </button>
      </form>
    </Sheet>
  );
}
