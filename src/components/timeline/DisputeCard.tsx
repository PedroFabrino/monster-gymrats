"use client";

import { Gavel, MessageCircle, ShieldCheck, Trash2 } from "lucide-react";
import type { CheckIn, Club, Dispute } from "@/types/domain";
import { ProgressBar } from "@/components/ui/Progress";
import { ME_ID } from "@/data/mock-data";
import { hoursBetween } from "@/domain/time";
import { useAppState } from "@/state/AppStateProvider";
import { useUi } from "@/state/UiProvider";
import { memberById } from "@/state/selectors";

function SettledBanner({ status }: { readonly status: Exclude<Dispute["status"], "open"> }) {
  const voided = status === "voided";
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

function AdminResolutionButtons({
  onClear,
  onVoid,
}: {
  readonly onClear: () => void;
  readonly onVoid: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClear}
        className="press rounded-lg border border-status-verified/50 px-3 py-1.5 text-xs font-semibold text-status-verified"
      >
        Admin: Clear
      </button>
      <button
        type="button"
        onClick={onVoid}
        className="press rounded-lg border border-status-dispute/50 px-3 py-1.5 text-xs font-semibold text-status-dispute"
      >
        Admin: Void
      </button>
    </>
  );
}

function VoteOrReplyButton({
  checkInId,
  voted,
  isOwn,
}: {
  readonly checkInId: string;
  readonly voted: boolean;
  readonly isOwn: boolean;
}) {
  const { dispatch } = useAppState();
  const { openSheet, showToast } = useUi();
  if (isOwn) {
    return (
      <button
        type="button"
        onClick={() => openSheet({ kind: "comments", checkInId })}
        className="press flex items-center gap-1 rounded-lg border border-hairline px-3 py-1.5 text-xs font-semibold text-ink hover:border-volt/50"
      >
        <MessageCircle className="h-3.5 w-3.5 text-volt" /> Reply with proof
      </button>
    );
  }
  return (
    <button
      type="button"
      disabled={voted}
      onClick={() => {
        dispatch({ type: "vote_dispute", checkInId });
        showToast("Vote cast");
      }}
      className="press rounded-lg bg-status-dispute px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
    >
      {voted ? "You voted BS" : "Vote BS"}
    </button>
  );
}

function DisputeHeader({
  dispute,
  raiserName,
  hoursLeft,
}: {
  readonly dispute: Dispute;
  readonly raiserName: string;
  readonly hoursLeft: number;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-wide text-status-dispute">
          <Gavel className="h-4 w-4" /> BS Called
        </span>
        <span className="metric text-[11px] text-ink-muted">
          {dispute.voterIds.length} / {dispute.votesNeeded} votes • {hoursLeft}h left
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-muted">
        <span className="font-semibold text-ink">{raiserName}:</span> {dispute.reason}
      </p>
      <ProgressBar
        pct={(dispute.voterIds.length / dispute.votesNeeded) * 100}
        color="#EF4444"
        className="mt-2 h-1.5"
      />
    </>
  );
}

export function DisputeCard({
  checkIn,
  club,
}: {
  readonly checkIn: CheckIn;
  readonly club: Club | null;
}) {
  const { state, dispatch } = useAppState();
  const dispute = checkIn.dispute;
  if (dispute === null) return null;
  if (dispute.status !== "open") return <SettledBanner status={dispute.status} />;

  const raiserName = memberById(state, dispute.raisedBy)?.displayName ?? "A member";
  const hoursLeft = Math.max(0, Math.round(hoursBetween(state.nowIso, dispute.expiresAt)));
  const isAdmin = club?.adminIds.includes(ME_ID) ?? false;
  return (
    <div className="rounded-xl border border-status-dispute/40 bg-status-dispute/[0.07] p-3">
      <DisputeHeader dispute={dispute} raiserName={raiserName} hoursLeft={hoursLeft} />
      <div className="mt-3 flex flex-wrap gap-2">
        <VoteOrReplyButton
          checkInId={checkIn.id}
          voted={dispute.voterIds.includes(ME_ID)}
          isOwn={checkIn.memberId === ME_ID}
        />
        {isAdmin && (
          <AdminResolutionButtons
            onClear={() =>
              dispatch({ type: "resolve_dispute", checkInId: checkIn.id, outcome: "cleared" })
            }
            onVoid={() =>
              dispatch({ type: "resolve_dispute", checkInId: checkIn.id, outcome: "voided" })
            }
          />
        )}
      </div>
    </div>
  );
}
