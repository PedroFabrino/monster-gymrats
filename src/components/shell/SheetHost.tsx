"use client";

import { useUi } from "@/state/UiProvider";
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

export function SheetHost() {
  const { sheet, closeSheet } = useUi();
  if (sheet === null) return null;
  switch (sheet.kind) {
    case "check_in":
      return <CheckInFlow onClose={closeSheet} />;
    case "flavor":
      return (
        <FlavorDetailSheet flavorId={sheet.flavorId} clubId={sheet.clubId} onClose={closeSheet} />
      );
    case "install":
      return <InstallGuideSheet onClose={closeSheet} />;
    case "profile":
      return <ProfileSheet onClose={closeSheet} />;
    case "wrapped":
      return <WrappedSheet onClose={closeSheet} />;
    case "comments":
      return <CommentsSheet checkInId={sheet.checkInId} onClose={closeSheet} />;
    case "dispute":
      return <DisputeSheet checkInId={sheet.checkInId} onClose={closeSheet} />;
    case "challenge":
      return <ChallengeDetailSheet challengeId={sheet.challengeId} onClose={closeSheet} />;
    case "create_challenge":
      return <CreateChallengeSheet clubId={sheet.clubId} onClose={closeSheet} />;
    case "notifications":
      return <NotificationsSheet onClose={closeSheet} />;
    case "create_club":
      return <CreateClubSheet onClose={closeSheet} />;
    case "join_club":
      return <JoinClubSheet onClose={closeSheet} />;
  }
}
