import { create } from "zustand";

interface AlarmStore {
  isRinging: boolean;
  taskId: string | null;
  taskTitle: string | null;

  startAlarm: (taskId: string, taskTitle: string) => void;
  stopAlarm: () => void;
  snoozeAlarm: (minutes: number) => void;
}

export const useAlarmStore = create<AlarmStore>((set) => ({
  isRinging: false,
  taskId: null,
  taskTitle: null,

  startAlarm: (taskId, taskTitle) =>
    set({
      isRinging: true,
      taskId,
      taskTitle,
    }),

  stopAlarm: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new Event("dayflow-stop-alarm")
      );
    }

    set({
      isRinging: false,
      taskId: null,
      taskTitle: null,
    });
  },

  snoozeAlarm: (minutes) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("dayflow-snooze-alarm", {
          detail: { minutes },
        })
      );
    }

    set({
      isRinging: false,
    });
  },
}));