import { create } from "zustand";

interface AlarmStore {
  isRinging: boolean;
  taskId: string | null;
  taskTitle: string | null;

  startAlarm: (taskId: string, taskTitle: string) => void;
  stopAlarm: () => void;
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

  stopAlarm: () =>
    set({
      isRinging: false,
      taskId: null,
      taskTitle: null,
    }),
}));