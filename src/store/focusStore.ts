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
  selectedTaskTitle: string | null;
  sessionStartedAt: string | null;
  sessionHistory: FocusSession[];

  start: () => void;
  pause: () => void;
  reset: () => void;
  setMode: (mode: FocusMode) => void;
  setTestDuration: (seconds: number) => void;
  setSelectedTask: (
    taskId: string | null,
    taskTitle?: string | null
  ) => void;
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
      selectedTaskTitle: null,

      sessionStartedAt: null,
      sessionHistory: [],

      start: () => {
        set((state) => ({
          isRunning: true,

          sessionStartedAt:
            state.mode === "focus"
              ? state.sessionStartedAt ??
                new Date().toISOString()
              : null,
        }));
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
          sessionStartedAt: null,
        }));
      },

      setMode: (mode) => {
        set({
          mode,
          remainingSeconds:
            MODE_DURATION[mode],
          isRunning: false,
          sessionStartedAt: null,
        });
      },

      setTestDuration: (seconds) => {
        set({
          remainingSeconds: seconds,
          isRunning: false,
          sessionStartedAt: null,
        });
      },

      setSelectedTask: (
        taskId,
        taskTitle = null
      ) => {
        set({
          selectedTaskId: taskId,
          selectedTaskTitle:
            taskId ? taskTitle ?? null : null,
        });
      },

      completeSession: () => {
        set((state) => {
          const completedAt =
            new Date().toISOString();

          if (state.mode === "focus") {
            const nextSession =
              state.completedSessions + 1;

            const startedAt =
              state.sessionStartedAt ??
              completedAt;

            const elapsedSeconds = Math.max(
              1,
              Math.round(
                (new Date(completedAt).getTime() -
                  new Date(startedAt).getTime()) /
                  1000
              )
            );

            const session: FocusSession = {
              id: crypto.randomUUID(),
              taskId: state.selectedTaskId,
              taskTitle: state.selectedTaskTitle,
              mode: "focus",
              durationSeconds:
                elapsedSeconds,
              startedAt,
              completedAt,
            };

            const nextMode =
              nextSession % 4 === 0
                ? "longBreak"
                : "shortBreak";

            return {
              completedSessions:
                nextSession,

              mode: nextMode,

              remainingSeconds:
                MODE_DURATION[nextMode],

              isRunning: false,

              sessionStartedAt: null,

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
            sessionStartedAt: null,
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