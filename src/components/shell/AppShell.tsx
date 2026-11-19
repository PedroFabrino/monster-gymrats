"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useUi } from "@/state/UiProvider";
import { BottomNav } from "./BottomNav";
import { DesktopPanel } from "./DesktopPanel";
import { SheetHost } from "./SheetHost";

function Toaster() {
  const { toast } = useUi();
  if (toast === null) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        key={toast.id}
        role="status"
        className="animate-toast-in rounded-full border border-volt/40 bg-graphite px-4 py-2 text-sm font-medium text-ink shadow-xl"
      >
        {toast.message}
      </div>
    </div>
  );
}

export function AppShell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  const [framed, setFramed] = useState(true);
  const showNav = !pathname.startsWith("/join");
  const frameCls = framed
    ? "sm:my-6 sm:h-[min(920px,calc(100dvh-48px))] sm:rounded-[48px] sm:border-[10px] sm:border-[#1A1D24] sm:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8),0_0_0_1px_#2A2F3A]"
    : "sm:border-x sm:border-hairline";

  return (
    <div className="claw-bg flex min-h-[100dvh] items-center justify-center gap-16">
      <DesktopPanel framed={framed} onToggleFrame={() => setFramed((f) => !f)} />
      <div
        className={`relative h-[100dvh] w-full max-w-[430px] overflow-hidden bg-void ${frameCls}`}
      >
        <main className={`no-scrollbar h-full overflow-y-auto ${showNav ? "pb-28" : ""}`}>
          {children}
        </main>
        {showNav && <BottomNav />}
        <SheetHost />
        <Toaster />
      </div>
    </div>
  );
}
