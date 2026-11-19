"use client";

import { Crown, Globe2, Sparkles, User, Users } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import type { Club, Flavor, Member, TimeWindow } from "@/types/domain";
import { CanArt } from "@/components/ui/CanArt";
import { Segmented, StarRating } from "@/components/ui/Controls";
import { Sheet } from "@/components/ui/Sheet";
import { FLAVORS, SERIES_ACCENT } from "@/data/flavors";
import { HOME_CLUB_ID, ME_ID } from "@/data/mock-data";
import { clubDex, personalDex, type ClubDexEntry, type PersonalDexEntry } from "@/domain/dex";
import { globalRank } from "@/domain/stats";
import { TIME_WINDOW_LABEL } from "@/domain/time";
import { useAppState } from "@/state/AppStateProvider";
import { clubCheckIns, flavorById, memberById } from "@/state/selectors";

const WINDOWS: readonly { readonly value: TimeWindow; readonly label: string }[] = (
  ["all", "year", "month", "week"] as const
).map((w) => ({ value: w, label: TIME_WINDOW_LABEL[w] }));

function Section({
  icon,
  title,
  children,
}: {
  readonly icon: ReactNode;
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-hairline bg-carbon p-4">
      <h3 className="eyebrow mb-3 flex items-center gap-1.5">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function Stat({ label, value }: { readonly label: string; readonly value: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-ink-faint">{label}</p>
      <div className="metric mt-0.5 text-lg font-bold text-ink">{value}</div>
    </div>
  );
}

function HeroSpecs({
  flavor,
  accent,
  unlocked,
}: {
  readonly flavor: Flavor;
  readonly accent: string;
  readonly unlocked: boolean;
}) {
  return (
    <div
      className="relative flex items-center gap-5 overflow-hidden rounded-2xl border p-4"
      style={{
        borderColor: `${accent}55`,
        background: `radial-gradient(80% 90% at 20% 50%, ${flavor.color}22, transparent)`,
      }}
    >
      <CanArt
        color={flavor.color}
        accent={flavor.accent}
        locked={!unlocked}
        className="h-32 shrink-0 drop-shadow-2xl"
      />
      <div className="grid flex-1 grid-cols-2 gap-3">
        <Stat label="Volume" value={`${flavor.volumeMl}ml`} />
        <Stat label="Caffeine" value={`${flavor.caffeineMg}mg`} />
        <Stat label="Sugar" value={`${flavor.sugarG}g`} />
        <Stat label="Series" value={<span style={{ color: accent }}>{flavor.series}</span>} />
      </div>
    </div>
  );
}

function PersonalSection({ entry }: { readonly entry: PersonalDexEntry | undefined }) {
  return (
    <Section icon={<User className="h-3.5 w-3.5" />} title="You">
      {entry === undefined ? (
        <p className="text-sm text-ink-muted">Not in your Dex yet. Log one to unlock it.</p>
      ) : (
        <div className="flex items-end justify-between">
          <Stat label="Your Check-Ins" value={`x${entry.count}`} />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-ink-faint">
              Avg rating {entry.avgRating.toFixed(1)}
            </p>
            <StarRating value={Math.round(entry.avgRating)} size="sm" />
          </div>
        </div>
      )}
    </Section>
  );
}

function ClubStatValue({ icon, text }: { readonly icon: ReactNode; readonly text: string }) {
  return (
    <span className="flex items-center gap-1 font-sans text-sm">
      {icon}
      {text}
    </span>
  );
}

function ClubStatsGrid({
  entry,
  discoverer,
  champion,
}: {
  readonly entry: ClubDexEntry;
  readonly discoverer: Member | undefined;
  readonly champion: Member | undefined;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Stat label="Club cans" value={entry.count} />
      <Stat
        label="First found"
        value={
          <ClubStatValue
            icon={<Sparkles className="h-3.5 w-3.5 text-volt" />}
            text={discoverer?.displayName ?? ""}
          />
        }
      />
      <Stat
        label="Champion"
        value={
          <ClubStatValue
            icon={<Crown className="h-3.5 w-3.5 fill-series-rehab text-series-rehab" />}
            text={`${champion?.displayName ?? ""} (${entry.championCount})`}
          />
        }
      />
    </div>
  );
}

function ClubSection({
  club,
  entry,
  discoverer,
  champion,
}: {
  readonly club: Club | undefined;
  readonly entry: ClubDexEntry | undefined;
  readonly discoverer: Member | undefined;
  readonly champion: Member | undefined;
}) {
  return (
    <Section icon={<Users className="h-3.5 w-3.5" />} title={club?.name ?? "Club"}>
      {entry === undefined ? (
        <p className="text-sm text-ink-muted">
          Nobody in this Club has found it yet. Be the first discoverer.
        </p>
      ) : (
        <ClubStatsGrid entry={entry} discoverer={discoverer} champion={champion} />
      )}
    </Section>
  );
}

function GlobalSection({
  flavorId,
  window,
  onWindow,
}: {
  readonly flavorId: string;
  readonly window: TimeWindow;
  readonly onWindow: (w: TimeWindow) => void;
}) {
  const { state } = useAppState();
  const rank = globalRank(FLAVORS, flavorId, {
    window,
    checkIns: state.checkIns,
    baselineIds: state.baselineIds,
    nowIso: state.nowIso,
  });
  return (
    <Section icon={<Globe2 className="h-3.5 w-3.5" />} title="Global">
      <Segmented options={WINDOWS} value={window} onChange={onWindow} />
      {rank !== null && (
        <div className="mt-4 flex items-end justify-between">
          <Stat label="Global cans" value={rank.count.toLocaleString("en-US")} />
          <p className="font-display text-4xl font-extrabold leading-none text-volt">
            #{rank.rank}
          </p>
        </div>
      )}
    </Section>
  );
}

function FlavorDetailBody({
  flavor,
  club,
  mine,
  clubEntry,
}: {
  readonly flavor: Flavor;
  readonly club: Club | undefined;
  readonly mine: PersonalDexEntry | undefined;
  readonly clubEntry: ClubDexEntry | undefined;
}) {
  const { state } = useAppState();
  const [window, setWindow] = useState<TimeWindow>("all");
  const accent = SERIES_ACCENT[flavor.series];
  return (
    <div className="flex flex-col gap-4">
      <HeroSpecs
        flavor={flavor}
        accent={accent}
        unlocked={mine !== undefined || clubEntry !== undefined}
      />
      <PersonalSection entry={mine} />
      <ClubSection
        club={club}
        entry={clubEntry}
        discoverer={clubEntry && memberById(state, clubEntry.firstDiscovererId)}
        champion={clubEntry && memberById(state, clubEntry.championId)}
      />
      <GlobalSection flavorId={flavor.id} window={window} onWindow={setWindow} />
    </div>
  );
}

export function FlavorDetailSheet({
  flavorId,
  clubId,
  onClose,
}: {
  readonly flavorId: string;
  readonly clubId: string | null;
  readonly onClose: () => void;
}) {
  const { state } = useAppState();
  const flavor = flavorById(flavorId);
  const club = state.clubs.find((c) => c.id === (clubId ?? HOME_CLUB_ID));
  const mine = useMemo(
    () => personalDex(state.checkIns, ME_ID).get(flavorId),
    [state.checkIns, flavorId],
  );
  const clubEntry = useMemo(
    () => (club === undefined ? undefined : clubDex(clubCheckIns(state, club.id)).get(flavorId)),
    [state, club, flavorId],
  );
  if (flavor === undefined) return null;
  const title = mine !== undefined || clubEntry !== undefined ? flavor.name : "Locked Flavor";
  return (
    <Sheet title={title} subtitle={`${flavor.series} Series`} onClose={onClose} tall>
      <FlavorDetailBody flavor={flavor} club={club} mine={mine} clubEntry={clubEntry} />
    </Sheet>
  );
}
