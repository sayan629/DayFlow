"use client";

import { create } from "zustand";

export type AlarmStatus =
  | "ringing"
  | "snoozed"
  | "stopped";

export interface AlarmHistoryItem {
  id: string;
  taskId: string | null;
  taskTitle: string;
  status: AlarmStatus;
  triggeredAt: string;
  stoppedAt?: string;
  snoozedUntil?: string;
}

export interface QueuedAlarm {
  taskId: string;
  taskTitle: string;
}

interface AlarmStore {
  isRinging: boolean;
  taskId: string | null;
  taskTitle: string | null;
  status: "idle" | AlarmStatus;
  triggeredAt: string | null;
  stoppedAt: string | null;
  snoozedUntil: string | null;

  queue: QueuedAlarm[];

  history: AlarmHistoryItem[];
  historyLoaded: boolean;

  loadHistory: () => Promise<void>;

  recoverAlarm: (
    taskId: string,
    taskTitle: string,
    triggeredAt: string
  ) => void;

  startAlarm: (
    taskId: string,
    taskTitle: string
  ) => void;

  enqueueAlarm: (
    taskId: string,
    taskTitle: string
  ) => void;

  dequeueAlarm: () => QueuedAlarm | null;

  clearQueue: () => void;

  restoreQueue: () => void;

  stopAlarm: () => void;

  stopAlarmWithoutAdvancing: () => void;

  snoozeAlarm: (minutes: number) => void;

  clearHistory: () => Promise<void>;
}

const ALARM_QUEUE_STORAGE_KEY =
  "dayflow-alarm-queue";

/**
 * Persist alarm queue.
 */
function saveQueue(queue: QueuedAlarm[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      ALARM_QUEUE_STORAGE_KEY,
      JSON.stringify(queue)
    );
  } catch (error) {
    console.error(
      "Failed to persist alarm queue:",
      error
    );
  }
}

/**
 * Load persisted alarm queue safely.
 */
function loadStoredQueue(): QueuedAlarm[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedQueue =
      localStorage.getItem(
        ALARM_QUEUE_STORAGE_KEY
      );

    if (!storedQueue) {
      return [];
    }

    const parsedQueue = JSON.parse(
      storedQueue
    );

    if (!Array.isArray(parsedQueue)) {
      return [];
    }

    return parsedQueue.filter(
      (alarm): alarm is QueuedAlarm =>
        typeof alarm === "object" &&
        alarm !== null &&
        typeof alarm.taskId === "string" &&
        typeof alarm.taskTitle === "string"
    );
  } catch (error) {
    console.error(
      "Failed to restore alarm queue:",
      error
    );

    return [];
  }
}

/**
 * Clear persisted queue.
 */
function clearStoredQueue() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(
      ALARM_QUEUE_STORAGE_KEY
    );
  } catch (error) {
    console.error(
      "Failed to clear persisted alarm queue:",
      error
    );
  }
}

/**
 * Save alarm history to backend.
 */
async function saveAlarmHistory(
  historyItem: AlarmHistoryItem
) {
  try {
    const response = await fetch(
      "/api/alarm-history",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(historyItem),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to save alarm history"
      );
    }
  } catch (error) {
    console.error(
      "Failed to save alarm history:",
      error
    );
  }
}

export const useAlarmStore = create<AlarmStore>(
  (set, get) => ({
    isRinging: false,
    taskId: null,
    taskTitle: null,
    status: "idle",
    triggeredAt: null,
    stoppedAt: null,
    snoozedUntil: null,

    queue: [],

    history: [],
    historyLoaded: false,

    /**
     * Load alarm history.
     */
    loadHistory: async () => {
      try {
        const response = await fetch(
          "/api/alarm-history"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load alarm history"
          );
        }

        const history: AlarmHistoryItem[] =
          await response.json();

        set({
          history,
          historyLoaded: true,
        });
      } catch (error) {
        console.error(
          "Failed to load alarm history:",
          error
        );
      }
    },

    /**
     * Restore queue after refresh/restart.
     *
     * Duplicate task IDs are removed while
     * preserving FIFO order.
     */
    restoreQueue: () => {
      const storedQueue =
        loadStoredQueue();

      if (storedQueue.length === 0) {
        return;
      }

      const uniqueQueue =
        storedQueue.filter(
          (alarm, index, queue) =>
            queue.findIndex(
              (item) =>
                item.taskId ===
                alarm.taskId
            ) === index
        );

      set({
        queue: uniqueQueue,
      });

      saveQueue(uniqueQueue);
    },

    /**
     * Recover an already ringing alarm.
     */
    recoverAlarm: (
      taskId,
      taskTitle,
      triggeredAt
    ) => {
      set({
        isRinging: true,
        taskId,
        taskTitle,
        status: "ringing",
        triggeredAt,
        stoppedAt: null,
        snoozedUntil: null,
      });
    },

    /**
     * Start a new alarm.
     */
    startAlarm: (
      taskId,
      taskTitle
    ) => {
      const now =
        new Date().toISOString();

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

    /**
     * Add an alarm to FIFO queue.
     *
     * Prevents:
     * - duplicate queue entries
     * - current alarm being queued again
     */
    enqueueAlarm: (
      taskId,
      taskTitle
    ) => {
      const state = get();

      const alreadyQueued =
        state.queue.some(
          (alarm) =>
            alarm.taskId === taskId
        );

      const isCurrentAlarm =
        state.taskId === taskId;

      if (
        alreadyQueued ||
        isCurrentAlarm
      ) {
        return;
      }

      const updatedQueue = [
        ...state.queue,
        {
          taskId,
          taskTitle,
        },
      ];

      set({
        queue: updatedQueue,
      });

      saveQueue(updatedQueue);
    },

    /**
     * Remove and return first queued alarm.
     */
    dequeueAlarm: () => {
      const state = get();

      if (
        state.queue.length === 0
      ) {
        return null;
      }

      const [
        nextAlarm,
        ...remaining
      ] = state.queue;

      set({
        queue: remaining,
      });

      if (remaining.length === 0) {
        clearStoredQueue();
      } else {
        saveQueue(remaining);
      }

      return nextAlarm;
    },

    /**
     * Clear complete queue.
     */
    clearQueue: () => {
      set({
        queue: [],
      });

      clearStoredQueue();
    },

    /**
     * Stop current alarm and advance queue.
     *
     * IMPORTANT:
     * State is cleared BEFORE the event is dispatched.
     *
     * This prevents:
     *
     * stopAlarm()
     *   -> event
     *   -> handleStopAlarm()
     *   -> stopAlarm()
     *   -> event
     *   -> ...
     *
     * The event listener is now only responsible
     * for audio cleanup and queue advancement.
     */
    stopAlarm: () => {
      const state = get();

      const stoppedAt =
        new Date().toISOString();

      let historyItem:
        | AlarmHistoryItem
        | null = null;

      if (
        state.taskId &&
        state.taskTitle
      ) {
        historyItem = {
          id: crypto.randomUUID(),
          taskId: state.taskId,
          taskTitle: state.taskTitle,
          status: "stopped",
          triggeredAt:
            state.triggeredAt ??
            stoppedAt,
          stoppedAt,
        };
      }

      /**
       * IMPORTANT:
       * Clear state FIRST.
       */
      set({
        isRinging: false,
        taskId: null,
        taskTitle: null,
        status: "stopped",
        stoppedAt,
        snoozedUntil: null,
        ...(historyItem
          ? {
              history: [
                historyItem,
                ...state.history,
              ],
            }
          : {}),
      });

      /**
       * Save history after state update.
       */
      if (historyItem) {
        void saveAlarmHistory(
          historyItem
        );
      }

      /**
       * Notify alarm engine AFTER state is cleared.
       *
       * The engine will:
       * - stop audio
       * - clean snooze timer
       * - advance queue
       */
      if (
        typeof window !== "undefined"
      ) {
        window.dispatchEvent(
          new Event(
            "dayflow-stop-alarm"
          )
        );
      }
    },

    /**
     * Stop current alarm WITHOUT advancing queue.
     *
     * Used by manual stop/focus-style flows.
     */
    stopAlarmWithoutAdvancing: () => {
      const state = get();

      const stoppedAt =
        new Date().toISOString();

      let historyItem:
        | AlarmHistoryItem
        | null = null;

      if (
        state.taskId &&
        state.taskTitle
      ) {
        historyItem = {
          id: crypto.randomUUID(),
          taskId: state.taskId,
          taskTitle: state.taskTitle,
          status: "stopped",
          triggeredAt:
            state.triggeredAt ??
            stoppedAt,
          stoppedAt,
        };
      }

      /**
       * Clear state FIRST.
       */
      set({
        isRinging: false,
        taskId: null,
        taskTitle: null,
        status: "stopped",
        stoppedAt,
        snoozedUntil: null,
        ...(historyItem
          ? {
              history: [
                historyItem,
                ...state.history,
              ],
            }
          : {}),
      });

      if (historyItem) {
        void saveAlarmHistory(
          historyItem
        );
      }

      /**
       * Tell engine not to advance queue.
       */
      if (
        typeof window !== "undefined"
      ) {
        window.dispatchEvent(
          new CustomEvent(
            "dayflow-stop-alarm",
            {
              detail: {
                advanceQueue: false,
              },
            }
          )
        );
      }
    },

    /**
     * Snooze current alarm.
     */
    snoozeAlarm: (minutes) => {
      const state = get();

      if (
        typeof window !== "undefined"
      ) {
        window.dispatchEvent(
          new CustomEvent(
            "dayflow-snooze-alarm",
            {
              detail: { minutes },
            }
          )
        );
      }

      const snoozedUntil =
        new Date(
          Date.now() +
            minutes *
              60 *
              1000
        ).toISOString();

      const taskId =
        state.taskId;

      /**
       * Persist snooze on task.
       */
      if (taskId) {
        void fetch(
          `/api/tasks/${taskId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              snoozedUntil,
            }),
          }
        ).catch((error) => {
          console.error(
            "Failed to persist snooze:",
            error
          );
        });
      }

      if (
        state.taskId &&
        state.taskTitle
      ) {
        const historyItem: AlarmHistoryItem =
          {
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
          taskId: null,
          taskTitle: null,
          status: "snoozed",
          snoozedUntil,
          history: [
            historyItem,
            ...state.history,
          ],
        });

        void saveAlarmHistory(
          historyItem
        );
      } else {
        set({
          isRinging: false,
          taskId: null,
          taskTitle: null,
          status: "snoozed",
          snoozedUntil,
        });
      }
    },

    /**
     * Clear alarm history.
     */
    clearHistory: async () => {
      try {
        const response = await fetch(
          "/api/alarm-history",
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to clear alarm history"
          );
        }

        set({
          history: [],
        });
      } catch (error) {
        console.error(
          "Failed to clear alarm history:",
          error
        );
      }
    },
  })
);