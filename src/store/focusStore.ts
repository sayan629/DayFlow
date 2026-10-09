import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FocusMode =
  | "focus"
  | "shortBreak"
  | "longBreak";

export interface FocusSession {
  id: string;
  taskId: string | null;
  taskTitle: string | null;
  mode: FocusMode;
  durationSeconds: number;
  startedAt: string;
  completedAt: string;
}

interface FocusStore {
  mode: FocusMode;
  remainingSeconds: number;
  isRunning: boolean;
  completedSessions: number;
  selectedTaskId: string | null;
  sessionHistory: FocusSession[];

  start: () => void;
  pause: () => void;
  reset: () => void;
  setMode: (mode: FocusMode) => void;
  setTestDuration: (seconds: number) => void;
  setSelectedTask: (taskId: string | null) => void;
  completeSession: () => void;
  clearSessionHistory: () => void;
}

const MODE_DURATION: Record<FocusMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const useFocusStore = create<FocusStore>()(
  persist(
    (set) => ({
      mode: "focus",
      remainingSeconds: MODE_DURATION.focus,
      isRunning: false,
      completedSessions: 0,
      selectedTaskId: null,
      sessionHistory: [],

      start: () => {
        set({
          isRunning: true,
        });
      },

      pause: () => {
        set({
          isRunning: false,
        });
      },

      reset: () => {
        set((state) => ({
          remainingSeconds:
            MODE_DURATION[state.mode],
          isRunning: false,
        }));
      },

      setMode: (mode) => {
        set({
          mode,
          remainingSeconds:
            MODE_DURATION[mode],
          isRunning: false,
        });
      },

      setTestDuration: (seconds) => {
        set({
          remainingSeconds: seconds,
          isRunning: false,
        });
      },

      setSelectedTask: (taskId) => {
        set({
          selectedTaskId: taskId,
        });
      },

      completeSession: () => {
        set((state) => {
          const completedAt =
            new Date().toISOString();

          if (state.mode === "focus") {
            const nextSession =
              state.completedSessions + 1;

            const session: FocusSession = {
              id: crypto.randomUUID(),
              taskId: state.selectedTaskId,
              taskTitle: null,
              mode: state.mode,
              durationSeconds:
                MODE_DURATION.focus,
              startedAt: completedAt,
              completedAt,
            };

            const nextMode =
              nextSession % 4 === 0
                ? "longBreak"
                : "shortBreak";

            return {
              completedSessions: nextSession,
              mode: nextMode,
              remainingSeconds:
                MODE_DURATION[nextMode],
              isRunning: false,
              sessionHistory: [
                session,
                ...state.sessionHistory,
              ],
            };
          }

          return {
            mode: "focus",
            remainingSeconds:
              MODE_DURATION.focus,
            isRunning: false,
          };
        });
      },

      clearSessionHistory: () => {
        set({
          sessionHistory: [],
        });
      },
    }),
    {
      name: "dayflow-focus",
    }
  )
);