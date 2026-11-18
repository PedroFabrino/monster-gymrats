import type { Dispute } from "@/types/domain";

export const DISPUTE_WINDOW_HOURS = 48;
export const DISPUTE_VOTES_NEEDED = 3;

export function openDispute(input: {
  readonly id: string;
  readonly raisedBy: string;
  readonly reason: string;
  readonly nowIso: string;
}): Dispute {
  const expires = new Date(Date.parse(input.nowIso) + DISPUTE_WINDOW_HOURS * 3_600_000);
  return {
    id: input.id,
    raisedBy: input.raisedBy,
    reason: input.reason,
    voterIds: [input.raisedBy],
    votesNeeded: DISPUTE_VOTES_NEEDED,
    expiresAt: expires.toISOString(),
    status: "open",
  };
}

export function voteOnDispute(dispute: Dispute, voterId: string): Dispute {
  if (dispute.status !== "open" || dispute.voterIds.includes(voterId)) return dispute;
  const voterIds = [...dispute.voterIds, voterId];
  return {
    ...dispute,
    voterIds,
    status: voterIds.length >= dispute.votesNeeded ? "voided" : "open",
  };
}

export function resolveDispute(dispute: Dispute, outcome: "cleared" | "voided"): Dispute {
  return dispute.status === "open" ? { ...dispute, status: outcome } : dispute;
}
