"use client";

import { Sparkles } from "lucide-react";
import type { Member } from "@/types/domain";
import { Avatar } from "@/components/ui/Avatar";
import { ME_ID } from "@/data/mock-data";
import { formatRelative } from "@/domain/time";

export function ChatBubble({
  author,
  body,
  postedAt,
  nowIso,
}: {
  readonly author: Member | undefined;
  readonly body: string;
  readonly postedAt: string;
  readonly nowIso: string;
}) {
  const mine = author?.id === ME_ID;
  return (
    <div className={`flex animate-pop-in items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
      {author !== undefined && !mine && <Avatar member={author} size="xs" />}
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2 ${mine ? "rounded-br-md bg-volt text-void" : "rounded-bl-md bg-graphite text-ink"}`}
      >
        {!mine && (
          <p className="text-[11px] font-semibold" style={{ color: author?.avatarColor }}>
            {author?.displayName}
          </p>
        )}
        <p className="text-sm">{body}</p>
        <p className={`metric mt-0.5 text-[10px] ${mine ? "text-void/60" : "text-ink-faint"}`}>
          {formatRelative(postedAt, nowIso)}
        </p>
      </div>
    </div>
  );
}

export function SystemEvent({ body }: { readonly body: string }) {
  return (
    <div className="flex animate-pop-in justify-center">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-volt/30 bg-volt/[0.08] px-3 py-1.5 text-xs font-medium text-volt">
        <Sparkles className="h-3.5 w-3.5" />
        {body}
      </span>
    </div>
  );
}
