"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { FLAVORS } from "@/data/flavors";
import { ME_ID } from "@/data/mock-data";
import type { SamplePreset } from "@/data/presets";
import { createCheckIn } from "@/domain/check-in";
import { buildShareOptions, toggleShareOption, type ShareOption } from "@/domain/fanout";
import { interpretVision } from "@/domain/vision";
import { addHours } from "@/domain/time";
import { useAppState } from "@/state/AppStateProvider";
import { useUi } from "@/state/UiProvider";
import { CaptureStep } from "./CaptureStep";
import { DetailsFields } from "./DetailsFields";
import { IdentifyPanel } from "./IdentifyPanel";
import { ShareStep } from "./ShareStep";
import { canContinue, initialDraft, priceToCents, type CheckInDraft } from "./draft";

const SCAN_MS = 1600;
const STEP_TITLES = ["Snap Your Can", "Confirm Flavor", "Share To"] as const;

function StepDots({ step }: { readonly step: number }) {
  return (
    <div className="mb-4 flex gap-1.5" aria-label={`Step ${step + 1} of 3`}>
      {STEP_TITLES.map((t, i) => (
        <span
          key={t}
          className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-volt" : "bg-hairline"}`}
        />
      ))}
    </div>
  );
}

export function CheckInFlow({ onClose }: { readonly onClose: () => void }) {
  const { state, dispatch } = useAppState();
  const { showToast } = useUi();
  const [scanning, setScanning] = useState<SamplePreset | null>(null);
  const [nonCan, setNonCan] = useState<SamplePreset | null>(null);
  const [draft, setDraft] = useState<CheckInDraft | null>(null);
  const [options, setOptions] = useState<readonly ShareOption[] | null>(null);
  const step = options !== null ? 2 : draft !== null ? 1 : 0;

  useEffect(() => {
    if (scanning === null) return undefined;
    const timer = window.setTimeout(() => {
      const result = interpretVision(scanning.visionResponse, FLAVORS);
      if (result.kind === "non_can") setNonCan(scanning);
      else setDraft(initialDraft(scanning, result, FLAVORS, false));
      setScanning(null);
    }, SCAN_MS);
    return () => window.clearTimeout(timer);
  }, [scanning]);

  const consumedAt = (d: CheckInDraft) => addHours(state.nowIso, -d.retroHours);

  const goShare = (d: CheckInDraft) =>
    setOptions(
      buildShareOptions(
        { memberId: ME_ID, brand: d.brand, consumedAt: consumedAt(d) },
        state.clubs,
        state.challenges,
      ),
    );

  const post = (d: CheckInDraft, opts: readonly ShareOption[]) => {
    const checkIn = createCheckIn({
      id: `ci-new-${state.seq}`,
      memberId: ME_ID,
      brand: d.brand,
      flavorId: d.flavorId,
      requestedFlavorName: d.flavorId === null ? (d.request?.name.trim() ?? null) : null,
      volumeMl: d.volumeMl,
      rating: d.rating,
      priceCents: priceToCents(d.priceText),
      caption: d.caption.trim(),
      consumedAt: consumedAt(d),
      postedAt: state.nowIso,
      scene: d.preset.scene,
      unverified: d.unverified,
    });
    const shares = opts
      .filter((o) => o.selected)
      .map((o) => ({ checkInId: checkIn.id, targetType: o.targetType, targetId: o.targetId }));
    const flavorRequest =
      d.flavorId === null && d.request !== null
        ? { name: d.request.name.trim(), series: d.request.series }
        : null;
    dispatch({ type: "post_check_in", payload: { checkIn, shares, flavorRequest } });
    showToast(`Check-In posted to ${shares.length} place${shares.length === 1 ? "" : "s"}`);
    onClose();
  };

  const back = () => {
    if (options !== null) setOptions(null);
    else setDraft(null);
  };

  const footer =
    draft === null ? undefined : options === null ? (
      <button
        type="button"
        className="btn-primary w-full"
        disabled={!canContinue(draft)}
        onClick={() => goShare(draft)}
      >
        Continue
      </button>
    ) : (
      <button type="button" className="btn-primary w-full" onClick={() => post(draft, options)}>
        Post Check-In
      </button>
    );

  return (
    <Sheet
      title={STEP_TITLES[step] ?? "Check-In"}
      subtitle={`Step ${step + 1} of 3`}
      onClose={onClose}
      footer={footer}
      tall
    >
      <StepDots step={step} />
      {step > 0 && (
        <button
          type="button"
          onClick={back}
          className="mb-3 flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      )}
      {step === 0 && (
        <CaptureStep
          scanning={scanning}
          nonCan={nonCan}
          onPick={setScanning}
          onRetake={() => setNonCan(null)}
          onPostAnyway={() => {
            if (nonCan === null) return;
            setDraft(initialDraft(nonCan, { kind: "non_can" }, FLAVORS, true));
            setNonCan(null);
          }}
        />
      )}
      {step === 1 && draft !== null && (
        <div className="flex flex-col gap-5">
          <IdentifyPanel draft={draft} onChange={setDraft} />
          <DetailsFields draft={draft} onChange={setDraft} />
        </div>
      )}
      {step === 2 && options !== null && (
        <ShareStep
          options={options}
          onToggle={(key) => setOptions(toggleShareOption(options, key))}
        />
      )}
    </Sheet>
  );
}
