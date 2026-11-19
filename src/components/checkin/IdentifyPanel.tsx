"use client";

import { Barcode, CheckCircle2, HelpCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Flavor } from "@/types/domain";
import { BadgeChip } from "@/components/ui/BadgeChip";
import { CanArt } from "@/components/ui/CanArt";
import { FLAVORS } from "@/data/flavors";
import { lookupBarcode, type VisionCandidate } from "@/domain/vision";
import { flavorById } from "@/state/selectors";
import { CatalogSearch, RequestForm } from "./IdentifyExtras";
import { withFlavor, type CheckInDraft } from "./draft";

type BarcodeState = "idle" | "scanning" | "found" | "missing" | "manual";

interface PanelProps {
  readonly draft: CheckInDraft;
  readonly onChange: (draft: CheckInDraft) => void;
}

function MatchStatusText({
  draft,
  flavor,
  barcodeFound,
}: {
  readonly draft: CheckInDraft;
  readonly flavor: Flavor | undefined;
  readonly barcodeFound: boolean;
}) {
  const { result } = draft;
  if (barcodeFound) {
    return <p className="text-sm font-bold text-status-verified">Barcode matched</p>;
  }
  if (result.kind === "match" && flavor?.id === result.flavorId) {
    return (
      <p className="metric flex items-center gap-1 text-sm font-bold text-status-verified">
        <CheckCircle2 className="h-4 w-4" />
        {Math.round(result.confidence * 100)}% Match
      </p>
    );
  }
  if (result.kind === "low_confidence") {
    return (
      <p className="text-sm font-bold text-status-unverified">
        Low confidence. Too dark to be sure.
      </p>
    );
  }
  if (result.kind === "not_in_catalog" && draft.flavorId === null) {
    return <p className="text-sm font-bold text-series-reserve">Not in the catalog yet</p>;
  }
  return null;
}

function CandidateChips({
  candidates,
  selectedId,
  onSelect,
}: {
  readonly candidates: readonly VisionCandidate[];
  readonly selectedId: string | null;
  readonly onSelect: (flavor: Flavor) => void;
}) {
  if (candidates.length === 0) return null;
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {candidates.map((c) => {
        const f = flavorById(c.flavorId);
        if (f === undefined) return null;
        const active = selectedId === f.id;
        return (
          <button
            key={c.flavorId}
            type="button"
            onClick={() => onSelect(f)}
            className={`press shrink-0 rounded-full border px-3 py-1.5 text-xs ${active ? "border-volt bg-volt/10 text-volt" : "border-hairline text-ink-muted"}`}
          >
            {f.name}{" "}
            <span className="metric text-ink-faint">{Math.round(c.confidence * 100)}%</span>
          </button>
        );
      })}
    </div>
  );
}

function barcodeButtonLabel(state: BarcodeState): string {
  if (state === "scanning") return "Scanning barcode...";
  if (state === "missing") return "No barcode match. Try again";
  return "Scan Barcode";
}

function ManualBarcodeForm({ onResolve }: { readonly onResolve: (code: string) => void }) {
  const [code, setCode] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onResolve(code);
  };
  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        className="input metric flex-1"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter UPC/EAN (e.g. 070910166299)"
        aria-label="Barcode number"
      />
      <button type="submit" className="btn-primary !px-4 !text-sm">
        Lookup
      </button>
    </form>
  );
}

function BarcodeControl({
  draft,
  barcodeState,
  setBarcodeState,
  onChange,
}: PanelProps & {
  readonly barcodeState: BarcodeState;
  readonly setBarcodeState: (next: BarcodeState) => void;
}) {
  if (barcodeState === "found") return null;
  const resolveCode = (rawCode: string) => {
    const found = lookupBarcode(rawCode, FLAVORS);
    setBarcodeState(found === null ? "missing" : "found");
    if (found !== null) onChange(withFlavor(draft, found));
  };
  if (barcodeState === "manual") return <ManualBarcodeForm onResolve={resolveCode} />;
  const scan = () => {
    const presetCode = draft.preset.barcode;
    if (presetCode === null) return setBarcodeState("manual");
    setBarcodeState("scanning");
    window.setTimeout(() => resolveCode(presetCode), 1200);
  };
  return (
    <button
      type="button"
      className="btn-ghost"
      onClick={scan}
      disabled={barcodeState === "scanning"}
    >
      <Barcode className="h-4 w-4 text-volt" /> {barcodeButtonLabel(barcodeState)}
    </button>
  );
}

function ResultHeader({
  draft,
  flavor,
  barcodeFound,
}: {
  readonly draft: CheckInDraft;
  readonly flavor: Flavor | undefined;
  readonly barcodeFound: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-hairline bg-carbon p-3">
      {flavor !== undefined ? (
        <CanArt color={flavor.color} accent={flavor.accent} className="h-20 shrink-0" />
      ) : (
        <HelpCircle className="h-12 w-12 shrink-0 text-ink-faint" />
      )}
      <div className="min-w-0 flex-1">
        <MatchStatusText draft={draft} flavor={flavor} barcodeFound={barcodeFound} />
        <p className="truncate font-display text-xl font-bold uppercase">
          {flavor?.name ?? draft.request?.name ?? "Pick a flavor"}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {draft.brand !== "monster" && <BadgeChip kind="offbrand">Off-Brand</BadgeChip>}
          {draft.unverified && <BadgeChip kind="unverified">Unverified Can</BadgeChip>}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ draft, onChange }: PanelProps) {
  const [barcodeState, setBarcodeState] = useState<BarcodeState>("idle");
  const { result } = draft;
  const flavor = flavorById(draft.flavorId);
  const candidates =
    result.kind === "match"
      ? result.runnersUp
      : result.kind === "low_confidence"
        ? result.candidates
        : [];
  return (
    <div className="flex flex-col gap-3">
      <ResultHeader draft={draft} flavor={flavor} barcodeFound={barcodeState === "found"} />
      <CandidateChips
        candidates={candidates}
        selectedId={draft.flavorId}
        onSelect={(f) => onChange(withFlavor(draft, f))}
      />
      <BarcodeControl
        draft={draft}
        barcodeState={barcodeState}
        setBarcodeState={setBarcodeState}
        onChange={onChange}
      />
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
