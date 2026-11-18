"use client";

import { Barcode, CheckCircle2, HelpCircle, PackagePlus, Search } from "lucide-react";
import { useState } from "react";
import type { Flavor, FlavorSeries } from "@/types/domain";
import { BadgeChip } from "@/components/ui/BadgeChip";
import { CanArt } from "@/components/ui/CanArt";
import { FLAVORS } from "@/data/flavors";
import { lookupBarcode } from "@/domain/vision";
import { flavorById } from "@/state/selectors";
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

function ResultCard({ draft, onChange }: PanelProps) {
  const [barcodeState, setBarcodeState] = useState<"idle" | "scanning" | "found" | "missing">(
    "idle",
  );
  const { result } = draft;
  const flavor = flavorById(draft.flavorId);
  const candidates =
    result.kind === "match"
      ? result.runnersUp
      : result.kind === "low_confidence"
        ? result.candidates
        : [];
  const scanBarcode = () => {
    setBarcodeState("scanning");
    window.setTimeout(() => {
      const found =
        draft.preset.barcode === null ? null : lookupBarcode(draft.preset.barcode, FLAVORS);
      setBarcodeState(found === null ? "missing" : "found");
      if (found !== null) onChange(withFlavor(draft, found));
    }, 1200);
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 rounded-2xl border border-hairline bg-carbon p-3">
        {flavor !== undefined ? (
          <CanArt color={flavor.color} accent={flavor.accent} className="h-20 shrink-0" />
        ) : (
          <HelpCircle className="h-12 w-12 shrink-0 text-ink-faint" />
        )}
        <div className="min-w-0 flex-1">
          {result.kind === "match" && flavor?.id === result.flavorId && (
            <p className="metric flex items-center gap-1 text-sm font-bold text-status-verified">
              <CheckCircle2 className="h-4 w-4" />
              {Math.round(result.confidence * 100)}% Match
            </p>
          )}
          {result.kind === "low_confidence" && barcodeState !== "found" && (
            <p className="text-sm font-bold text-status-unverified">
              Low confidence. Too dark to be sure.
            </p>
          )}
          {barcodeState === "found" && (
            <p className="text-sm font-bold text-status-verified">Barcode matched</p>
          )}
          {result.kind === "not_in_catalog" && draft.flavorId === null && (
            <p className="text-sm font-bold text-series-reserve">Not in the catalog yet</p>
          )}
          <p className="truncate font-display text-xl font-bold uppercase">
            {flavor?.name ?? draft.request?.name ?? "Pick a flavor"}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {draft.brand !== "monster" && <BadgeChip kind="offbrand">Off-Brand</BadgeChip>}
            {draft.unverified && <BadgeChip kind="unverified">Unverified Can</BadgeChip>}
          </div>
        </div>
      </div>
      {candidates.length > 0 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {candidates.map((c) => {
            const f = flavorById(c.flavorId);
            if (f === undefined) return null;
            return (
              <button
                key={c.flavorId}
                type="button"
                onClick={() => onChange(withFlavor(draft, f))}
                className={`press shrink-0 rounded-full border px-3 py-1.5 text-xs ${draft.flavorId === f.id ? "border-volt bg-volt/10 text-volt" : "border-hairline text-ink-muted"}`}
              >
                {f.name}{" "}
                <span className="metric text-ink-faint">{Math.round(c.confidence * 100)}%</span>
              </button>
            );
          })}
        </div>
      )}
      {result.kind === "low_confidence" && barcodeState !== "found" && (
        <button
          type="button"
          className="btn-ghost"
          onClick={scanBarcode}
          disabled={barcodeState === "scanning"}
        >
          <Barcode className="h-4 w-4 text-volt" />{" "}
          {barcodeState === "scanning"
            ? "Scanning barcode..."
            : barcodeState === "missing"
              ? "No barcode match. Try again"
              : "Scan Barcode"}
        </button>
      )}
    </div>
  );
}

function CatalogSearch({ draft, onChange }: PanelProps) {
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

function RequestForm({ draft, onChange }: PanelProps) {
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
    <div className="flex flex-col gap-2 rounded-2xl border border-series-reserve/40 bg-series-reserve/[0.06] p-3">
      <p className="eyebrow !text-series-reserve">Flavor Request</p>
      <input
        className="input"
        value={request.name}
        onChange={(e) => onChange({ ...draft, request: { ...request, name: e.target.value } })}
        placeholder="Flavor name"
        aria-label="Requested flavor name"
        maxLength={60}
      />
      <select
        className="input"
        value={request.series}
        onChange={(e) =>
          onChange({
            ...draft,
            request: {
              ...request,
              series: REQUEST_SERIES.find((s) => s === e.target.value) ?? "Ultra",
            },
          })
        }
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

export function IdentifyPanel({ draft, onChange }: PanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <ResultCard draft={draft} onChange={onChange} />
      <CatalogSearch draft={draft} onChange={onChange} />
      <RequestForm draft={draft} onChange={onChange} />
    </div>
  );
}
