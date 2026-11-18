"use client";

import { Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Club } from "@/types/domain";
import { CanPhoto } from "@/components/ui/CanArt";
import { ChipRow } from "@/components/ui/Controls";
import { useAppState } from "@/state/AppStateProvider";
import { useUi } from "@/state/UiProvider";
import { clubFeed, flavorById, memberById, type FeedItem } from "@/state/selectors";
import { CheckInCard } from "./CheckInCard";
import { ChatBubble, SystemEvent } from "./FeedEvents";

type Filter = "all" | "check_ins" | "media";
const PAGE = 20;

const FILTERS: readonly { readonly value: Filter; readonly label: string }[] = [
  { value: "all", label: "All Activity" },
  { value: "check_ins", label: "Check-Ins Only" },
  { value: "media", label: "Media Gallery" },
];

function MediaGallery({ items }: { readonly items: readonly FeedItem[] }) {
  const { openSheet } = useUi();
  const photos = items.flatMap((i) => (i.kind === "check_in" ? [i.checkIn] : [])).toReversed();
  return (
    <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-2xl">
      {photos.slice(0, 60).map((c) => {
        const flavor = flavorById(c.flavorId);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => openSheet({ kind: "comments", checkInId: c.id })}
            className="press"
            aria-label={`Open ${flavor?.name ?? "Check-In"}`}
          >
            <CanPhoto
              scene={c.scene}
              color={flavor?.color ?? "#A3E635"}
              accent={flavor?.accent ?? "#0A0B0E"}
              className="aspect-square w-full"
              voided={c.status === "voided"}
            />
          </button>
        );
      })}
    </div>
  );
}

function ChatInput({ club }: { readonly club: Club }) {
  const { dispatch } = useAppState();
  const [body, setBody] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (body.trim() === "") return;
    dispatch({ type: "send_chat", clubId: club.id, body });
    setBody("");
  };
  return (
    <form
      onSubmit={submit}
      className="sticky bottom-[84px] z-10 mx-4 mt-4 flex items-center gap-2 rounded-2xl border border-hairline bg-graphite/95 p-1.5 shadow-2xl backdrop-blur"
    >
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Message ${club.name}...`}
        aria-label="Chat message"
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
      />
      <button
        type="submit"
        disabled={body.trim() === ""}
        aria-label="Send"
        className="press rounded-xl bg-volt p-2.5 text-void disabled:opacity-30"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}

function FeedRow({ item, club }: { readonly item: FeedItem; readonly club: Club }) {
  const { state } = useAppState();
  if (item.kind === "check_in") return <CheckInCard checkIn={item.checkIn} club={club} />;
  if (item.kind === "system") return <SystemEvent body={item.body} />;
  return (
    <ChatBubble
      author={memberById(state, item.memberId)}
      body={item.body}
      postedAt={item.postedAt}
      nowIso={state.nowIso}
    />
  );
}

export function TimelineTab({ club }: { readonly club: Club }) {
  const { state } = useAppState();
  const [filter, setFilter] = useState<Filter>("all");
  const [limit, setLimit] = useState(PAGE);
  const endRef = useRef<HTMLDivElement>(null);
  const feed = useMemo(() => clubFeed(state, club.id), [state, club.id]);
  const filtered = filter === "check_ins" ? feed.filter((i) => i.kind === "check_in") : feed;
  const visible = filtered.slice(-limit);
  const lastId = feed.at(-1)?.id;

  useEffect(() => {
    if (filter !== "media") endRef.current?.scrollIntoView({ block: "end" });
  }, [lastId, filter]);

  return (
    <div className="pt-3">
      <div className="px-4">
        <ChipRow options={FILTERS} value={filter} onChange={setFilter} />
      </div>
      <div className="mt-4 px-4">
        {filter === "media" ? (
          <MediaGallery items={feed} />
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.length > limit && (
              <button
                type="button"
                className="btn-ghost self-center !py-2 text-xs"
                onClick={() => setLimit((l) => l + PAGE)}
              >
                Show earlier activity
              </button>
            )}
            {visible.map((item) => (
              <FeedRow key={item.id} item={item} club={club} />
            ))}
            {visible.length === 0 && (
              <p className="py-12 text-center text-sm text-ink-muted">
                No activity yet. Post the first Check-In!
              </p>
            )}
          </div>
        )}
        <div ref={endRef} />
      </div>
      {filter !== "media" && <ChatInput club={club} />}
    </div>
  );
}
