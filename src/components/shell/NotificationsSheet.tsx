"use client";

import { AtSign, Bell, Gavel, Sparkles, Zap } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import type { NotificationKind } from "@/types/domain";
import { Sheet } from "@/components/ui/Sheet";
import { formatRelative } from "@/domain/time";
import { useAppState } from "@/state/AppStateProvider";

const ICON: Readonly<Record<NotificationKind, ReactNode>> = {
  check_in: <Bell className="h-4 w-4 text-volt" />,
  dispute: <Gavel className="h-4 w-4 text-status-dispute" />,
  reaction: <Zap className="h-4 w-4 text-series-rehab" />,
  mention: <AtSign className="h-4 w-4 text-series-ultra" />,
  recap: <Sparkles className="h-4 w-4 text-series-pipeline" />,
};

export function NotificationsSheet({ onClose }: { readonly onClose: () => void }) {
  const { state, dispatch } = useAppState();
  const items = state.notifications;
  const hasUnread = items.some((n) => !n.read);

  useEffect(() => {
    if (!hasUnread) return;
    const timer = window.setTimeout(() => dispatch({ type: "mark_notifications_read" }), 1200);
    return () => window.clearTimeout(timer);
  }, [hasUnread, dispatch]);

  return (
    <Sheet title="Notifications" subtitle="Club activity, Disputes, and recaps" onClose={onClose}>
      <ul className="flex flex-col gap-2">
        {items.map((n) => (
          <li
            key={n.id}
            className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${n.read ? "border-hairline bg-carbon" : "border-volt/30 bg-volt/5"}`}
          >
            <span className="mt-0.5 rounded-lg bg-void p-2">{ICON[n.kind]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink">{n.body}</p>
              <p className="metric text-[11px] text-ink-faint">
                {formatRelative(n.postedAt, state.nowIso)} ago
              </p>
            </div>
            {!n.read && <span className="mt-2 h-2 w-2 rounded-full bg-volt" />}
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
