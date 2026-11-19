"use client";

import { ArrowBigUp, Check, Clock, X } from "lucide-react";
import type { FlavorRequest, FlavorRequestStatus } from "@/types/domain";
import { SERIES_ACCENT } from "@/data/flavors";
import { ME_ID } from "@/data/mock-data";
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

function UpvoteButton({
  name,
  count,
  voted,
  disabled,
  onUpvote,
}: {
  readonly name: string;
  readonly count: number;
  readonly voted: boolean;
  readonly disabled: boolean;
  readonly onUpvote: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={voted}
      aria-label={`Upvote ${name}`}
      onClick={onUpvote}
      className={`press flex w-12 shrink-0 flex-col items-center rounded-xl border py-1.5 disabled:opacity-50 ${voted ? "border-volt bg-volt/10 text-volt" : "border-hairline text-ink-muted"}`}
    >
      <ArrowBigUp className={`h-5 w-5 ${voted ? "fill-volt" : ""}`} />
      <span className="metric text-xs font-bold">{count}</span>
    </button>
  );
}

function RequestRow({
  request,
  authorName,
  nowIso,
  onUpvote,
}: {
  readonly request: FlavorRequest;
  readonly authorName: string;
  readonly nowIso: string;
  readonly onUpvote: () => void;
}) {
  const status = STATUS_STYLE[request.status];
  const Icon = status.icon;
  return (
    <article className="card flex items-center gap-3 p-3">
      <UpvoteButton
        name={request.name}
        count={request.upvoterIds.length}
        voted={request.upvoterIds.includes(ME_ID)}
        disabled={request.status !== "pending"}
        onUpvote={onUpvote}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{request.name}</p>
        <p className="text-xs text-ink-faint">
          <span style={{ color: SERIES_ACCENT[request.series] }}>{request.series}</span> • by{" "}
          {authorName} • {formatRelative(request.submittedAt, nowIso)} ago
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
}

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
      {requests.map((r) => (
        <RequestRow
          key={r.id}
          request={r}
          authorName={memberById(state, r.submittedBy)?.displayName ?? "someone"}
          nowIso={state.nowIso}
          onUpvote={() => dispatch({ type: "upvote_request", requestId: r.id })}
        />
      ))}
    </div>
  );
}
