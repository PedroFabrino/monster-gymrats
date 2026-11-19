"use client";

import { PackagePlus, Search } from "lucide-react";
import { useState } from "react";
import type { Flavor, FlavorSeries } from "@/types/domain";
import { FLAVORS } from "@/data/flavors";
import { withFlavor, type CheckInDraft } from "./draft";

const REQUEST_SERIES: readonly FlavorSeries[] = [
  "Ultra",
  "Original",
  "Juice",
  "Rehab",
  "Java",
  "Reserve",
  "Nitro",
];

interface PanelProps {
  readonly draft: CheckInDraft;
  readonly onChange: (draft: CheckInDraft) => void;
}

export function CatalogSearch({ draft, onChange }: PanelProps) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches: readonly Flavor[] =
    q === "" ? [] : FLAVORS.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 6);
  return (
    <div>
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Wrong flavor? Search the catalog"
          aria-label="Search catalog"
          className="input !pl-9"
        />
      </label>
      {matches.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-xl border border-hairline">
          {matches.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(withFlavor(draft, f));
                  setQuery("");
                }}
                className="flex w-full items-center gap-2 border-b border-hairline bg-carbon px-3 py-2 text-left text-sm last:border-0 hover:bg-graphite"
              >
                <span className="h-3 w-3 rounded-full" style={{ background: f.color }} />
                {f.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestFormBody({
  name,
  series,
  onName,
  onSeries,
}: {
  readonly name: string;
  readonly series: FlavorSeries;
  readonly onName: (name: string) => void;
  readonly onSeries: (series: FlavorSeries) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-series-reserve/40 bg-series-reserve/[0.06] p-3">
      <p className="eyebrow !text-series-reserve">Flavor Request</p>
      <input
        className="input"
        value={name}
        onChange={(e) => onName(e.target.value)}
        placeholder="Flavor name"
        aria-label="Requested flavor name"
        maxLength={60}
      />
      <select
        className="input"
        value={series}
        onChange={(e) => onSeries(REQUEST_SERIES.find((s) => s === e.target.value) ?? "Ultra")}
        aria-label="Series"
      >
        {REQUEST_SERIES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <p className="text-[11px] text-ink-muted">
        Your Check-In posts as Pending Flavor and joins the Dex once the request is approved.
      </p>
    </div>
  );
}

export function RequestForm({ draft, onChange }: PanelProps) {
  const request = draft.request;
  if (request === null) {
    return (
      <button
        type="button"
        onClick={() =>
          onChange({ ...draft, flavorId: null, request: { name: "", series: "Ultra" } })
        }
        className="flex items-center gap-1.5 self-start text-xs font-semibold text-series-reserve"
      >
        <PackagePlus className="h-4 w-4" /> Missing flavor? Submit Flavor Request
      </button>
    );
  }
  return (
    <RequestFormBody
      name={request.name}
      series={request.series}
      onName={(name) => onChange({ ...draft, request: { ...request, name } })}
      onSeries={(series) => onChange({ ...draft, request: { ...request, series } })}
    />
  );
}
