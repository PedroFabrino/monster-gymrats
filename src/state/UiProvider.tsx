"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type SheetRoute =
  | { readonly kind: "check_in" }
  | { readonly kind: "flavor"; readonly flavorId: string; readonly clubId: string | null }
  | { readonly kind: "install" }
  | { readonly kind: "profile" }
  | { readonly kind: "wrapped" }
  | { readonly kind: "comments"; readonly checkInId: string }
  | { readonly kind: "dispute"; readonly checkInId: string }
  | { readonly kind: "challenge"; readonly challengeId: string }
  | { readonly kind: "create_challenge"; readonly clubId: string | null }
  | { readonly kind: "notifications" }
  | { readonly kind: "create_club" }
  | { readonly kind: "join_club" };

interface Toast {
  readonly id: number;
  readonly message: string;
}

interface UiStore {
  readonly sheet: SheetRoute | null;
  readonly toast: Toast | null;
  readonly openSheet: (route: SheetRoute) => void;
  readonly closeSheet: () => void;
  readonly showToast: (message: string) => void;
}

const TOAST_MS = 2400;
const UiContext = createContext<UiStore | null>(null);

export function UiProvider({ children }: { readonly children: ReactNode }) {
  const [sheet, setSheet] = useState<SheetRoute | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToast({ id, message });
    window.setTimeout(() => setToast((t) => (t?.id === id ? null : t)), TOAST_MS);
  }, []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const store = useMemo(
    () => ({ sheet, toast, openSheet: setSheet, closeSheet, showToast }),
    [sheet, toast, closeSheet, showToast],
  );
  return <UiContext.Provider value={store}>{children}</UiContext.Provider>;
}

export function useUi(): UiStore {
  const store = useContext(UiContext);
  if (store === null) throw new Error("useUi must be used inside UiProvider");
  return store;
}
