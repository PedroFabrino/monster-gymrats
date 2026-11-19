import type {
  AppNotification,
  Challenge,
  CheckIn,
  Club,
  FlavorRequest,
  FlavorSeries,
  GroupShare,
  Member,
  NotificationKind,
  NotificationPrefs,
  ReactionKind,
  TimelineItem,
} from "@/types/domain";
import { CHALLENGES, CLUBS, DEMO_NOW, HOME_CLUB_ID, MEMBERS } from "@/data/mock-data";
import { generateSeedWorld } from "@/data/seed";
import {
  DEFAULT_NOTIFICATION_PREFS,
  SEED_FLAVOR_REQUESTS,
  SEED_NOTIFICATIONS,
  SEED_TIMELINE_EVENTS,
} from "@/data/social-seed";

export interface ClubEvent {
  readonly clubId: string;
  readonly item: TimelineItem;
}

export interface AppState {
  readonly nowIso: string;
  readonly seq: number;
  readonly members: readonly Member[];
  readonly clubs: readonly Club[];
  readonly challenges: readonly Challenge[];
  readonly checkIns: readonly CheckIn[];
  readonly baselineIds: ReadonlySet<string>;
  readonly shares: readonly GroupShare[];
  readonly events: readonly ClubEvent[];
  readonly flavorRequests: readonly FlavorRequest[];
  readonly notifications: readonly AppNotification[];
  readonly notificationPrefs: NotificationPrefs;
}

export interface ProfileUpdate {
  readonly displayName: string;
  readonly avatarColor: string;
  readonly signatureFlavorId: string;
}

export interface PostCheckInPayload {
  readonly checkIn: CheckIn;
  readonly shares: readonly GroupShare[];
  readonly flavorRequest: { readonly name: string; readonly series: FlavorSeries } | null;
}

export type AppAction =
  | { readonly type: "post_check_in"; readonly payload: PostCheckInPayload }
  | { readonly type: "toggle_reaction"; readonly checkInId: string; readonly kind: ReactionKind }
  | { readonly type: "add_comment"; readonly checkInId: string; readonly body: string }
  | { readonly type: "send_chat"; readonly clubId: string; readonly body: string }
  | { readonly type: "call_bs"; readonly checkInId: string; readonly reason: string }
  | { readonly type: "vote_dispute"; readonly checkInId: string }
  | {
      readonly type: "resolve_dispute";
      readonly checkInId: string;
      readonly outcome: "cleared" | "voided";
    }
  | { readonly type: "update_profile"; readonly profile: ProfileUpdate }
  | { readonly type: "create_challenge"; readonly challenge: Omit<Challenge, "id"> }
  | { readonly type: "toggle_join_challenge"; readonly challengeId: string }
  | { readonly type: "create_club"; readonly name: string }
  | { readonly type: "join_club"; readonly clubId: string }
  | { readonly type: "toggle_notification_pref"; readonly kind: NotificationKind }
  | { readonly type: "mark_notifications_read" }
  | { readonly type: "upvote_request"; readonly requestId: string };

export function createInitialState(): AppState {
  const world = generateSeedWorld();
  return {
    nowIso: DEMO_NOW,
    seq: 1,
    members: MEMBERS,
    clubs: CLUBS,
    challenges: CHALLENGES,
    checkIns: world.checkIns,
    baselineIds: new Set(world.checkIns.map((c) => c.id)),
    shares: world.shares,
    events: SEED_TIMELINE_EVENTS.map((item) => ({ clubId: HOME_CLUB_ID, item })),
    flavorRequests: SEED_FLAVOR_REQUESTS,
    notifications: SEED_NOTIFICATIONS,
    notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
  };
}
