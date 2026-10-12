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

    clearQueue: () => {
      set({
        queue: [],
      });

      clearStoredQueue();
    },

    stopAlarm: () => {
      const state = get();

      const stoppedAt =
        new Date().toISOString();

      if (
        typeof window !==
        "undefined"
      ) {
        window.dispatchEvent(
          new Event(
            "dayflow-stop-alarm"
          )
        );
      }

      if (
        state.taskId &&
        state.taskTitle
      ) {
        const historyItem: AlarmHistoryItem =
          {
            id: crypto.randomUUID(),
            taskId: state.taskId,
            taskTitle:
              state.taskTitle,
            status: "stopped",
            triggeredAt:
              state.triggeredAt ??
              stoppedAt,
            stoppedAt,
          };

        set({
          isRinging: false,
          taskId: null,
          taskTitle: null,
          status: "stopped",
          stoppedAt,
          snoozedUntil: null,
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
          status: "stopped",
          stoppedAt,
          snoozedUntil: null,
        });
      }
    },

    stopAlarmWithoutAdvancing: () => {
      const state = get();

      const stoppedAt =
        new Date().toISOString();

      if (
        typeof window !==
        "undefined"
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

      if (
        state.taskId &&
        state.taskTitle
      ) {
        const historyItem: AlarmHistoryItem =
          {
            id: crypto.randomUUID(),
            taskId: state.taskId,
            taskTitle:
              state.taskTitle,
            status: "stopped",
            triggeredAt:
              state.triggeredAt ??
              stoppedAt,
            stoppedAt,
          };

        set({
          isRinging: false,
          taskId: null,
          taskTitle: null,
          status: "stopped",
          stoppedAt,
          snoozedUntil: null,
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
          status: "stopped",
          stoppedAt,
          snoozedUntil: null,
        });
      }
    },

    snoozeAlarm: (minutes) => {
      const state = get();

      if (
        typeof window !==
        "undefined"
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
            taskTitle:
              state.taskTitle,
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