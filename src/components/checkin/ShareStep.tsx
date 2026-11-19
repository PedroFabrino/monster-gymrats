"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { Toggle } from "@/components/ui/Controls";
import type { ShareOption } from "@/domain/fanout";

interface ShareStepProps {
  readonly options: readonly ShareOption[];
  readonly onToggle: (key: string) => void;
}

function OptionRow({
  option,
  onToggle,
}: {
  readonly option: ShareOption;
  readonly onToggle: (key: string) => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl bg-carbon px-3 py-3">
      <div className="min-w-0">
        <p
          className={`truncate text-sm font-semibold ${option.blockedReason === null ? "text-ink" : "text-ink-faint"}`}
        >
          {option.label}
        </p>
        {option.blockedReason !== null && (
          <p className="flex items-center gap-1 text-[11px] text-status-offbrand">
            <Lock className="h-3 w-3" />
            {option.blockedReason}
          </p>
        )}
      </div>
      <Toggle
        checked={option.selected}
        onChange={() => onToggle(option.key)}
        label={`Share to ${option.label}`}
        disabled={option.blockedReason !== null}
      />
    </li>
  );
}

export function ShareStep({ options, onToggle }: ShareStepProps) {
  const clubs = options.filter((o) => o.targetType === "club");
  const challenges = options.filter((o) => o.targetType === "challenge");
  const blocked = challenges.filter((o) => o.blockedReason !== null).length;
  return (
    <div className="flex flex-col gap-4">
      {blocked > 0 && (
        <p className="rounded-xl border border-status-offbrand/40 bg-status-offbrand/10 p-3 text-xs text-ink">
          Off-Brand can: auto-removed from {blocked} Monster-only Challenge
          {blocked === 1 ? "" : "s"}. It still shows on your Club Timelines.
        </p>
      )}
      <section>
        <h3 className="eyebrow mb-2">Clubs</h3>
        <ul className="flex flex-col gap-1.5">
          {clubs.map((o) => (
            <OptionRow key={o.key} option={o} onToggle={onToggle} />
          ))}
        </ul>
      </section>
      {challenges.length > 0 && (
        <section>
          <h3 className="eyebrow mb-2">Challenges</h3>
          <ul className="flex flex-col gap-1.5">
            {challenges.map((o) => (
              <OptionRow key={o.key} option={o} onToggle={onToggle} />
            ))}
          </ul>
        </section>
      )}
      <p className="flex items-center gap-2 rounded-xl bg-volt/[0.08] p-3 text-xs text-volt">
        <ShieldCheck className="h-4 w-4 shrink-0" /> Logs +1 Personal &amp; +1 Global — never
        double-counted.
      </p>
    </div>
  );
}
