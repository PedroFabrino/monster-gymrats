"use client";

import { Bell, Flame } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useAppState } from "@/state/AppStateProvider";
import { useMe, useStreak } from "@/state/hooks";
import { useUi } from "@/state/UiProvider";

export function Wordmark() {
  return (
    <span className="flex items-center gap-1.5 font-display text-2xl font-extrabold uppercase leading-none tracking-tight">
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path
          d="M6 3 L7 11 L5.5 13 L7.5 21 M12 2 L13 10 L11.5 12 L13.5 22 M18 3 L19 11 L17.5 13 L19.5 21"
          stroke="#95D600"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span>Monster</span>
      <span className="text-volt">Rats</span>
    </span>
  );
}

export function StreakPill() {
  const { current } = useStreak();
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-volt/30 bg-volt/10 px-2.5 py-1 text-volt">
      <Flame className="h-4 w-4 fill-volt/40" />
      <span className="metric text-xs font-bold">{current}d</span>
    </span>
  );
}

function TopBarActions({
  unread,
  onNotifications,
  onProfile,
}: {
  readonly unread: number;
  readonly onNotifications: () => void;
  readonly onProfile: () => void;
}) {
  const member = useMe();
  return (
    <div className="flex items-center gap-2">
      <StreakPill />
      <button
        type="button"
        aria-label={`Notifications, ${unread} unread`}
        onClick={onNotifications}
        className="press relative rounded-full bg-carbon p-2 text-ink-muted hover:text-ink"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="metric absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-dispute px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      <button type="button" aria-label="Profile & Settings" className="press" onClick={onProfile}>
        <Avatar member={member} size="sm" />
      </button>
    </div>
  );
}

export function TopBar({
  title,
  children,
}: {
  readonly title?: string;
  readonly children?: ReactNode;
}) {
  const { state } = useAppState();
  const { openSheet } = useUi();
  const unread = state.notifications.filter((n) => !n.read).length;
  return (
    <header className="sticky top-0 z-20 border-b border-hairline/60 bg-void/85 px-4 pb-3 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        {title === undefined ? (
          <Wordmark />
        ) : (
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight">{title}</h1>
        )}
        <TopBarActions
          unread={unread}
          onNotifications={() => openSheet({ kind: "notifications" })}
          onProfile={() => openSheet({ kind: "profile" })}
        />
      </div>
      {children}
    </header>
  );
}
