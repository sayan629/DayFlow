import { create } from "zustand";

export type AlarmStatus =
  | "idle"
  | "ringing"
  | "snoozed"
  | "stopped";

interface AlarmStore {
  isRinging: boolean;
  taskId: string | null;
  taskTitle: string | null;
  status: AlarmStatus;
  triggeredAt: string | null;
  stoppedAt: string | null;
  snoozedUntil: string | null;

  startAlarm: (
    taskId: string,
    taskTitle: string
  ) => void;

  stopAlarm: () => void;

  snoozeAlarm: (
    minutes: number
  ) => void;
}

export const useAlarmStore =
  create<AlarmStore>((set) => ({
    isRinging: false,
    taskId: null,
    taskTitle: null,
    status: "idle",
    triggeredAt: null,
    stoppedAt: null,
    snoozedUntil: null,

    startAlarm: (taskId, taskTitle) =>
      set({
        isRinging: true,
        taskId,
        taskTitle,
        status: "ringing",
        triggeredAt: new Date().toISOString(),
        stoppedAt: null,
        snoozedUntil: null,
      }),

    stopAlarm: () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new Event("dayflow-stop-alarm")
        );
      }

      set({
        isRinging: false,
        status: "stopped",
        stoppedAt: new Date().toISOString(),
        snoozedUntil: null,
      });
    },

    snoozeAlarm: (minutes) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(
            "dayflow-snooze-alarm",
            {
              detail: { minutes },
            }
          )
        );
      }

      const snoozedUntil = new Date(
        Date.now() + minutes * 60 * 1000
      ).toISOString();

      set({
        isRinging: false,
        status: "snoozed",
        snoozedUntil,
      });
    },
  }));