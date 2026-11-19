import type { BrandId, CanSizeMl, CheckIn, PhotoScene } from "@/types/domain";
import { hoursBetween } from "./time";

export interface NewCheckInInput {
  readonly id: string;
  readonly memberId: string;
  readonly brand: BrandId;
  readonly flavorId: string | null;
  readonly requestedFlavorName?: string | null;
  readonly volumeMl: CanSizeMl;
  readonly rating: number;
  readonly priceCents?: number | null;
  readonly caption?: string;
  readonly consumedAt: string;
  readonly postedAt: string;
  readonly scene: PhotoScene;
  readonly unverified?: boolean;
}

export const RETRO_WINDOW_HOURS = 24;

export function createCheckIn(input: NewCheckInInput): CheckIn {
  return {
    id: input.id,
    memberId: input.memberId,
    brand: input.brand,
    flavorId: input.flavorId,
    requestedFlavorName: input.requestedFlavorName ?? null,
    volumeMl: input.volumeMl,
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    priceCents: input.priceCents ?? null,
    caption: input.caption ?? "",
    consumedAt: input.consumedAt,
    postedAt: input.postedAt,
    retroactive: hoursBetween(input.consumedAt, input.postedAt) >= 1,
    unverified: input.unverified ?? false,
    status: input.flavorId === null ? "pending_flavor" : "verified",
    scene: input.scene,
    reactions: { bolt: [], heart: [], siren: [] },
    comments: [],
    dispute: null,
  };
}

export function isWithinRetroWindow(consumedAt: string, postedAt: string): boolean {
  const gap = hoursBetween(consumedAt, postedAt);
  return gap >= 0 && gap <= RETRO_WINDOW_HOURS;
}

export function formatPrice(cents: number | null): string | null {
  return cents === null ? null : `$${(cents / 100).toFixed(2)}`;
}
