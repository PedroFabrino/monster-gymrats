"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ClubView } from "@/components/clubs/ClubView";
import { useAppState } from "@/state/AppStateProvider";

export default function ClubPage() {
  const params = useParams<{ id: string }>();
  const { state } = useAppState();
  const club = state.clubs.find((c) => c.id === params.id);
  if (club === undefined) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 pt-32 text-center">
        <h1 className="font-display text-3xl font-extrabold uppercase">Club not found</h1>
        <p className="text-sm text-ink-muted">
          This Club may have been renamed or the link is wrong.
        </p>
        <Link href="/clubs" className="btn-primary">
          Back to Clubs
        </Link>
      </div>
    );
  }
  return <ClubView key={club.id} club={club} />;
}
