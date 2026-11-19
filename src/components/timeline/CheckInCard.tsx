"use client";

import type { CheckIn, Club, Flavor, Member } from "@/types/domain";
import { Avatar } from "@/components/ui/Avatar";
import { BadgeChip } from "@/components/ui/BadgeChip";
import { CanPhoto } from "@/components/ui/CanArt";
import { StarRating } from "@/components/ui/Controls";
import { FlavorPill } from "@/components/ui/FlavorPill";
import { formatPrice } from "@/domain/check-in";
import { formatRelative, hoursBetween } from "@/domain/time";
import { useAppState } from "@/state/AppStateProvider";
import { flavorById, memberById } from "@/state/selectors";
import { DisputeCard } from "./DisputeCard";
import { ReactionBar } from "./ReactionBar";

const PENDING_COLOR = "#A3E635";

function hasAnyBadge(checkIn: CheckIn): boolean {
  return (
    checkIn.retroactive ||
    checkIn.brand !== "monster" ||
    checkIn.unverified ||
    checkIn.status !== "verified" ||
    checkIn.dispute?.status === "open"
  );
}

function CheckInBadges({ checkIn }: { readonly checkIn: CheckIn }) {
  const retroHours = Math.round(hoursBetween(checkIn.consumedAt, checkIn.postedAt));
  return (
    <div className="flex flex-wrap gap-1.5">
      {checkIn.retroactive && <BadgeChip kind="retro">Retroactive • {retroHours}h ago</BadgeChip>}
      {checkIn.brand !== "monster" && (
        <BadgeChip kind="offbrand">Off-Brand / Traitor Can</BadgeChip>
      )}
      {checkIn.status === "pending_flavor" && <BadgeChip kind="pending">Pending Flavor</BadgeChip>}
      {checkIn.unverified && <BadgeChip kind="unverified">Unverified Can</BadgeChip>}
      {checkIn.dispute?.status === "open" && <BadgeChip kind="disputed">BS Disputed</BadgeChip>}
      {checkIn.status === "voided" && <BadgeChip kind="voided">Voided</BadgeChip>}
    </div>
  );
}

function CheckInHeader({
  author,
  flair,
  postedAt,
  nowIso,
  rating,
}: {
  readonly author: Member | undefined;
  readonly flair: Flavor | undefined;
  readonly postedAt: string;
  readonly nowIso: string;
  readonly rating: number;
}) {
  return (
    <header className="flex items-center gap-3 p-3">
      {author !== undefined && <Avatar member={author} size="sm" />}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          {author?.displayName ?? "Unknown"}
          {flair !== undefined && (
            <span
              className="truncate rounded px-1.5 py-px text-[10px] font-medium"
              style={{ color: flair.accent, background: `${flair.accent}18` }}
            >
              {flair.name}
            </span>
          )}
        </p>
        <p className="metric text-[11px] text-ink-faint">{formatRelative(postedAt, nowIso)} ago</p>
      </div>
      <StarRating value={rating} size="sm" />
    </header>
  );
}

function CheckInPhotoFrame({
  checkIn,
  flavor,
}: {
  readonly checkIn: CheckIn;
  readonly flavor: Flavor | undefined;
}) {
  const price = formatPrice(checkIn.priceCents);
  return (
    <div className="relative">
      <CanPhoto
        scene={checkIn.scene}
        color={flavor?.color ?? PENDING_COLOR}
        accent={flavor?.accent ?? "#0A0B0E"}
        className="aspect-[4/3] w-full"
        voided={checkIn.status === "voided"}
      />
      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
        {flavor !== undefined ? (
          <FlavorPill flavor={flavor} volumeMl={checkIn.volumeMl} />
        ) : (
          <span className="rounded-full border border-series-reserve/50 bg-void/80 px-3 py-1.5 text-xs font-medium text-series-reserve backdrop-blur">
            {checkIn.requestedFlavorName ?? "Unknown flavor"} • Flavor Request
          </span>
        )}
        {price !== null && (
          <span className="metric rounded-full bg-void/80 px-2.5 py-1.5 text-xs text-ink backdrop-blur">
            {price}
          </span>
        )}
      </div>
    </div>
  );
}

export function CheckInCard({
  checkIn,
  club,
}: {
  readonly checkIn: CheckIn;
  readonly club: Club | null;
}) {
  const { state } = useAppState();
  const author = memberById(state, checkIn.memberId);
  const flavor = flavorById(checkIn.flavorId);
  const flair = author === undefined ? undefined : flavorById(author.signatureFlavorId);
  return (
    <article
      className={`card overflow-hidden animate-pop-in ${checkIn.status === "voided" ? "opacity-70" : ""}`}
    >
      <CheckInHeader
        author={author}
        flair={flair}
        postedAt={checkIn.postedAt}
        nowIso={state.nowIso}
        rating={checkIn.rating}
      />
      <CheckInPhotoFrame checkIn={checkIn} flavor={flavor} />
      <div className="flex flex-col gap-3 p-3">
        {hasAnyBadge(checkIn) && <CheckInBadges checkIn={checkIn} />}
        {checkIn.caption !== "" && <p className="text-sm text-ink">{checkIn.caption}</p>}
        {checkIn.dispute !== null && <DisputeCard checkIn={checkIn} club={club} />}
        <ReactionBar checkIn={checkIn} />
      </div>
    </article>
  );
}
