import type { Dispute } from "@/types/domain";

export const DISPUTE_WINDOW_HOURS = 48;
export const MIN_DISPUTE_VOTES = 2;
export const DISPUTE_QUORUM_RATIO = 0.3;

export function disputeQuorum(activeMemberCount: number): number {
  return Math.max(MIN_DISPUTE_VOTES, Math.ceil(DISPUTE_QUORUM_RATIO * activeMemberCount));
}

export function openDispute(input: {
  readonly id: string;
  readonly raisedBy: string;
  readonly reason: string;
  readonly nowIso: string;
  readonly activeMemberCount: number;
}): Dispute {
  const expires = new Date(Date.parse(input.nowIso) + DISPUTE_WINDOW_HOURS * 3_600_000);
  return {
    id: input.id,
    raisedBy: input.raisedBy,
    reason: input.reason,
    voterIds: [input.raisedBy],
    votesNeeded: disputeQuorum(input.activeMemberCount),
    expiresAt: expires.toISOString(),
    status: "open",
  };
}

export function voteOnDispute(dispute: Dispute, voterId: string, nowIso: string): Dispute {
  if (
    dispute.status !== "open" ||
    nowIso > dispute.expiresAt ||
    dispute.voterIds.includes(voterId)
  ) {
    return dispute;
  }
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
