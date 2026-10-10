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

export interface TaskFocusStats {
  taskId: string;
  taskTitle: string;
  sessions: number;
  totalSeconds: number;
  lastFocusedAt: string | null;
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

const MODE_DURATION: Record<
  FocusMode,
  number
> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

/**
 * Get focus statistics for a specific task.
 */
export function getTaskFocusStats(
  sessionHistory: FocusSession[],
  taskId: string
): TaskFocusStats | null {
  const taskSessions =
    sessionHistory.filter(
      (session) =>
        session.mode === "focus" &&
        session.taskId === taskId
    );

  if (taskSessions.length === 0) {
    return null;
  }

  const totalSeconds =
    taskSessions.reduce(
      (total, session) =>
        total + session.durationSeconds,
      0
    );

  const latestSession =
    taskSessions.reduce(
      (latest, session) => {
        if (!latest) {
          return session;
        }

        return new Date(
          session.completedAt
        ).getTime() >
          new Date(
            latest.completedAt
          ).getTime()
          ? session
          : latest;
      },
      null as FocusSession | null
    );

  return {
    taskId,

    taskTitle:
      taskSessions[0].taskTitle ??
      "Focus Session",

    sessions: taskSessions.length,

    totalSeconds,

    lastFocusedAt:
      latestSession?.completedAt ??
      null,
  };
}

export const useFocusStore =
  create<FocusStore>()(
    persist(
      (set) => ({
        // ------------------------------------------
        // Initial state
        // ------------------------------------------

        mode: "focus",

        remainingSeconds:
          MODE_DURATION.focus,

        isRunning: false,

        completedSessions: 0,

        selectedTaskId: null,

        selectedTaskTitle: null,

        sessionStartedAt: null,

        sessionHistory: [],

        // ------------------------------------------
        // Start
        // ------------------------------------------

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

        // ------------------------------------------
        // Pause
        // ------------------------------------------

        pause: () => {
          set({
            isRunning: false,
          });
        },

        // ------------------------------------------
        // Reset
        // ------------------------------------------

        reset: () => {
          set((state) => ({
            remainingSeconds:
              MODE_DURATION[state.mode],

            isRunning: false,

            sessionStartedAt: null,
          }));
        },

        // ------------------------------------------
        // Change mode
        // ------------------------------------------

        setMode: (mode) => {
          set({
            mode,

            remainingSeconds:
              MODE_DURATION[mode],

            isRunning: false,

            sessionStartedAt: null,
          });
        },

        // ------------------------------------------
        // Developer test duration
        // ------------------------------------------

        setTestDuration: (seconds) => {
          set({
            remainingSeconds:
              Math.max(1, seconds),

            isRunning: false,

            sessionStartedAt: null,
          });
        },

        // ------------------------------------------
        // Select task
        // ------------------------------------------

        setSelectedTask: (
          taskId,
          taskTitle = null
        ) => {
          set({
            selectedTaskId: taskId,

            selectedTaskTitle: taskId
              ? taskTitle ?? null
              : null,
          });
        },

        // ------------------------------------------
        // Complete session
        // ------------------------------------------

        completeSession: () => {
          set((state) => {
            const completedAt =
              new Date().toISOString();

            // --------------------------------------
            // Focus session completed
            // --------------------------------------

            if (state.mode === "focus") {
              const nextSession =
                state.completedSessions + 1;

              const startedAt =
                state.sessionStartedAt ??
                completedAt;

              const elapsedSeconds =
                Math.max(
                  1,
                  Math.round(
                    (new Date(
                      completedAt
                    ).getTime() -
                      new Date(
                        startedAt
                      ).getTime()) /
                      1000
                  )
                );

              const session: FocusSession = {
                id: crypto.randomUUID(),

                taskId:
                  state.selectedTaskId,

                taskTitle:
                  state.selectedTaskTitle,

                mode: "focus",

                durationSeconds:
                  elapsedSeconds,

                startedAt,

                completedAt,
              };

              // Every 4th focus session
              // gives a long break.
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

            // --------------------------------------
            // Break completed
            // --------------------------------------
            // Return to focus mode.

            return {
              mode: "focus",

              remainingSeconds:
                MODE_DURATION.focus,

              isRunning: false,

              sessionStartedAt: null,
            };
          });
        },

        // ------------------------------------------
        // Clear history
        // ------------------------------------------

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