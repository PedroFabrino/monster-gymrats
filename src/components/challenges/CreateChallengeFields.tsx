"use client";

import type { BrandRule, ChallengeScope, Club, ScoringMode } from "@/types/domain";
import { Segmented, Stepper } from "@/components/ui/Controls";
import { SCORING_HINT, SCORING_LABEL } from "@/domain/scoring";

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

export interface ChallengeFormState {
  readonly name: string;
  readonly start: string;
  readonly end: string;
  readonly brandRule: BrandRule;
  readonly scoring: ScoringMode;
  readonly cap: number;
  readonly scope: ChallengeScope;
  readonly targetClub: string;
}

function FieldLabel({ children }: { readonly children: string }) {
  return <span className="eyebrow mb-1.5 block">{children}</span>;
}

function DateRangeInputs({
  start,
  end,
  onStart,
  onEnd,
}: {
  readonly start: string;
  readonly end: string;
  readonly onStart: (v: string) => void;
  readonly onEnd: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label>
        <FieldLabel>Starts</FieldLabel>
        <input
          type="date"
          className="input"
          value={start}
          onChange={(e) => onStart(e.target.value)}
        />
      </label>
      <label>
        <FieldLabel>Ends</FieldLabel>
        <input
          type="date"
          className="input"
          value={end}
          min={start}
          onChange={(e) => onEnd(e.target.value)}
        />
      </label>
    </div>
  );
}

function ScoringModePicker({
  value,
  onChange,
}: {
  readonly value: ScoringMode;
  readonly onChange: (mode: ScoringMode) => void;
}) {
  return (
    <div>
      <FieldLabel>Scoring mode</FieldLabel>
      <div className="grid grid-cols-2 gap-2">
        {SCORING_MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            aria-pressed={value === m}
            className={`press rounded-xl border p-3 text-left transition-colors ${value === m ? "border-volt bg-volt/10" : "border-hairline bg-carbon"}`}
          >
            <p className={`text-sm font-semibold ${value === m ? "text-volt" : "text-ink"}`}>
              {SCORING_LABEL[m]}
            </p>
            <p className="mt-0.5 text-[11px] leading-4 text-ink-faint">{SCORING_HINT[m]}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ScopePicker({
  scope,
  targetClub,
  clubs,
  onScope,
  onClub,
}: {
  readonly scope: ChallengeScope;
  readonly targetClub: string;
  readonly clubs: readonly Club[];
  readonly onScope: (s: ChallengeScope) => void;
  readonly onClub: (id: string) => void;
}) {
  return (
    <div>
      <FieldLabel>Who competes</FieldLabel>
      <Segmented options={SCOPE_OPTIONS} value={scope} onChange={onScope} />
      {scope === "club" && (
        <select
          className="input mt-2"
          value={targetClub}
          onChange={(e) => onClub(e.target.value)}
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
  );
}

function ChallengeIdentityFields({
  form,
  clubs,
  onUpdate,
}: {
  readonly form: ChallengeFormState;
  readonly clubs: readonly Club[];
  readonly onUpdate: (patch: Partial<ChallengeFormState>) => void;
}) {
  return (
    <>
      <label>
        <FieldLabel>Name</FieldLabel>
        <input
          className="input"
          value={form.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="December Dex Sprint"
          maxLength={40}
        />
      </label>
      <DateRangeInputs
        start={form.start}
        end={form.end}
        onStart={(start) => onUpdate({ start })}
        onEnd={(end) => onUpdate({ end })}
      />
      <ScopePicker
        scope={form.scope}
        targetClub={form.targetClub}
        clubs={clubs}
        onScope={(scope) => onUpdate({ scope })}
        onClub={(targetClub) => onUpdate({ targetClub })}
      />
    </>
  );
}

export function ChallengeFormFields({
  form,
  clubs,
  onUpdate,
}: {
  readonly form: ChallengeFormState;
  readonly clubs: readonly Club[];
  readonly onUpdate: (patch: Partial<ChallengeFormState>) => void;
}) {
  return (
    <>
      <ChallengeIdentityFields form={form} clubs={clubs} onUpdate={onUpdate} />
      <div>
        <FieldLabel>Brand scope</FieldLabel>
        <Segmented
          options={BRAND_OPTIONS}
          value={form.brandRule}
          onChange={(brandRule) => onUpdate({ brandRule })}
        />
      </div>
      <ScoringModePicker value={form.scoring} onChange={(scoring) => onUpdate({ scoring })} />
      <div className="flex items-center justify-between gap-4">
        <div>
          <FieldLabel>Daily Point Cap</FieldLabel>
          <p className="text-xs text-ink-muted">Max cans per day that score volume points.</p>
        </div>
        <Stepper value={form.cap} onChange={(cap) => onUpdate({ cap })} min={1} max={5} />
      </div>
    </>
  );
}
