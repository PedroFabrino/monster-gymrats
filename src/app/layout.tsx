import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { AppStateProvider } from "@/state/AppStateProvider";
import { UiProvider } from "@/state/UiProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monster GymRats",
  description: "Check in every can, collect every Flavor, and out-drink your Club.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, title: "Monster Rats", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0A0B0E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppStateProvider>
          <UiProvider>
            <AppShell>{children}</AppShell>
          </UiProvider>
        </AppStateProvider>
      </body>
    </html>
  );
}
