"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface SheetProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly tall?: boolean;
}

function SheetHeader({
  title,
  subtitle,
  onClose,
}: {
  readonly title: string;
  readonly subtitle?: string;
  readonly onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-3">
      <div className="min-w-0">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{title}</h2>
        {subtitle !== undefined && <p className="text-sm text-ink-muted">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close sheet"
        className="press rounded-full bg-carbon p-2 text-ink-muted hover:text-ink"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Sheet({ title, subtitle, onClose, children, footer, tall = false }: SheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={`relative flex animate-sheet-up flex-col rounded-t-3xl border-t border-hairline bg-graphite shadow-2xl ${tall ? "h-[92%]" : "max-h-[88%]"}`}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-hairline" />
        <SheetHeader
          title={title}
          {...(subtitle === undefined ? {} : { subtitle })}
          onClose={onClose}
        />
        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">{children}</div>
        {footer !== undefined && (
          <div className="border-t border-hairline bg-graphite px-5 pb-6 pt-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
