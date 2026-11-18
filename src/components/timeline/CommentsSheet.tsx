"use client";

import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { CanPhoto } from "@/components/ui/CanArt";
import { FlavorPill } from "@/components/ui/FlavorPill";
import { Sheet } from "@/components/ui/Sheet";
import { formatRelative } from "@/domain/time";
import { useAppState } from "@/state/AppStateProvider";
import { flavorById, memberById } from "@/state/selectors";
import { ReactionBar } from "./ReactionBar";

export function CommentsSheet({
  checkInId,
  onClose,
}: {
  readonly checkInId: string;
  readonly onClose: () => void;
}) {
  const { state, dispatch } = useAppState();
  const [body, setBody] = useState("");
  const checkIn = state.checkIns.find((c) => c.id === checkInId);
  if (checkIn === undefined) return null;
  const author = memberById(state, checkIn.memberId);
  const flavor = flavorById(checkIn.flavorId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (body.trim() === "") return;
    dispatch({ type: "add_comment", checkInId, body });
    setBody("");
  };

  const footer = (
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

  return (
    <Sheet
      title="Comments"
      subtitle={`${author?.displayName ?? "Someone"}'s Check-In`}
      onClose={onClose}
      footer={footer}
      tall
    >
      <div className="flex flex-col gap-4">
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
        <ReactionBar checkIn={checkIn} />
        <ul className="flex flex-col gap-3">
          {checkIn.comments.map((c) => {
            const m = memberById(state, c.memberId);
            return (
              <li key={c.id} className="flex animate-pop-in gap-2.5">
                {m !== undefined && <Avatar member={m} size="sm" />}
                <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-carbon px-3 py-2">
                  <p className="text-xs font-semibold">
                    {m?.displayName ?? "Member"}{" "}
                    <span className="metric font-normal text-ink-faint">
                      • {formatRelative(c.postedAt, state.nowIso)}
                    </span>
                  </p>
                  <p className="text-sm text-ink">{c.body}</p>
                </div>
              </li>
            );
          })}
          {checkIn.comments.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-muted">
              No comments yet. Start the trash talk.
            </p>
          )}
        </ul>
      </div>
    </Sheet>
  );
}
