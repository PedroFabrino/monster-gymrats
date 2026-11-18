"use client";

import { StarRating } from "@/components/ui/Controls";
import { CAN_SIZES, RETRO_CHOICES, type CheckInDraft } from "./draft";

interface DetailsProps {
  readonly draft: CheckInDraft;
  readonly onChange: (draft: CheckInDraft) => void;
}

function chip(active: boolean): string {
  return `press rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${active ? "border-volt bg-volt text-void" : "border-hairline bg-carbon text-ink-muted"}`;
}

export function DetailsFields({ draft, onChange }: DetailsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="eyebrow mb-2">Can size</p>
        <div className="flex gap-2">
          {CAN_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              className={`${chip(draft.volumeMl === s)} metric flex-1`}
              onClick={() => onChange({ ...draft, volumeMl: s })}
            >
              {s}ml
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="eyebrow">Rating</p>
        <StarRating value={draft.rating} onChange={(rating) => onChange({ ...draft, rating })} />
      </div>
      <div className="grid grid-cols-[110px_1fr] gap-2">
        <label>
          <span className="eyebrow mb-1.5 block">Price</span>
          <input
            className="input metric"
            inputMode="decimal"
            placeholder="$2.99"
            value={draft.priceText}
            onChange={(e) => onChange({ ...draft, priceText: e.target.value })}
          />
        </label>
        <label>
          <span className="eyebrow mb-1.5 block">Caption</span>
          <input
            className="input"
            placeholder="3am debugging fuel"
            maxLength={140}
            value={draft.caption}
            onChange={(e) => onChange({ ...draft, caption: e.target.value })}
          />
        </label>
      </div>
      <div>
        <p className="eyebrow mb-2">When did you drink it?</p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {RETRO_CHOICES.map((h) => (
            <button
              key={h}
              type="button"
              className={`${chip(draft.retroHours === h)} shrink-0`}
              onClick={() => onChange({ ...draft, retroHours: h })}
            >
              {h === 0 ? "Just now" : `${h}h ago`}
            </button>
          ))}
        </div>
        {draft.retroHours > 0 && (
          <p className="mt-2 text-[11px] text-status-retro">
            Posts as a Retroactive Check-In (allowed up to 24h back).
          </p>
        )}
      </div>
    </div>
  );
}
