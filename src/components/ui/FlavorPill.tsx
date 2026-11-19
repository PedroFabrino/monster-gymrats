import type { Flavor } from "@/types/domain";

interface FlavorPillProps {
  readonly flavor: Flavor;
  readonly volumeMl?: number;
  readonly size?: "sm" | "md";
}

export function FlavorPill({ flavor, volumeMl, size = "md" }: FlavorPillProps) {
  const prefix = flavor.brand === "monster" && !flavor.name.startsWith("Monster") ? "Monster " : "";
  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-full border bg-void/70 font-medium backdrop-blur ${size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"}`}
      style={{ borderColor: `${flavor.accent}55` }}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: flavor.color, boxShadow: `0 0 0 2px ${flavor.accent}66` }}
      />
      <span className="truncate text-ink">
        {prefix}
        {flavor.name}
      </span>
      <span className="metric shrink-0 text-ink-faint">
        {volumeMl ?? flavor.volumeMl}ml • {flavor.caffeineMg}mg
      </span>
    </span>
  );
}

export function SeriesDot({ color }: { readonly color: string }) {
  return <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />;
}
