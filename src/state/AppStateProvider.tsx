"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { AppAction, AppState } from "./app-state";
import { createInitialState } from "./app-state";
import { appReducer } from "./reducer";

interface AppStore {
  readonly state: AppState;
  readonly dispatch: (action: AppAction) => void;
}

const AppStateContext = createContext<AppStore | null>(null);

export function AppStateProvider({ children }: { readonly children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState);
  const store = useMemo(() => ({ state, dispatch }), [state]);
  return <AppStateContext.Provider value={store}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStore {
  const store = useContext(AppStateContext);
  if (store === null) throw new Error("useAppState must be used inside AppStateProvider");
  return store;
}
