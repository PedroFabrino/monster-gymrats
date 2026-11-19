"use client";

import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { CheckIn, Comment, Member } from "@/types/domain";
import { Avatar } from "@/components/ui/Avatar";
import { CanPhoto } from "@/components/ui/CanArt";
import { FlavorPill } from "@/components/ui/FlavorPill";
import { Sheet } from "@/components/ui/Sheet";
import { formatRelative } from "@/domain/time";
import type { AppState } from "@/state/app-state";
import { useAppState } from "@/state/AppStateProvider";
import { flavorById, memberById } from "@/state/selectors";
import { ReactionBar } from "./ReactionBar";

function CommentComposer({ onSubmit }: { readonly onSubmit: (body: string) => void }) {
  const [body, setBody] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (body.trim() === "") return;
    onSubmit(body);
    setBody("");
  };
  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment..."
        aria-label="Comment"
        className="input flex-1"
      />
      <button
        type="submit"
        disabled={body.trim() === ""}
        aria-label="Post comment"
        className="press rounded-xl bg-volt p-3 text-void disabled:opacity-30"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}

function CommentPreview({ checkIn }: { readonly checkIn: CheckIn }) {
  const flavor = flavorById(checkIn.flavorId);
  return (
    <div className="flex gap-3 rounded-2xl border border-hairline bg-carbon p-2">
      <CanPhoto
        scene={checkIn.scene}
        color={flavor?.color ?? "#A3E635"}
        accent={flavor?.accent ?? "#0A0B0E"}
        className="h-24 w-24 shrink-0 rounded-xl"
        voided={checkIn.status === "voided"}
      />
      <div className="flex min-w-0 flex-col justify-center gap-2">
        {flavor !== undefined ? (
          <FlavorPill flavor={flavor} size="sm" />
        ) : (
          <span className="text-sm text-series-reserve">
            {checkIn.requestedFlavorName ?? "Unknown flavor"}
          </span>
        )}
        {checkIn.caption !== "" && (
          <p className="line-clamp-2 text-xs text-ink-muted">{checkIn.caption}</p>
        )}
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  author,
  nowIso,
}: {
  readonly comment: Comment;
  readonly author: Member | undefined;
  readonly nowIso: string;
}) {
  return (
    <li className="flex animate-pop-in gap-2.5">
      {author !== undefined && <Avatar member={author} size="sm" />}
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-carbon px-3 py-2">
        <p className="text-xs font-semibold">
          {author?.displayName ?? "Member"}{" "}
          <span className="metric font-normal text-ink-faint">
            • {formatRelative(comment.postedAt, nowIso)}
          </span>
        </p>
        <p className="text-sm text-ink">{comment.body}</p>
      </div>
    </li>
  );
}

function CommentsList({
  comments,
  state,
}: {
  readonly comments: readonly Comment[];
  readonly state: AppState;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {comments.map((c) => (
        <CommentRow
          key={c.id}
          comment={c}
          author={memberById(state, c.memberId)}
          nowIso={state.nowIso}
        />
      ))}
      {comments.length === 0 && (
        <p className="py-6 text-center text-sm text-ink-muted">
          No comments yet. Start the thread.
        </p>
      )}
    </ul>
  );
}

export function CommentsSheet({
  checkInId,
  onClose,
}: {
  readonly checkInId: string;
  readonly onClose: () => void;
}) {
  const { state, dispatch } = useAppState();
  const checkIn = state.checkIns.find((c) => c.id === checkInId);
  if (checkIn === undefined) return null;
  const author = memberById(state, checkIn.memberId);
  return (
    <Sheet
      title="Comments"
      subtitle={`${author?.displayName ?? "Someone"}'s Check-In`}
      onClose={onClose}
      footer={
        <CommentComposer onSubmit={(body) => dispatch({ type: "add_comment", checkInId, body })} />
      }
      tall
    >
      <div className="flex flex-col gap-4">
        <CommentPreview checkIn={checkIn} />
        <ReactionBar checkIn={checkIn} />
        <CommentsList comments={checkIn.comments} state={state} />
      </div>
    </Sheet>
  );
}
