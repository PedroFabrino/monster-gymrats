"use client";

import { Heart, MessageCircle, Siren, Zap } from "lucide-react";
import type { ReactNode } from "react";
import type { CheckIn, ReactionKind } from "@/types/domain";
import { ME_ID } from "@/data/mock-data";
import { useAppState } from "@/state/AppStateProvider";
import { useUi } from "@/state/UiProvider";

interface ReactionDef {
  readonly kind: ReactionKind;
  readonly label: string;
  readonly color: string;
  readonly icon: (on: boolean) => ReactNode;
}

const REACTIONS: readonly ReactionDef[] = [
  {
    kind: "bolt",
    label: "Energy",
    color: "#95D600",
    icon: (on) => <Zap className={`h-4 w-4 ${on ? "fill-current" : ""}`} />,
  },
  {
    kind: "heart",
    label: "Love",
    color: "#E2E8F0",
    icon: (on) => <Heart className={`h-4 w-4 ${on ? "fill-current" : ""}`} />,
  },
  {
    kind: "siren",
    label: "Sus",
    color: "#EF4444",
    icon: (on) => <Siren className={`h-4 w-4 ${on ? "fill-current" : ""}`} />,
  },
];

function ReactionChip({
  def,
  count,
  on,
  onToggle,
}: {
  readonly def: ReactionDef;
  readonly count: number;
  readonly on: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${def.label} reaction, ${count}`}
      onClick={onToggle}
      className="press flex items-center gap-1 rounded-full border px-2.5 py-1.5 transition-colors"
      style={{
        color: on ? def.color : "#A3ABBB",
        borderColor: on ? `${def.color}66` : "#262B36",
        background: on ? `${def.color}14` : "transparent",
      }}
    >
      {def.icon(on)}
      <span className="metric text-xs">{count}</span>
    </button>
  );
}

export function ReactionBar({ checkIn }: { readonly checkIn: CheckIn }) {
  const { dispatch } = useAppState();
  const { openSheet } = useUi();
  const canDispute =
    checkIn.memberId !== ME_ID && checkIn.status !== "voided" && checkIn.dispute?.status !== "open";
  return (
    <div className="flex items-center gap-1.5">
      {REACTIONS.map((def) => (
        <ReactionChip
          key={def.kind}
          def={def}
          on={checkIn.reactions[def.kind].includes(ME_ID)}
          count={checkIn.reactions[def.kind].length}
          onToggle={() =>
            dispatch({ type: "toggle_reaction", checkInId: checkIn.id, kind: def.kind })
          }
        />
      ))}
      <button
        type="button"
        onClick={() => openSheet({ kind: "comments", checkInId: checkIn.id })}
        className="press flex items-center gap-1 rounded-full border border-hairline px-2.5 py-1.5 text-ink-muted hover:text-ink"
        aria-label={`Comments, ${checkIn.comments.length}`}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="metric text-xs">{checkIn.comments.length}</span>
      </button>
      {canDispute && (
        <button
          type="button"
          onClick={() => openSheet({ kind: "dispute", checkInId: checkIn.id })}
          className="press ml-auto rounded-full px-2.5 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-status-dispute hover:bg-status-dispute/10"
        >
          Call BS
        </button>
      )}
    </div>
  );
}
