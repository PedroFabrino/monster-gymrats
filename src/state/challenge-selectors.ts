import type { Challenge, RivalEntry } from "@/types/domain";
import { RIVAL_CLUBS, RIVAL_PLAYERS } from "@/data/social-seed";
import { ME_ID } from "@/data/mock-data";
import {
  challengeStandings,
  clubVsClub,
  type ClubStanding,
  type ClubVsClubMode,
} from "@/domain/scoring";
import type { AppState } from "./app-state";
import { challengeCheckIns, memberById, myClubs } from "./selectors";

export interface StandingRow {
  readonly id: string;
  readonly name: string;
  readonly points: number;
  readonly cappedOut: number;
  readonly memberId: string | null;
}

function participantIds(state: AppState, challenge: Challenge): readonly string[] {
  if (challenge.scope === "club") {
    return state.clubs.find((c) => c.id === challenge.clubId)?.memberIds ?? [];
  }
  const ids = new Set(challengeCheckIns(state, challenge.id).map((c) => c.memberId));
  if (challenge.joined) ids.add(ME_ID);
  return [...ids];
}

export function individualRows(state: AppState, challenge: Challenge): readonly StandingRow[] {
  const scores = challengeStandings(
    challenge,
    challengeCheckIns(state, challenge.id),
    participantIds(state, challenge),
  );
  const local: StandingRow[] = scores.map((s) => ({
    id: s.memberId,
    name: memberById(state, s.memberId)?.displayName ?? "Member",
    points: s.points,
    cappedOut: s.cappedOut,
    memberId: s.memberId,
  }));
  const rivals: StandingRow[] =
    challenge.scope === "community"
      ? RIVAL_PLAYERS.map((p) => ({
          id: p.id,
          name: p.name,
          points: p.points,
          cappedOut: 0,
          memberId: null,
        }))
      : [];
  return [...local, ...rivals].toSorted((a, b) => b.points - a.points);
}

export function clubRows(
  state: AppState,
  challenge: Challenge,
  mode: ClubVsClubMode,
): readonly ClubStanding[] {
  const checkIns = challengeCheckIns(state, challenge.id);
  const mine: RivalEntry[] = myClubs(state).map((club) => ({
    id: club.id,
    name: club.name,
    members: club.memberIds.length,
    points: challengeStandings(challenge, checkIns, club.memberIds).reduce(
      (sum, s) => sum + s.points,
      0,
    ),
  }));
  return clubVsClub([...mine, ...RIVAL_CLUBS], mode);
}
