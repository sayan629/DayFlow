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

  stopAlarm: () => void;

  stopAlarmWithoutAdvancing: () => void;

  snoozeAlarm: (minutes: number) => void;

  clearHistory: () => Promise<void>;
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

      set({
        queue: [
          ...state.queue,
          {
            taskId,
            taskTitle,
          },
        ],
      });
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

      return nextAlarm;
    },

    clearQueue: () => {
      set({
        queue: [],
      });
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