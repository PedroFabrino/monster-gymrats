import type { PhotoScene } from "@/types/domain";

export type PresetId = "clear" | "dark" | "offbrand" | "unknown" | "noncan";

export interface SamplePreset {
  readonly id: PresetId;
  readonly title: string;
  readonly subtitle: string;
  readonly scene: PhotoScene;
  readonly canColor: string | null;
  readonly barcode: string | null;
  readonly visionResponse: unknown;
}

export const SAMPLE_PRESETS: readonly SamplePreset[] = [
  {
    id: "clear",
    title: "Monster Ultra Zero",
    subtitle: "Clear shot",
    scene: "studio",
    canColor: "#E2E8F0",
    barcode: null,
    visionResponse: {
      is_can: true,
      brand: "monster",
      flavor_guess: "Monster Ultra Zero",
      confidence: 0.98,
      candidates: [
        { flavor_id: "ultra-zero", confidence: 0.98 },
        { flavor_id: "nitro-super-dry", confidence: 0.41 },
        { flavor_id: "reserve-white-pineapple", confidence: 0.22 },
        { flavor_id: "ultra-gold", confidence: 0.09 },
      ],
    },
  },
  {
    id: "dark",
    title: "Monster Mango Loco",
    subtitle: "Dark room",
    scene: "dark",
    canColor: "#06B6D4",
    barcode: "070910166299",
    visionResponse: {
      is_can: true,
      brand: "monster",
      flavor_guess: null,
      confidence: 0.38,
      candidates: [
        { flavor_id: "mango-loco", confidence: 0.38 },
        { flavor_id: "ultra-blue", confidence: 0.33 },
        { flavor_id: "pacific-punch", confidence: 0.18 },
      ],
    },
  },
  {
    id: "offbrand",
    title: "Red Bull Sugarfree",
    subtitle: "Off-Brand",
    scene: "studio",
    canColor: "#1E3A8A",
    barcode: null,
    visionResponse: {
      is_can: true,
      brand: "redbull",
      flavor_guess: "Red Bull Sugarfree",
      confidence: 0.95,
      candidates: [
        { flavor_id: "redbull-sugarfree", confidence: 0.95 },
        { flavor_id: "lo-carb", confidence: 0.12 },
      ],
    },
  },
  {
    id: "unknown",
    title: "Rare Imported Flavor",
    subtitle: "Not in catalog",
    scene: "desk",
    canColor: "#A3E635",
    barcode: null,
    visionResponse: {
      is_can: true,
      brand: "monster",
      flavor_guess: "Monster Ultra Yuzu (KR Import)",
      confidence: 0.88,
      candidates: [],
    },
  },
  {
    id: "noncan",
    title: "Empty Desk / Grocery Shelf",
    subtitle: "No can found",
    scene: "shelf",
    canColor: null,
    barcode: null,
    visionResponse: {
      is_can: false,
      brand: null,
      flavor_guess: null,
      confidence: 0.91,
      candidates: [],
    },
  },
];
