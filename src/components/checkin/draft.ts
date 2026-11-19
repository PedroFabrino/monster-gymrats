import type { BrandId, CanSizeMl, Flavor, FlavorSeries } from "@/types/domain";
import type { SamplePreset } from "@/data/presets";
import type { IdentifyResult } from "@/domain/vision";

export interface FlavorRequestDraft {
  readonly name: string;
  readonly series: FlavorSeries;
}

export interface CheckInDraft {
  readonly preset: SamplePreset;
  readonly result: IdentifyResult;
  readonly brand: BrandId;
  readonly flavorId: string | null;
  readonly request: FlavorRequestDraft | null;
  readonly unverified: boolean;
  readonly volumeMl: CanSizeMl;
  readonly rating: number;
  readonly priceText: string;
  readonly caption: string;
  readonly retroHours: number;
}

export const CAN_SIZES: readonly CanSizeMl[] = [355, 473, 500, 710];
export const RETRO_CHOICES: readonly number[] = [0, 1, 3, 6, 12, 24];

export function priceToCents(text: string): number | null {
  const value = Number.parseFloat(text.replace(",", "."));
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(Math.min(value, 99.99) * 100);
}

export function withFlavor(draft: CheckInDraft, flavor: Flavor): CheckInDraft {
  return {
    ...draft,
    flavorId: flavor.id,
    brand: flavor.brand,
    volumeMl: flavor.volumeMl,
    request: null,
  };
}

export interface InitialDraftOptions {
  readonly preset: SamplePreset;
  readonly result: IdentifyResult;
  readonly catalog: readonly Flavor[];
  readonly unverified: boolean;
}

export function initialDraft({
  preset,
  result,
  catalog,
  unverified,
}: InitialDraftOptions): CheckInDraft {
  const base: CheckInDraft = {
    preset,
    result,
    brand: "monster",
    flavorId: null,
    request: null,
    unverified,
    volumeMl: 473,
    rating: 4,
    priceText: "",
    caption: "",
    retroHours: 0,
  };
  if (result.kind === "match") {
    const flavor = catalog.find((f) => f.id === result.flavorId);
    return flavor === undefined ? base : withFlavor(base, flavor);
  }
  if (result.kind === "not_in_catalog") {
    return { ...base, brand: result.brand, request: { name: result.guessName, series: "Ultra" } };
  }
  return base;
}

export function canContinue(draft: CheckInDraft): boolean {
  if (draft.flavorId !== null) return true;
  return draft.request !== null && draft.request.name.trim() !== "";
}
