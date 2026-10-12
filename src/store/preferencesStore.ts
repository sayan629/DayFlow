"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type StreakMode = "activity" | "tasks" | "focus";

interface PreferencesStore {
  streakMode: StreakMode;
  setStreakMode: (mode: StreakMode) => void;
}

export const usePreferencesStore =
  create<PreferencesStore>()(
    persist(
      (set) => ({
        streakMode: "activity",

        setStreakMode: (mode) =>
          set({
            streakMode: mode,
          }),
      }),
      {
        name: "dayflow-preferences",
      }
    )
  );