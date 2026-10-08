import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AlarmStatus =
  | "ringing"
  | "snoozed"
  | "stopped";

export interface AlarmHistoryItem {
  id: string;
  taskId: string;
  taskTitle: string;
  status: AlarmStatus;
  triggeredAt: string;
  stoppedAt?: string;
  snoozedUntil?: string;
}

interface AlarmStore {
  isRinging: boolean;
  taskId: string | null;
  taskTitle: string | null;

  status: "idle" | AlarmStatus;
  triggeredAt: string | null;
  stoppedAt: string | null;
  snoozedUntil: string | null;

  history: AlarmHistoryItem[];

  startAlarm: (
    taskId: string,
    taskTitle: string
  ) => void;

  stopAlarm: () => void;

  snoozeAlarm: (
    minutes: number
  ) => void;

  clearHistory: () => void;
}

export const useAlarmStore = create<AlarmStore>()(
  persist(
    (set, get) => ({
      isRinging: false,
      taskId: null,
      taskTitle: null,

      status: "idle",
      triggeredAt: null,
      stoppedAt: null,
      snoozedUntil: null,

      history: [],

      startAlarm: (taskId, taskTitle) => {
        const now = new Date().toISOString();

        set({
          isRinging: true,
          taskId,
          taskTitle,
          status: "ringing",
          triggeredAt: now,
          stoppedAt: null,
          snoozedUntil: null,
        });
      },

      stopAlarm: () => {
        const state = get();

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new Event("dayflow-stop-alarm")
          );
        }

        if (state.taskId && state.taskTitle) {
          const historyItem: AlarmHistoryItem = {
            id: crypto.randomUUID(),
            taskId: state.taskId,
            taskTitle: state.taskTitle,
            status: "stopped",
            triggeredAt:
              state.triggeredAt ??
              new Date().toISOString(),
            stoppedAt: new Date().toISOString(),
          };

          set({
            isRinging: false,
            status: "stopped",
            stoppedAt: historyItem.stoppedAt,
            history: [
              historyItem,
              ...state.history,
            ],
          });
        } else {
          set({
            isRinging: false,
            status: "stopped",
            stoppedAt: new Date().toISOString(),
          });
        }
      },

      snoozeAlarm: (minutes) => {
        const state = get();

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
          Date.now() +
            minutes * 60 * 1000
        ).toISOString();

        if (state.taskId && state.taskTitle) {
          const historyItem: AlarmHistoryItem = {
            id: crypto.randomUUID(),
            taskId: state.taskId,
            taskTitle: state.taskTitle,
            status: "snoozed",
            triggeredAt:
              state.triggeredAt ??
              new Date().toISOString(),
            snoozedUntil,
          };

          set({
            isRinging: false,
            status: "snoozed",
            snoozedUntil,
            history: [
              historyItem,
              ...state.history,
            ],
          });
        } else {
          set({
            isRinging: false,
            status: "snoozed",
            snoozedUntil,
          });
        }
      },

      clearHistory: () => {
        set({
          history: [],
        });
      },
    }),
    {
      name: "dayflow-alarm-store",
    }
  )
);