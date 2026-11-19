import type { BrandId, Flavor } from "@/types/domain";

export interface VisionCandidate {
  readonly flavorId: string;
  readonly confidence: number;
}

export interface VisionResponse {
  readonly isCan: boolean;
  readonly brand: BrandId | null;
  readonly flavorGuess: string | null;
  readonly confidence: number;
  readonly candidates: readonly VisionCandidate[];
}

export type IdentifyResult =
  | {
      readonly kind: "match";
      readonly flavorId: string;
      readonly confidence: number;
      readonly runnersUp: readonly VisionCandidate[];
    }
  | { readonly kind: "low_confidence"; readonly candidates: readonly VisionCandidate[] }
  | { readonly kind: "not_in_catalog"; readonly guessName: string; readonly brand: BrandId }
  | { readonly kind: "non_can" }
  | { readonly kind: "invalid" };

export const MATCH_THRESHOLD = 0.7;

const BRANDS: readonly BrandId[] = ["monster", "redbull", "reign"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseBrand(value: unknown): BrandId | null {
  return BRANDS.find((b) => b === value) ?? null;
}

function parseCandidate(value: unknown): VisionCandidate | null {
  if (!isRecord(value)) return null;
  const { flavor_id: flavorId, confidence } = value;
  if (typeof flavorId !== "string" || typeof confidence !== "number") return null;
  return { flavorId, confidence };
}

export function parseVisionResponse(raw: unknown): VisionResponse | null {
  if (!isRecord(raw) || typeof raw.is_can !== "boolean" || typeof raw.confidence !== "number") {
    return null;
  }
  const candidates = Array.isArray(raw.candidates)
    ? raw.candidates.map(parseCandidate).filter((c): c is VisionCandidate => c !== null)
    : [];
  return {
    isCan: raw.is_can,
    brand: parseBrand(raw.brand),
    flavorGuess: typeof raw.flavor_guess === "string" ? raw.flavor_guess : null,
    confidence: raw.confidence,
    candidates: candidates.toSorted((a, b) => b.confidence - a.confidence),
  };
}

export function interpretVision(raw: unknown, catalog: readonly Flavor[]): IdentifyResult {
  const response = parseVisionResponse(raw);
  if (response === null) return { kind: "invalid" };
  if (!response.isCan) return { kind: "non_can" };
  const known = response.candidates.filter((c) => catalog.some((f) => f.id === c.flavorId));
  const [top, ...rest] = known;
  if (top === undefined) {
    return {
      kind: "not_in_catalog",
      guessName: response.flavorGuess ?? "Unknown flavor",
      brand: response.brand ?? "monster",
    };
  }
  if (top.confidence < MATCH_THRESHOLD) return { kind: "low_confidence", candidates: known };
  return {
    kind: "match",
    flavorId: top.flavorId,
    confidence: top.confidence,
    runnersUp: rest.slice(0, 3),
  };
}

export function lookupBarcode(code: string, catalog: readonly Flavor[]): Flavor | null {
  const normalized = code.replace(/\D/g, "");
  if (normalized.length === 0) return null;
  return catalog.find((f) => f.barcode === normalized) ?? null;
}
