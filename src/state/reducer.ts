import type { NotificationKind } from "@/types/domain";
import { ME_ID } from "@/data/mock-data";
import { newClubId, newInviteCode } from "@/domain/club";
import type { AppAction, AppState, ProfileUpdate } from "./app-state";
import {
  addComment,
  callBs,
  postCheckIn,
  sendChat,
  settleDispute,
  toggleReaction,
  voteDispute,
} from "./check-in-handlers";

function updateProfile(state: AppState, profile: ProfileUpdate): AppState {
  const displayName = profile.displayName.trim();
  if (displayName.length === 0) return state;
  return {
    ...state,
    members: state.members.map((m) =>
      m.id === ME_ID
        ? { ...m, ...profile, displayName, handle: displayName.toLowerCase().replace(/\s+/g, "") }
        : m,
    ),
  };
}

function createClub(state: AppState, name: string): AppState {
  const trimmed = name.trim();
  if (trimmed.length === 0) return state;
  const club = {
    id: newClubId(trimmed, state.seq),
    name: trimmed,
    inviteCode: newInviteCode(trimmed, state.seq),
    memberIds: [ME_ID],
    adminIds: [ME_ID],
    tagline: "Fresh Club. First can sets the tone.",
  };
  return { ...state, seq: state.seq + 1, clubs: [...state.clubs, club] };
}

function joinClub(state: AppState, clubId: string): AppState {
  return {
    ...state,
    clubs: state.clubs.map((c) =>
      c.id === clubId && !c.memberIds.includes(ME_ID)
        ? { ...c, memberIds: [...c.memberIds, ME_ID] }
        : c,
    ),
  };
}

function togglePref(state: AppState, kind: NotificationKind): AppState {
  return {
    ...state,
    notificationPrefs: { ...state.notificationPrefs, [kind]: !state.notificationPrefs[kind] },
  };
}

function upvoteRequest(state: AppState, requestId: string): AppState {
  return {
    ...state,
    flavorRequests: state.flavorRequests.map((r) => {
      if (r.id !== requestId) return r;
      const has = r.upvoterIds.includes(ME_ID);
      return {
        ...r,
        upvoterIds: has ? r.upvoterIds.filter((id) => id !== ME_ID) : [...r.upvoterIds, ME_ID],
      };
    }),
  };
}

function socialReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "update_profile":
      return updateProfile(state, action.profile);
    case "create_challenge":
      return {
        ...state,
        seq: state.seq + 1,
        challenges: [{ ...action.challenge, id: `c-new-${state.seq}` }, ...state.challenges],
      };
    case "toggle_join_challenge":
      return {
        ...state,
        challenges: state.challenges.map((c) =>
          c.id === action.challengeId ? { ...c, joined: !c.joined } : c,
        ),
      };
    case "create_club":
      return createClub(state, action.name);
    case "join_club":
      return joinClub(state, action.clubId);
    case "toggle_notification_pref":
      return togglePref(state, action.kind);
    case "mark_notifications_read":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    case "upvote_request":
      return upvoteRequest(state, action.requestId);
    default:
      return state;
  }
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "post_check_in":
      return postCheckIn(state, action.payload);
    case "toggle_reaction":
      return toggleReaction(state, action.checkInId, action.kind);
    case "add_comment":
      return action.body.trim() === ""
        ? state
        : addComment(state, action.checkInId, action.body.trim());
    case "send_chat":
      return action.body.trim() === "" ? state : sendChat(state, action.clubId, action.body.trim());
    case "call_bs":
      return callBs(state, action.checkInId, action.reason);
    case "vote_dispute":
      return voteDispute(state, action.checkInId);
    case "resolve_dispute":
      return settleDispute(state, action.checkInId, action.outcome);
    default:
      return socialReducer(state, action);
  }
}
