"use client";

import { ArrowBigUp, Check, Clock, X } from "lucide-react";
import type { FlavorRequestStatus } from "@/types/domain";
import { ME_ID } from "@/data/mock-data";
import { SERIES_ACCENT } from "@/data/flavors";
import { formatRelative } from "@/domain/time";
import { useAppState } from "@/state/AppStateProvider";
import { memberById } from "@/state/selectors";

const STATUS_STYLE: Readonly<
  Record<
    FlavorRequestStatus,
    { readonly label: string; readonly cls: string; readonly icon: typeof Clock }
  >
> = {
  pending: {
    label: "In review",
    cls: "text-status-unverified bg-status-unverified/10",
    icon: Clock,
  },
  merged: { label: "Added to Dex", cls: "text-status-verified bg-status-verified/10", icon: Check },
  rejected: { label: "Rejected", cls: "text-status-dispute bg-status-dispute/10", icon: X },
};

export function FlavorRequestsList() {
  const { state, dispatch } = useAppState();
  const requests = state.flavorRequests.toSorted((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt),
  );
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-muted">
        Spotted a flavor the catalog is missing? Requests are reviewed, then merged into
        everyone&apos;s Flavor Dex. Pending Check-Ins upgrade automatically.
      </p>
      {requests.map((r) => {
        const status = STATUS_STYLE[r.status];
        const Icon = status.icon;
        const voted = r.upvoterIds.includes(ME_ID);
        return (
          <article key={r.id} className="card flex items-center gap-3 p-3">
            <button
              type="button"
              disabled={r.status !== "pending"}
              aria-pressed={voted}
              aria-label={`Upvote ${r.name}`}
              onClick={() => dispatch({ type: "upvote_request", requestId: r.id })}
              className={`press flex w-12 shrink-0 flex-col items-center rounded-xl border py-1.5 disabled:opacity-50 ${voted ? "border-volt bg-volt/10 text-volt" : "border-hairline text-ink-muted"}`}
            >
              <ArrowBigUp className={`h-5 w-5 ${voted ? "fill-volt" : ""}`} />
              <span className="metric text-xs font-bold">{r.upvoterIds.length}</span>
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{r.name}</p>
              <p className="text-xs text-ink-faint">
                <span style={{ color: SERIES_ACCENT[r.series] }}>{r.series}</span> • by{" "}
                {memberById(state, r.submittedBy)?.displayName ?? "someone"} •{" "}
                {formatRelative(r.submittedAt, state.nowIso)} ago
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${status.cls}`}
            >
              <Icon className="h-3 w-3" />
              {status.label}
            </span>
          </article>
        );
      })}
    </div>
  );
}
