"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  notificationsEnabled: boolean;
  alarmSoundEnabled: boolean;
  defaultSnoozeMinutes: number;
  defaultFocusMinutes: number;

  setNotificationsEnabled: (
    enabled: boolean
  ) => void;

  setAlarmSoundEnabled: (
    enabled: boolean
  ) => void;

  setDefaultSnoozeMinutes: (
    minutes: number
  ) => void;

  setDefaultFocusMinutes: (
    minutes: number
  ) => void;
}

export const useSettingsStore =
  create<SettingsStore>()(
    persist(
      (set) => ({
        notificationsEnabled: true,
        alarmSoundEnabled: true,
        defaultSnoozeMinutes: 5,
        defaultFocusMinutes: 25,

        setNotificationsEnabled: (enabled) =>
          set({
            notificationsEnabled: enabled,
          }),

        setAlarmSoundEnabled: (enabled) =>
          set({
            alarmSoundEnabled: enabled,
          }),

        setDefaultSnoozeMinutes: (minutes) =>
          set({
            defaultSnoozeMinutes: minutes,
          }),

        setDefaultFocusMinutes: (minutes) =>
          set({
            defaultFocusMinutes: minutes,
          }),
      }),
      {
        name: "dayflow-settings",
      }
    )
  );