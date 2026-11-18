"use client";

import { Bell, Check, Chrome, MoreVertical, Plus, Share, SmartphoneNfc } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Segmented } from "@/components/ui/Controls";
import { Sheet } from "@/components/ui/Sheet";

type Platform = "ios" | "android" | "standalone";

const PLATFORMS: readonly { readonly value: Platform; readonly label: string }[] = [
  { value: "ios", label: "iOS Safari" },
  { value: "android", label: "Android Chrome" },
  { value: "standalone", label: "Installed" },
];

interface Step {
  readonly icon: ReactNode;
  readonly title: string;
  readonly body: string;
}

const STEPS: Readonly<Record<Platform, readonly Step[]>> = {
  ios: [
    {
      icon: <Share className="h-4 w-4" />,
      title: "Tap Share",
      body: "The square-with-arrow button in Safari's bottom bar.",
    },
    {
      icon: <SmartphoneNfc className="h-4 w-4" />,
      title: "Scroll the share sheet",
      body: "Swipe up past your apps to see more actions.",
    },
    {
      icon: <Plus className="h-4 w-4" />,
      title: "Add to Home Screen",
      body: "Tap it, then tap Add. Monster Rats lands on your home screen.",
    },
    {
      icon: <Bell className="h-4 w-4" />,
      title: "Enable Push",
      body: "Open the app from your home screen and allow notifications.",
    },
  ],
  android: [
    {
      icon: <MoreVertical className="h-4 w-4" />,
      title: "Open the Chrome menu",
      body: "Tap the three dots in the top-right corner.",
    },
    {
      icon: <Chrome className="h-4 w-4" />,
      title: "Scroll to Install app",
      body: "It may say Add to Home Screen on some phones.",
    },
    {
      icon: <Plus className="h-4 w-4" />,
      title: "Add to Home Screen",
      body: "Confirm Install. The icon appears with your other apps.",
    },
    {
      icon: <Bell className="h-4 w-4" />,
      title: "Enable Push",
      body: "Launch it and allow notifications when asked.",
    },
  ],
  standalone: [
    {
      icon: <Check className="h-4 w-4" />,
      title: "You're installed",
      body: "You're running Monster Rats as a full-screen app.",
    },
    {
      icon: <Bell className="h-4 w-4" />,
      title: "Enable Push",
      body: "Turn on alerts in Profile so you never miss a Check-In or a Call BS.",
    },
  ],
};

export function InstallGuideSheet({ onClose }: { readonly onClose: () => void }) {
  const [platform, setPlatform] = useState<Platform>("ios");
  return (
    <Sheet
      title="Install Guide"
      subtitle="Add Monster Rats to your home screen"
      onClose={onClose}
      footer={
        <button type="button" className="btn-primary w-full" onClick={onClose}>
          Got it
        </button>
      }
    >
      <Segmented options={PLATFORMS} value={platform} onChange={setPlatform} />
      <ol className="mt-5 flex flex-col gap-3">
        {STEPS[platform].map((s, i) => (
          <li
            key={`${platform}-${s.title}`}
            className="animate-fade-in flex gap-3 rounded-2xl bg-carbon p-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-volt/15 text-volt">
              {s.icon}
            </span>
            <div>
              <p className="text-sm font-semibold">
                <span className="metric mr-1.5 text-ink-faint">{i + 1}.</span>
                {s.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Sheet>
  );
}
