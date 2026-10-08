import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FocusMode =
  | "focus"
  | "shortBreak"
  | "longBreak";

interface FocusStore {
  mode: FocusMode;
  remainingSeconds: number;
  isRunning: boolean;
  completedSessions: number;

  start: () => void;
  pause: () => void;
  reset: () => void;
  setMode: (mode: FocusMode) => void;
  completeSession: () => void;
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

      completeSession: () => {
        set((state) => {
          if (state.mode === "focus") {
            const nextSession =
              state.completedSessions + 1;

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
    }),
    {
      name: "dayflow-focus",
    }
  )
);