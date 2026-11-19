"use client";

import { Download, Share2 } from "lucide-react";
import { useState } from "react";
import type { NotificationKind, NotificationPrefs } from "@/types/domain";
import { FlairFields } from "@/components/onboarding/FlairFields";
import { Toggle } from "@/components/ui/Controls";
import { Sheet } from "@/components/ui/Sheet";
import { useAppState } from "@/state/AppStateProvider";
import { useMe } from "@/state/hooks";
import { useUi } from "@/state/UiProvider";

const PUSH_LABELS: readonly { readonly kind: NotificationKind; readonly label: string }[] = [
  { kind: "check_in", label: "New Club Check-In" },
  { kind: "dispute", label: "Call BS Dispute" },
  { kind: "reaction", label: "Reactions & Comments" },
  { kind: "mention", label: "Club Chat @mentions" },
  { kind: "recap", label: "Challenge Recaps" },
];

function PushPrefsList({
  prefs,
  onToggle,
}: {
  readonly prefs: NotificationPrefs;
  readonly onToggle: (kind: NotificationKind) => void;
}) {
  return (
    <section>
      <h3 className="eyebrow mb-2">Push notifications</h3>
      <ul className="flex flex-col gap-1.5">
        {PUSH_LABELS.map((p) => (
          <li
            key={p.kind}
            className="flex items-center justify-between rounded-xl bg-carbon px-3 py-3 text-sm"
          >
            {p.label}
            <Toggle checked={prefs[p.kind]} onChange={() => onToggle(p.kind)} label={p.label} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProfileQuickLinks({
  onInstall,
  onWrapped,
}: {
  readonly onInstall: () => void;
  readonly onWrapped: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button type="button" className="btn-ghost" onClick={onInstall}>
        <Download className="h-4 w-4 text-series-ultra" /> Install Guide
      </button>
      <button type="button" className="btn-ghost" onClick={onWrapped}>
        <Share2 className="h-4 w-4 text-volt" /> Wrapped Card
      </button>
    </div>
  );
}

function SaveProfileButton({
  disabled,
  onSave,
}: {
  readonly disabled: boolean;
  readonly onSave: () => void;
}) {
  return (
    <button type="button" className="btn-primary w-full" disabled={disabled} onClick={onSave}>
      Save Profile
    </button>
  );
}

export function ProfileSheet({ onClose }: { readonly onClose: () => void }) {
  const { state, dispatch } = useAppState();
  const { openSheet, showToast } = useUi();
  const member = useMe();
  const [profile, setProfile] = useState({
    displayName: member.displayName,
    avatarColor: member.avatarColor,
    signatureFlavorId: member.signatureFlavorId,
  });
  const save = () => {
    dispatch({
      type: "update_profile",
      profile: { ...profile, displayName: profile.displayName.trim() },
    });
    showToast("Profile saved");
    onClose();
  };
  return (
    <Sheet
      title="Profile"
      subtitle={`@${member.handle}`}
      onClose={onClose}
      footer={<SaveProfileButton disabled={profile.displayName.trim() === ""} onSave={save} />}
      tall
    >
      <div className="flex flex-col gap-6">
        <FlairFields value={profile} onChange={setProfile} />
        <PushPrefsList
          prefs={state.notificationPrefs}
          onToggle={(kind) => dispatch({ type: "toggle_notification_pref", kind })}
        />
        <ProfileQuickLinks
          onInstall={() => openSheet({ kind: "install" })}
          onWrapped={() => openSheet({ kind: "wrapped" })}
        />
      </div>
    </Sheet>
  );
}
