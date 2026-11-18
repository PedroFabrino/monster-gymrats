"use client";

import { AlertTriangle, Camera, RotateCcw } from "lucide-react";
import { CanPhoto } from "@/components/ui/CanArt";
import { SAMPLE_PRESETS, type SamplePreset } from "@/data/presets";

interface CaptureStepProps {
  readonly scanning: SamplePreset | null;
  readonly nonCan: SamplePreset | null;
  readonly onPick: (preset: SamplePreset) => void;
  readonly onRetake: () => void;
  readonly onPostAnyway: () => void;
}

function ScanView({ preset }: { readonly preset: SamplePreset }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-volt/40">
      <CanPhoto
        scene={preset.scene}
        color={preset.canColor}
        accent="#0A0B0E"
        className="aspect-[4/3] w-full"
      />
      <div className="absolute inset-x-0 h-0.5 animate-scan bg-volt shadow-[0_0_16px_4px_rgba(149,214,0,0.6)]" />
      <div className="absolute inset-4 rounded-xl border-2 border-dashed border-volt/50" />
      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-void/80 px-3 py-1 text-xs font-semibold text-volt backdrop-blur">
        Identifying can...
      </p>
    </div>
  );
}

function NonCanWarning({
  preset,
  onRetake,
  onPostAnyway,
}: {
  readonly preset: SamplePreset;
  readonly onRetake: () => void;
  readonly onPostAnyway: () => void;
}) {
  return (
    <div className="flex animate-pop-in flex-col gap-4">
      <CanPhoto
        scene={preset.scene}
        color={preset.canColor}
        accent="#0A0B0E"
        className="aspect-[4/3] w-full rounded-2xl"
      />
      <div className="flex gap-3 rounded-2xl border border-status-unverified/40 bg-status-unverified/10 p-4">
        <AlertTriangle className="h-5 w-5 shrink-0 text-status-unverified" />
        <div>
          <p className="font-semibold text-ink">We couldn&apos;t find a can in this photo</p>
          <p className="mt-1 text-xs text-ink-muted">
            Posting anyway marks it as an Unverified Can, and your Club can Call BS on it.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="btn-primary !text-base" onClick={onRetake}>
          <RotateCcw className="h-4 w-4" /> Retake
        </button>
        <button type="button" className="btn-ghost" onClick={onPostAnyway}>
          Post Anyway
        </button>
      </div>
    </div>
  );
}

export function CaptureStep({
  scanning,
  nonCan,
  onPick,
  onRetake,
  onPostAnyway,
}: CaptureStepProps) {
  if (scanning !== null) return <ScanView preset={scanning} />;
  if (nonCan !== null)
    return <NonCanWarning preset={nonCan} onRetake={onRetake} onPostAnyway={onPostAnyway} />;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-hairline p-4 text-sm text-ink-muted">
        <Camera className="h-5 w-5 text-volt" />
        Snap your can. For this demo, pick a sample photo below.
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SAMPLE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick(p)}
            className="card press overflow-hidden text-left transition-colors hover:border-volt/50"
          >
            <CanPhoto
              scene={p.scene}
              color={p.canColor}
              accent="#0A0B0E"
              className="aspect-square w-full"
            />
            <div className="p-2.5">
              <p className="truncate text-xs font-semibold">{p.title}</p>
              <p className="text-[11px] text-ink-faint">{p.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
