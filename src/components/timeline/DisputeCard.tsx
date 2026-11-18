"use client";

import { Gavel, ShieldCheck, Trash2 } from "lucide-react";
import type { CheckIn, Club } from "@/types/domain";
import { ProgressBar } from "@/components/ui/Progress";
import { ME_ID } from "@/data/mock-data";
import { hoursBetween } from "@/domain/time";
import { useAppState } from "@/state/AppStateProvider";
import { useUi } from "@/state/UiProvider";
import { memberById } from "@/state/selectors";

export function DisputeCard({
  checkIn,
  club,
}: {
  readonly checkIn: CheckIn;
  readonly club: Club | null;
}) {
  const { state, dispatch } = useAppState();
  const { showToast } = useUi();
  const dispute = checkIn.dispute;
  if (dispute === null) return null;
  const raiser = memberById(state, dispute.raisedBy);
  const isAdmin = club?.adminIds.includes(ME_ID) ?? false;
  const voted = dispute.voterIds.includes(ME_ID);
  const hoursLeft = Math.max(0, Math.round(hoursBetween(state.nowIso, dispute.expiresAt)));
  const isOwn = checkIn.memberId === ME_ID;

  if (dispute.status !== "open") {
    const voided = dispute.status === "voided";
    return (
      <div
        className={`flex items-center gap-2 rounded-xl border p-3 text-xs ${voided ? "border-status-dispute/40 bg-status-dispute/10 text-status-dispute" : "border-status-verified/40 bg-status-verified/10 text-status-verified"}`}
      >
        {voided ? <Trash2 className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
        {voided
          ? "Dispute upheld. Check-In voided from Club, Challenge, and Global standings."
          : "Dispute cleared by an admin. Check-In stands."}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-status-dispute/40 bg-status-dispute/[0.07] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-wide text-status-dispute">
          <Gavel className="h-4 w-4" /> BS Called
        </span>
        <span className="metric text-[11px] text-ink-muted">
          {dispute.voterIds.length} / {dispute.votesNeeded} votes • {hoursLeft}h left
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-muted">
        <span className="font-semibold text-ink">{raiser?.displayName ?? "A member"}:</span>{" "}
        {dispute.reason}
      </p>
      <ProgressBar
        pct={(dispute.voterIds.length / dispute.votesNeeded) * 100}
        color="#EF4444"
        className="mt-2 h-1.5"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {!isOwn && (
          <button
            type="button"
            disabled={voted}
            onClick={() => {
              dispatch({ type: "vote_dispute", checkInId: checkIn.id });
              showToast("Vote cast");
            }}
            className="press rounded-lg bg-status-dispute px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
          >
            {voted ? "You voted BS" : "Vote BS"}
          </button>
        )}
        {isAdmin && (
          <>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "resolve_dispute", checkInId: checkIn.id, outcome: "cleared" })
              }
              className="press rounded-lg border border-status-verified/50 px-3 py-1.5 text-xs font-semibold text-status-verified"
            >
              Admin: Clear
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "resolve_dispute", checkInId: checkIn.id, outcome: "voided" })
              }
              className="press rounded-lg border border-status-dispute/50 px-3 py-1.5 text-xs font-semibold text-status-dispute"
            >
              Admin: Void
            </button>
          </>
        )}
      </div>
    </div>
  );
}
