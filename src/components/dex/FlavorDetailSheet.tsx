"use client";

import { Crown, Globe2, Sparkles, User, Users } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import type { TimeWindow } from "@/types/domain";
import { CanArt } from "@/components/ui/CanArt";
import { Segmented, StarRating } from "@/components/ui/Controls";
import { Sheet } from "@/components/ui/Sheet";
import { FLAVORS, SERIES_ACCENT } from "@/data/flavors";
import { HOME_CLUB_ID, ME_ID } from "@/data/mock-data";
import { clubDex, personalDex } from "@/domain/dex";
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
  const [window, setWindow] = useState<TimeWindow>("all");
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
  const rank = globalRank(FLAVORS, flavorId, window);
  if (flavor === undefined) return null;
  const accent = SERIES_ACCENT[flavor.series];
  const unlocked = mine !== undefined || clubEntry !== undefined;
  const discoverer =
    clubEntry === undefined ? undefined : memberById(state, clubEntry.firstDiscovererId);
  const champion = clubEntry === undefined ? undefined : memberById(state, clubEntry.championId);

  return (
    <Sheet
      title={unlocked ? flavor.name : "Locked Flavor"}
      subtitle={`${flavor.series} Series`}
      onClose={onClose}
      tall
    >
      <div className="flex flex-col gap-4">
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
        <Section icon={<User className="h-3.5 w-3.5" />} title="You">
          {mine === undefined ? (
            <p className="text-sm text-ink-muted">Not in your Dex yet. Log one to unlock it.</p>
          ) : (
            <div className="flex items-end justify-between">
              <Stat label="Your Check-Ins" value={`x${mine.count}`} />
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-ink-faint">
                  Avg rating {mine.avgRating.toFixed(1)}
                </p>
                <StarRating value={Math.round(mine.avgRating)} size="sm" />
              </div>
            </div>
          )}
        </Section>
        <Section icon={<Users className="h-3.5 w-3.5" />} title={club?.name ?? "Club"}>
          {clubEntry === undefined ? (
            <p className="text-sm text-ink-muted">
              Nobody in this Club has found it yet. Be the first discoverer.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Club cans" value={clubEntry.count} />
              <Stat
                label="First found"
                value={
                  <span className="flex items-center gap-1 font-sans text-sm">
                    <Sparkles className="h-3.5 w-3.5 text-volt" />
                    {discoverer?.displayName}
                  </span>
                }
              />
              <Stat
                label="Champion"
                value={
                  <span className="flex items-center gap-1 font-sans text-sm">
                    <Crown className="h-3.5 w-3.5 fill-series-rehab text-series-rehab" />
                    {champion?.displayName} ({clubEntry.championCount})
                  </span>
                }
              />
            </div>
          )}
        </Section>
        <Section icon={<Globe2 className="h-3.5 w-3.5" />} title="Global">
          <Segmented options={WINDOWS} value={window} onChange={setWindow} />
          {rank !== null && (
            <div className="mt-4 flex items-end justify-between">
              <Stat label="Global cans" value={rank.count.toLocaleString("en-US")} />
              <p className="font-display text-4xl font-extrabold leading-none text-volt">
                #{rank.rank}
              </p>
            </div>
          )}
        </Section>
      </div>
    </Sheet>
  );
}
