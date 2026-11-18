import type { CheckIn, ReactionKind, TimelineItem } from "@/types/domain";
import { FLAVORS } from "@/data/flavors";
import { ME_ID } from "@/data/mock-data";
import { openDispute, resolveDispute, voteOnDispute } from "@/domain/disputes";
import { addHours } from "@/domain/time";
import type { AppState, ClubEvent, PostCheckInPayload } from "./app-state";

const TICK_HOURS = 1 / 60;

function nextIds(state: AppState): { readonly nowIso: string; readonly seq: number } {
  return { nowIso: addHours(state.nowIso, TICK_HOURS), seq: state.seq + 1 };
}

function mapCheckIn(state: AppState, id: string, fn: (c: CheckIn) => CheckIn): AppState {
  return { ...state, checkIns: state.checkIns.map((c) => (c.id === id ? fn(c) : c)) };
}

function clubHasFlavor(state: AppState, clubId: string, flavorId: string): boolean {
  const ids = new Set(
    state.shares
      .filter((s) => s.targetType === "club" && s.targetId === clubId)
      .map((s) => s.checkInId),
  );
  return state.checkIns.some(
    (c) => ids.has(c.id) && c.flavorId === flavorId && c.status !== "voided",
  );
}

function unlockEvents(state: AppState, payload: PostCheckInPayload, nowIso: string): ClubEvent[] {
  const { checkIn } = payload;
  const flavor = FLAVORS.find((f) => f.id === checkIn.flavorId);
  if (flavor === undefined || flavor.brand !== "monster") return [];
  const name = state.members.find((m) => m.id === checkIn.memberId)?.displayName ?? "Someone";
  return payload.shares
    .filter((s) => s.targetType === "club" && !clubHasFlavor(state, s.targetId, flavor.id))
    .map((s) => ({
      clubId: s.targetId,
      item: {
        kind: "system",
        id: `ev-${checkIn.id}-${s.targetId}`,
        body: `${name} unlocked ${flavor.name} for the Club!`,
        postedAt: nowIso,
      },
    }));
}

export function postCheckIn(state: AppState, payload: PostCheckInPayload): AppState {
  const { nowIso, seq } = nextIds(state);
  const request = payload.flavorRequest;
  const requests =
    request === null
      ? state.flavorRequests
      : [
          {
            id: `fr-${seq}`,
            name: request.name,
            brand: payload.checkIn.brand,
            series: request.series,
            submittedBy: payload.checkIn.memberId,
            checkInId: payload.checkIn.id,
            submittedAt: nowIso,
            upvoterIds: [],
            status: "pending" as const,
          },
          ...state.flavorRequests,
        ];
  return {
    ...state,
    nowIso,
    seq,
    events: [...state.events, ...unlockEvents(state, payload, nowIso)],
    checkIns: [...state.checkIns, { ...payload.checkIn, postedAt: nowIso }],
    shares: [...state.shares, ...payload.shares],
    flavorRequests: requests,
  };
}

export function toggleReaction(state: AppState, checkInId: string, kind: ReactionKind): AppState {
  return mapCheckIn(state, checkInId, (c) => {
    const current = c.reactions[kind];
    const next = current.includes(ME_ID)
      ? current.filter((id) => id !== ME_ID)
      : [...current, ME_ID];
    return { ...c, reactions: { ...c.reactions, [kind]: next } };
  });
}

export function addComment(state: AppState, checkInId: string, body: string): AppState {
  const { nowIso, seq } = nextIds(state);
  const comment = { id: `cm-new-${seq}`, memberId: ME_ID, body, postedAt: nowIso };
  return {
    ...mapCheckIn(state, checkInId, (c) => ({ ...c, comments: [...c.comments, comment] })),
    nowIso,
    seq,
  };
}

export function sendChat(state: AppState, clubId: string, body: string): AppState {
  const { nowIso, seq } = nextIds(state);
  const item: TimelineItem = {
    kind: "chat",
    id: `chat-${seq}`,
    memberId: ME_ID,
    body,
    postedAt: nowIso,
  };
  return { ...state, nowIso, seq, events: [...state.events, { clubId, item }] };
}

export function callBs(state: AppState, checkInId: string, reason: string): AppState {
  const { nowIso, seq } = nextIds(state);
  const next = mapCheckIn(state, checkInId, (c) =>
    c.dispute?.status === "open"
      ? c
      : { ...c, dispute: openDispute({ id: `d-${seq}`, raisedBy: ME_ID, reason, nowIso }) },
  );
  return { ...next, nowIso, seq };
}

export function voteDispute(state: AppState, checkInId: string): AppState {
  return mapCheckIn(state, checkInId, (c) => {
    if (c.dispute === null) return c;
    const dispute = voteOnDispute(c.dispute, ME_ID);
    return { ...c, dispute, status: dispute.status === "voided" ? "voided" : c.status };
  });
}

export function settleDispute(
  state: AppState,
  checkInId: string,
  outcome: "cleared" | "voided",
): AppState {
  return mapCheckIn(state, checkInId, (c) => {
    if (c.dispute === null) return c;
    const dispute = resolveDispute(c.dispute, outcome);
    return { ...c, dispute, status: dispute.status === "voided" ? "voided" : c.status };
  });
}
