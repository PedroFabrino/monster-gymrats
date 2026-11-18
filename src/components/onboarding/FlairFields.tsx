"use client";

import { Check } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { MONSTER_FLAVORS } from "@/data/flavors";
import type { ProfileUpdate } from "@/state/app-state";

const AVATAR_COLORS = [
  "#95D600",
  "#00D4FF",
  "#FF9F1C",
  "#FF4D8D",
  "#FFB703",
  "#22C55E",
  "#38BDF8",
  "#E2E8F0",
];

interface FlairFieldsProps {
  readonly value: ProfileUpdate;
  readonly onChange: (value: ProfileUpdate) => void;
}

export function FlairFields({ value, onChange }: FlairFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar
          member={{
            displayName: value.displayName === "" ? "?" : value.displayName,
            avatarColor: value.avatarColor,
          }}
          size="lg"
        />
        <label className="flex-1">
          <span className="eyebrow mb-1.5 block">Display name</span>
          <input
            className="input"
            value={value.displayName}
            maxLength={20}
            onChange={(e) => onChange({ ...value, displayName: e.target.value })}
            placeholder="Your name"
          />
        </label>
      </div>
      <div>
        <span className="eyebrow mb-2 block">Avatar color</span>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Avatar color ${c}`}
              aria-pressed={value.avatarColor === c}
              onClick={() => onChange({ ...value, avatarColor: c })}
              className="press flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: c }}
            >
              {value.avatarColor === c && <Check className="h-4 w-4 text-void" />}
            </button>
          ))}
        </div>
      </div>
      <label>
        <span className="eyebrow mb-1.5 block">Signature flavor (flair)</span>
        <select
          className="input"
          value={value.signatureFlavorId}
          onChange={(e) => onChange({ ...value, signatureFlavorId: e.target.value })}
        >
          {MONSTER_FLAVORS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
