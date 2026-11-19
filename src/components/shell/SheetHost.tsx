"use client";

import type { ReactElement } from "react";
import { useUi, type SheetRoute } from "@/state/UiProvider";
import { CheckInFlow } from "@/components/checkin/CheckInFlow";
import { ChallengeDetailSheet } from "@/components/challenges/ChallengeDetailSheet";
import { CreateChallengeSheet } from "@/components/challenges/CreateChallengeSheet";
import { CreateClubSheet, JoinClubSheet } from "@/components/clubs/ClubFormSheets";
import { FlavorDetailSheet } from "@/components/dex/FlavorDetailSheet";
import { InstallGuideSheet } from "@/components/onboarding/InstallGuideSheet";
import { ProfileSheet } from "@/components/stats/ProfileSheet";
import { WrappedSheet } from "@/components/stats/WrappedSheet";
import { CommentsSheet } from "@/components/timeline/CommentsSheet";
import { DisputeSheet } from "@/components/timeline/DisputeSheet";
import { NotificationsSheet } from "./NotificationsSheet";

type SheetRendererMap = {
  readonly [K in SheetRoute["kind"]]: (
    route: Extract<SheetRoute, { readonly kind: K }>,
    onClose: () => void,
  ) => ReactElement;
};

const RENDERERS: SheetRendererMap = {
  check_in: (_, onClose) => <CheckInFlow onClose={onClose} />,
  flavor: (s, onClose) => (
    <FlavorDetailSheet flavorId={s.flavorId} clubId={s.clubId} onClose={onClose} />
  ),
  install: (_, onClose) => <InstallGuideSheet onClose={onClose} />,
  profile: (_, onClose) => <ProfileSheet onClose={onClose} />,
  wrapped: (_, onClose) => <WrappedSheet onClose={onClose} />,
  comments: (s, onClose) => <CommentsSheet checkInId={s.checkInId} onClose={onClose} />,
  dispute: (s, onClose) => <DisputeSheet checkInId={s.checkInId} onClose={onClose} />,
  challenge: (s, onClose) => <ChallengeDetailSheet challengeId={s.challengeId} onClose={onClose} />,
  create_challenge: (s, onClose) => <CreateChallengeSheet clubId={s.clubId} onClose={onClose} />,
  notifications: (_, onClose) => <NotificationsSheet onClose={onClose} />,
  create_club: (_, onClose) => <CreateClubSheet onClose={onClose} />,
  join_club: (_, onClose) => <JoinClubSheet onClose={onClose} />,
};

function renderSheet<K extends SheetRoute["kind"]>(
  route: Extract<SheetRoute, { readonly kind: K }>,
  onClose: () => void,
): ReactElement {
  return RENDERERS[route.kind](route, onClose);
}

export function SheetHost() {
  const { sheet, closeSheet } = useUi();
  if (sheet === null) return null;
  return renderSheet(sheet, closeSheet);
}
