"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { FLAVORS } from "@/data/flavors";
import { ME_ID } from "@/data/mock-data";
import type { SamplePreset } from "@/data/presets";
import { createCheckIn } from "@/domain/check-in";
import { buildShareOptions, toggleShareOption, type ShareOption } from "@/domain/fanout";
import { addHours } from "@/domain/time";
import { interpretVision } from "@/domain/vision";
import type { PostCheckInPayload } from "@/state/app-state";
import { useAppState } from "@/state/AppStateProvider";
import { useUi } from "@/state/UiProvider";
import { CaptureStep } from "./CaptureStep";
import { DetailsFields } from "./DetailsFields";
import { IdentifyPanel } from "./IdentifyPanel";
import { ShareStep } from "./ShareStep";
import { canContinue, initialDraft, priceToCents, type CheckInDraft } from "./draft";

const SCAN_MS = 1600;
const STEP_TITLES = ["Snap Your Can", "Confirm Flavor", "Share To"] as const;

function buildPayload(input: {
  readonly draft: CheckInDraft;
  readonly options: readonly ShareOption[];
  readonly seq: number;
  readonly nowIso: string;
}): PostCheckInPayload {
  const { draft, options, seq, nowIso } = input;
  const checkIn = createCheckIn({
    id: `ci-new-${seq}`,
    memberId: ME_ID,
    brand: draft.brand,
    flavorId: draft.flavorId,
    requestedFlavorName: draft.flavorId === null ? (draft.request?.name.trim() ?? null) : null,
    volumeMl: draft.volumeMl,
    rating: draft.rating,
    priceCents: priceToCents(draft.priceText),
    caption: draft.caption.trim(),
    consumedAt: addHours(nowIso, -draft.retroHours),
    postedAt: nowIso,
    scene: draft.preset.scene,
    unverified: draft.unverified,
  });
  const shares = options
    .filter((o) => o.selected)
    .map((o) => ({ checkInId: checkIn.id, targetType: o.targetType, targetId: o.targetId }));
  const flavorRequest =
    draft.flavorId === null && draft.request !== null
      ? { name: draft.request.name.trim(), series: draft.request.series }
      : null;
  return { checkIn, shares, flavorRequest };
}

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

function FlowFooter({
  draft,
  options,
  onContinue,
  onPost,
}: {
  readonly draft: CheckInDraft | null;
  readonly options: readonly ShareOption[] | null;
  readonly onContinue: () => void;
  readonly onPost: () => void;
}) {
  if (draft === null) return null;
  if (options === null) {
    return (
      <button
        type="button"
        className="btn-primary w-full"
        disabled={!canContinue(draft)}
        onClick={onContinue}
      >
        Continue
      </button>
    );
  }
  return (
    <button type="button" className="btn-primary w-full" onClick={onPost}>
      Post Check-In
    </button>
  );
}

type CheckInController = ReturnType<typeof useCheckInState>;

function CheckInSteps({ step, ctrl }: { readonly step: number; readonly ctrl: CheckInController }) {
  if (step === 0) {
    return (
      <CaptureStep
        scanning={ctrl.scanning}
        nonCan={ctrl.nonCan}
        onPick={ctrl.setScanning}
        onRetake={() => ctrl.setNonCan(null)}
        onPostAnyway={ctrl.postAnyway}
      />
    );
  }
  if (step === 1 && ctrl.draft !== null) {
    return (
      <div className="flex flex-col gap-5">
        <IdentifyPanel draft={ctrl.draft} onChange={ctrl.setDraft} />
        <DetailsFields draft={ctrl.draft} onChange={ctrl.setDraft} />
      </div>
    );
  }
  if (step === 2 && ctrl.options !== null) {
    return <ShareStep options={ctrl.options} onToggle={ctrl.toggleShare} />;
  }
  return null;
}

function useVisionScan(opts: {
  readonly scanning: SamplePreset | null;
  readonly setScanning: (v: SamplePreset | null) => void;
  readonly setNonCan: (v: SamplePreset | null) => void;
  readonly setDraft: (v: CheckInDraft | null) => void;
}) {
  const { scanning, setScanning, setNonCan, setDraft } = opts;
  useEffect(() => {
    if (scanning === null) return undefined;
    const timer = window.setTimeout(() => {
      const result = interpretVision(scanning.visionResponse, FLAVORS);
      if (result.kind === "non_can") setNonCan(scanning);
      else
        setDraft(initialDraft({ preset: scanning, result, catalog: FLAVORS, unverified: false }));
      setScanning(null);
    }, SCAN_MS);
    return () => window.clearTimeout(timer);
  }, [scanning, setScanning, setNonCan, setDraft]);
}

function unverifiedDraftFor(preset: SamplePreset): CheckInDraft {
  return initialDraft({ preset, result: { kind: "non_can" }, catalog: FLAVORS, unverified: true });
}

function shareTargetsFor(
  draft: CheckInDraft,
  state: ReturnType<typeof useAppState>["state"],
): readonly ShareOption[] {
  const consumedAt = addHours(state.nowIso, -draft.retroHours);
  return buildShareOptions(
    { memberId: ME_ID, brand: draft.brand, consumedAt },
    state.clubs,
    state.challenges,
  );
}

function useCheckInState(onClose: () => void) {
  const { state, dispatch } = useAppState();
  const { showToast } = useUi();
  const [scanning, setScanning] = useState<SamplePreset | null>(null);
  const [nonCan, setNonCan] = useState<SamplePreset | null>(null);
  const [draft, setDraft] = useState<CheckInDraft | null>(null);
  const [options, setOptions] = useState<readonly ShareOption[] | null>(null);
  useVisionScan({ scanning, setScanning, setNonCan, setDraft });
  const goShare = () => draft !== null && setOptions(shareTargetsFor(draft, state));
  const postAnyway = () => {
    if (nonCan !== null) setDraft(unverifiedDraftFor(nonCan));
    setNonCan(null);
  };
  const toggleShare = (key: string) => options && setOptions(toggleShareOption(options, key));
  const post = () => {
    if (draft === null || options === null) return;
    const payload = buildPayload({ draft, options, seq: state.seq, nowIso: state.nowIso });
    dispatch({ type: "post_check_in", payload });
    showToast(
      `Check-In posted to ${payload.shares.length} place${payload.shares.length === 1 ? "" : "s"}`,
    );
    onClose();
  };
  return {
    scanning,
    setScanning,
    nonCan,
    setNonCan,
    draft,
    setDraft,
    options,
    setOptions,
    goShare,
    postAnyway,
    toggleShare,
    post,
  };
}

export function CheckInFlow({ onClose }: { readonly onClose: () => void }) {
  const ctrl = useCheckInState(onClose);
  const step = ctrl.options !== null ? 2 : ctrl.draft !== null ? 1 : 0;
  const footer =
    ctrl.draft === null ? undefined : (
      <FlowFooter
        draft={ctrl.draft}
        options={ctrl.options}
        onContinue={ctrl.goShare}
        onPost={ctrl.post}
      />
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
          onClick={() => (ctrl.options !== null ? ctrl.setOptions(null) : ctrl.setDraft(null))}
          className="mb-3 flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      )}
      <CheckInSteps step={step} ctrl={ctrl} />
    </Sheet>
  );
}
