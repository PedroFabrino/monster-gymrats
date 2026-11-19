import type { BrandId, Challenge, Club } from "@/types/domain";
import { brandAllowed, isChallengeActiveAt } from "./eligibility";

export interface ShareOption {
  readonly key: string;
  readonly targetType: "club" | "challenge";
  readonly targetId: string;
  readonly label: string;
  readonly selected: boolean;
  readonly blockedReason: string | null;
}

export interface ShareContext {
  readonly memberId: string;
  readonly brand: BrandId;
  readonly consumedAt: string;
}

export function buildShareOptions(
  context: ShareContext,
  clubs: readonly Club[],
  challenges: readonly Challenge[],
): readonly ShareOption[] {
  const myClubs = clubs.filter((c) => c.memberIds.includes(context.memberId));
  const myClubIds = new Set(myClubs.map((c) => c.id));
  const clubOptions = myClubs.map((club): ShareOption => ({
    key: `club:${club.id}`,
    targetType: "club",
    targetId: club.id,
    label: club.name,
    selected: true,
    blockedReason: null,
  }));
  const challengeOptions = challenges
    .filter(
      (ch) =>
        ch.joined &&
        isChallengeActiveAt(ch, context.consumedAt) &&
        (ch.scope === "community" || (ch.clubId !== null && myClubIds.has(ch.clubId))),
    )
    .map((ch): ShareOption => {
      const allowed = brandAllowed(ch, context.brand);
      return {
        key: `challenge:${ch.id}`,
        targetType: "challenge",
        targetId: ch.id,
        label: ch.name,
        selected: allowed,
        blockedReason: allowed ? null : "Monster-only Challenge",
      };
    });
  return [...clubOptions, ...challengeOptions];
}

export function toggleShareOption(
  options: readonly ShareOption[],
  key: string,
): readonly ShareOption[] {
  return options.map((o) =>
    o.key === key && o.blockedReason === null ? { ...o, selected: !o.selected } : o,
  );
}
