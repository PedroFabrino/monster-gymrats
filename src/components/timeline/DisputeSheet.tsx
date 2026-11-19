"use client";

import { Gavel } from "lucide-react";
import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { DISPUTE_WINDOW_HOURS, disputeQuorum } from "@/domain/disputes";
import { useAppState } from "@/state/AppStateProvider";
import { useUi } from "@/state/UiProvider";
import { checkInClubMemberCount, memberById } from "@/state/selectors";

const REASONS = [
  "Not a real can photo",
  "Stock / store shelf image",
  "Reused an old photo",
  "Can is clearly empty",
  "Wrong flavor tagged",
];

function ReasonPicker({
  reason,
  onSelect,
}: {
  readonly reason: string;
  readonly onSelect: (reason: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="eyebrow mb-2">Reason</legend>
      {REASONS.map((r) => (
        <label
          key={r}
          className={`press flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-colors ${reason === r ? "border-status-dispute bg-status-dispute/10 text-ink" : "border-hairline bg-carbon text-ink-muted"}`}
        >
          <input
            type="radio"
            name="reason"
            value={r}
            checked={reason === r}
            onChange={() => onSelect(r)}
            className="accent-status-dispute"
          />
          {r}
        </label>
      ))}
    </fieldset>
  );
}

function OpenDisputeButton({ onSubmit }: { readonly onSubmit: () => void }) {
  return (
    <button
      type="button"
      onClick={onSubmit}
      className="press flex w-full items-center justify-center gap-2 rounded-xl bg-status-dispute py-3 font-display text-lg font-bold uppercase tracking-wide text-white"
    >
      <Gavel className="h-5 w-5" /> Open Dispute
    </button>
  );
}

export function DisputeSheet({
  checkInId,
  onClose,
}: {
  readonly checkInId: string;
  readonly onClose: () => void;
}) {
  const { state, dispatch } = useAppState();
  const { showToast } = useUi();
  const [reason, setReason] = useState<string>(REASONS[0] ?? "");
  const checkIn = state.checkIns.find((c) => c.id === checkInId);
  if (checkIn === undefined) return null;
  const author = memberById(state, checkIn.memberId);
  const votesNeeded = disputeQuorum(checkInClubMemberCount(state, checkInId));
  const submit = () => {
    dispatch({ type: "call_bs", checkInId, reason });
    showToast("BS called. The Club has 48h to vote.");
    onClose();
  };
  return (
    <Sheet
      title="Call BS"
      subtitle={`Dispute ${author?.displayName ?? "this"}'s Check-In`}
      onClose={onClose}
      footer={<OpenDisputeButton onSubmit={submit} />}
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">
          Your call counts as the first vote. If {votesNeeded} members agree within{" "}
          {DISPUTE_WINDOW_HOURS}h, the Check-In is voided everywhere it was shared. Admins can clear
          or void at any time.
        </p>
        <ReasonPicker reason={reason} onSelect={setReason} />
      </div>
    </Sheet>
  );
}
