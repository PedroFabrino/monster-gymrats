import type { BrandId, CanSizeMl, Flavor, FlavorSeries } from "@/types/domain";

export const SERIES_ACCENT: Readonly<Record<FlavorSeries, string>> = {
  Ultra: "#00D4FF",
  Original: "#95D600",
  Juice: "#FF9F1C",
  Rehab: "#FFB703",
  Java: "#D97706",
  Reserve: "#C084FC",
  Nitro: "#95D600",
  "Off-Brand": "#F97316",
};

type Row = readonly [
  id: string,
  name: string,
  series: FlavorSeries,
  caffeineMg: number,
  sugarG: number,
  color: string,
  globalCount: number,
];

const MONSTER_ROWS: readonly Row[] = [
  ["ultra-zero", "Ultra Zero", "Ultra", 150, 0, "#E2E8F0", 142810],
  ["ultra-rosa", "Ultra Rosa", "Ultra", 150, 0, "#F9A8D4", 61240],
  ["ultra-paradise", "Ultra Paradise", "Ultra", 150, 0, "#4ADE80", 74110],
  ["ultra-fiesta", "Ultra Fiesta Mango", "Ultra", 150, 0, "#FDBA74", 69820],
  ["ultra-peachy", "Ultra Peachy Keen", "Ultra", 150, 0, "#FDA4AF", 52300],
  ["ultra-strawberry", "Ultra Strawberry Dreams", "Ultra", 150, 0, "#FB7185", 58770],
  ["ultra-watermelon", "Ultra Watermelon", "Ultra", 150, 0, "#F43F5E", 81450],
  ["ultra-blue", "Ultra Blue Hawaiian", "Ultra", 150, 0, "#38BDF8", 47220],
  ["ultra-violet", "Ultra Violet", "Ultra", 150, 0, "#A78BFA", 39880],
  ["ultra-red", "Ultra Red", "Ultra", 150, 0, "#EF4444", 44150],
  ["ultra-sunrise", "Ultra Sunrise", "Ultra", 150, 0, "#FB923C", 51060],
  ["ultra-gold", "Ultra Gold", "Ultra", 150, 0, "#FACC15", 66930],
  ["ultra-black", "Ultra Black", "Ultra", 150, 0, "#334155", 35410],
  ["ultra-vice-guava", "Ultra Vice Guava", "Ultra", 150, 0, "#F472B6", 28760],
  ["ultra-wild-passion", "Ultra Wild Passion", "Ultra", 150, 0, "#C026D3", 22140],
  ["ultra-ruby", "Ultra Fantasy Ruby Red", "Ultra", 150, 0, "#BE123C", 19870],
  ["original", "Monster Original", "Original", 160, 54, "#1F2937", 121330],
  ["lo-carb", "Monster Lo-Carb", "Original", 160, 6, "#60A5FA", 38410],
  ["zero-sugar", "Monster Zero Sugar", "Original", 160, 0, "#111827", 70990],
  ["assault", "Monster Assault", "Original", 160, 52, "#6B7280", 18250],
  ["mule", "Monster Mule Ginger Brew", "Original", 160, 48, "#A16207", 15730],
  ["mango-loco", "Juice Mango Loco", "Juice", 160, 50, "#06B6D4", 98420],
  ["pipeline-punch", "Juice Pipeline Punch", "Juice", 160, 48, "#FF4D8D", 88130],
  ["pacific-punch", "Juice Pacific Punch", "Juice", 160, 50, "#F97316", 54670],
  ["khaotic", "Juice Khaotic", "Juice", 160, 49, "#FB923C", 33980],
  ["monarch", "Juice Monarch", "Juice", 160, 47, "#F59E0B", 29910],
  ["rio-punch", "Juice Rio Punch", "Juice", 160, 46, "#EC4899", 24580],
  ["bad-apple", "Juice Bad Apple", "Juice", 160, 44, "#84CC16", 31720],
  ["aussie-lemonade", "Juice Aussie Lemonade", "Juice", 160, 40, "#FDE047", 37460],
  ["papillon", "Juice Papillon", "Juice", 160, 45, "#F0ABFC", 14920],
  ["rehab-tea-lemonade", "Rehab Tea + Lemonade", "Rehab", 160, 18, "#FFB703", 45390],
  ["rehab-peach", "Rehab Peach Tea", "Rehab", 160, 12, "#FDBA74", 27860],
  ["rehab-wild-berry", "Rehab Wild Berry Tea", "Rehab", 160, 12, "#7C3AED", 21430],
  ["rehab-strawberry", "Rehab Strawberry Lemonade", "Rehab", 160, 14, "#F87171", 23310],
  ["rehab-watermelon", "Rehab Watermelon", "Rehab", 160, 12, "#22C55E", 19960],
  ["java-mean-bean", "Java Mean Bean", "Java", 300, 34, "#78350F", 26770],
  ["java-loca-moca", "Java Loca Moca", "Java", 300, 36, "#92400E", 22080],
  ["java-salted-caramel", "Java Salted Caramel", "Java", 300, 33, "#B45309", 17640],
  ["java-irish-blend", "Java Irish Blend", "Java", 300, 32, "#166534", 9870],
  ["reserve-white-pineapple", "Reserve White Pineapple", "Reserve", 160, 54, "#F5F5F4", 36150],
  ["reserve-watermelon", "Reserve Watermelon", "Reserve", 160, 52, "#DC2626", 29040],
  ["reserve-kiwi-strawberry", "Reserve Kiwi Strawberry", "Reserve", 160, 53, "#65A30D", 18330],
  ["reserve-orange-dreamsicle", "Reserve Orange Dreamsicle", "Reserve", 160, 55, "#EA580C", 21190],
  ["nitro-super-dry", "Nitro Super Dry", "Nitro", 160, 0, "#D1D5DB", 25420],
  ["nitro-cosmic-peach", "Nitro Cosmic Peach", "Nitro", 160, 0, "#F9A8D4", 16880],
];

function volumeFor(series: FlavorSeries): CanSizeMl {
  return series === "Nitro" ? 500 : 473;
}

function toFlavor(row: Row, brand: BrandId, index: number): Flavor {
  const [id, name, series, caffeineMg, sugarG, color, globalCount] = row;
  return {
    id,
    brand,
    name,
    series,
    volumeMl: volumeFor(series),
    caffeineMg,
    sugarG,
    color,
    accent: SERIES_ACCENT[series],
    barcode: `0709${String(10000000 + index * 7919).slice(0, 8)}`,
    globalCount,
  };
}

const OFF_BRAND: readonly Flavor[] = [
  {
    id: "redbull-sugarfree",
    brand: "redbull",
    name: "Red Bull Sugarfree",
    series: "Off-Brand",
    volumeMl: 355,
    caffeineMg: 114,
    sugarG: 0,
    color: "#1E3A8A",
    accent: SERIES_ACCENT["Off-Brand"],
    barcode: "611269991000",
    globalCount: 58210,
  },
  {
    id: "reign-melon-mania",
    brand: "reign",
    name: "Reign Melon Mania",
    series: "Off-Brand",
    volumeMl: 473,
    caffeineMg: 300,
    sugarG: 0,
    color: "#16A34A",
    accent: SERIES_ACCENT["Off-Brand"],
    barcode: "816751021355",
    globalCount: 21740,
  },
];

export const FLAVORS: readonly Flavor[] = [
  ...MONSTER_ROWS.map((row, index) => toFlavor(row, "monster", index)),
  ...OFF_BRAND,
];

export const MONSTER_FLAVORS: readonly Flavor[] = FLAVORS.filter((f) => f.brand === "monster");

export const BRAND_LABEL: Readonly<Record<BrandId, string>> = {
  monster: "Monster Energy",
  redbull: "Red Bull",
  reign: "Reign",
};
