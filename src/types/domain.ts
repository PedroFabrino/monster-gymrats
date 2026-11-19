export type BrandId = "monster" | "redbull" | "reign";

export type FlavorSeries =
  "Ultra" | "Original" | "Juice" | "Rehab" | "Java" | "Reserve" | "Nitro" | "Off-Brand";

export type CanSizeMl = 355 | 473 | 500 | 710;

export interface Flavor {
  readonly id: string;
  readonly brand: BrandId;
  readonly name: string;
  readonly series: FlavorSeries;
  readonly volumeMl: CanSizeMl;
  readonly caffeineMg: number;
  readonly sugarG: number;
  readonly color: string;
  readonly accent: string;
  readonly barcode: string;
  readonly globalCount: number;
}

export interface Member {
  readonly id: string;
  readonly displayName: string;
  readonly handle: string;
  readonly avatarColor: string;
  readonly signatureFlavorId: string;
}

export type ReactionKind = "bolt" | "heart" | "siren";

export type CheckInStatus = "verified" | "pending_flavor" | "voided";

export type PhotoScene = "studio" | "dark" | "desk" | "shelf" | "car" | "gym";

export interface Comment {
  readonly id: string;
  readonly memberId: string;
  readonly body: string;
  readonly postedAt: string;
}

export type DisputeStatus = "open" | "cleared" | "voided";

export interface Dispute {
  readonly id: string;
  readonly raisedBy: string;
  readonly reason: string;
  readonly voterIds: readonly string[];
  readonly votesNeeded: number;
  readonly expiresAt: string;
  readonly status: DisputeStatus;
}

export interface CheckIn {
  readonly id: string;
  readonly memberId: string;
  readonly brand: BrandId;
  readonly flavorId: string | null;
  readonly requestedFlavorName: string | null;
  readonly volumeMl: CanSizeMl;
  readonly rating: number;
  readonly priceCents: number | null;
  readonly caption: string;
  readonly consumedAt: string;
  readonly postedAt: string;
  readonly retroactive: boolean;
  readonly unverified: boolean;
  readonly status: CheckInStatus;
  readonly scene: PhotoScene;
  readonly reactions: Readonly<Record<ReactionKind, readonly string[]>>;
  readonly comments: readonly Comment[];
  readonly dispute: Dispute | null;
}

export type ShareTargetType = "club" | "challenge";

export interface GroupShare {
  readonly checkInId: string;
  readonly targetType: ShareTargetType;
  readonly targetId: string;
}

export interface Club {
  readonly id: string;
  readonly name: string;
  readonly inviteCode: string;
  readonly memberIds: readonly string[];
  readonly adminIds: readonly string[];
  readonly tagline: string;
}

export type ChallengeScope = "club" | "community";
export type BrandRule = "monster_only" | "multi_brand";
export type ScoringMode = "total_cans" | "flavor_dex" | "active_days" | "flavor_hunter";

export interface Challenge {
  readonly id: string;
  readonly name: string;
  readonly scope: ChallengeScope;
  readonly clubId: string | null;
  readonly brandRule: BrandRule;
  readonly scoring: ScoringMode;
  readonly dailyPointCap: number;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly playerCount: number;
  readonly joined: boolean;
}

export type TimelineItem =
  | { readonly kind: "check_in"; readonly id: string; readonly checkInId: string }
  | {
      readonly kind: "chat";
      readonly id: string;
      readonly memberId: string;
      readonly body: string;
      readonly postedAt: string;
    }
  | {
      readonly kind: "system";
      readonly id: string;
      readonly body: string;
      readonly postedAt: string;
    };

export type FlavorRequestStatus = "pending" | "merged" | "rejected";

export interface FlavorRequest {
  readonly id: string;
  readonly name: string;
  readonly brand: BrandId;
  readonly series: FlavorSeries;
  readonly submittedBy: string;
  readonly checkInId: string | null;
  readonly submittedAt: string;
  readonly upvoterIds: readonly string[];
  readonly status: FlavorRequestStatus;
}

export type NotificationKind = "check_in" | "dispute" | "reaction" | "mention" | "recap";

export interface AppNotification {
  readonly id: string;
  readonly kind: NotificationKind;
  readonly body: string;
  readonly postedAt: string;
  readonly read: boolean;
}

export type NotificationPrefs = Readonly<Record<NotificationKind, boolean>>;

export type TimeWindow = "all" | "year" | "month" | "week";

export interface RivalEntry {
  readonly id: string;
  readonly name: string;
  readonly members: number;
  readonly points: number;
}
