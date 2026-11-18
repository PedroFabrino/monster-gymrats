import type { Challenge, CheckIn } from "@/types/domain";

export function isCounted(checkIn: CheckIn): boolean {
  return checkIn.status !== "voided";
}

export function isMonsterCheckIn(checkIn: CheckIn): boolean {
  return checkIn.brand === "monster" && isCounted(checkIn);
}

export function isOffBrand(checkIn: Pick<CheckIn, "brand">): boolean {
  return checkIn.brand !== "monster";
}

export function isChallengeActiveAt(challenge: Challenge, iso: string): boolean {
  return iso >= challenge.startsAt && iso <= challenge.endsAt;
}

export function brandAllowed(challenge: Challenge, brand: CheckIn["brand"]): boolean {
  return challenge.brandRule === "multi_brand" || brand === "monster";
}

export function isEligibleForChallenge(checkIn: CheckIn, challenge: Challenge): boolean {
  return (
    isCounted(checkIn) &&
    brandAllowed(challenge, checkIn.brand) &&
    isChallengeActiveAt(challenge, checkIn.consumedAt)
  );
}
