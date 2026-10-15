"use client";

import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import { useAlarmStore } from "@/store/alarmStore";
import { useTaskStore } from "@/store/taskStore";
import { useSettingsStore } from "@/store/settingsStore";

export function useAlarmEngine() {
  const tasks = useTaskStore(
    (state) => state.tasks
  );

  const startAlarm = useAlarmStore(
    (state) => state.startAlarm
  );

  const stopAlarm = useAlarmStore(
    (state) => state.stopAlarm
  );

  const enqueueAlarm = useAlarmStore(
    (state) => state.enqueueAlarm
  );

  const dequeueAlarm = useAlarmStore(
    (state) => state.dequeueAlarm
  );

  const restoreQueue = useAlarmStore(
    (state) => state.restoreQueue
  );

  const alarmSoundEnabled = useSettingsStore(
    (state) => state.alarmSoundEnabled
  );

  const notifiedTasks = useRef<Set<string>>(
    new Set()
  );

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const snoozeTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  /**
   * Restore queued alarms after refresh/restart.
   */
  useEffect(() => {
    restoreQueue();
  }, [restoreQueue]);

  /**
   * Request browser notification permission once.
   */
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return;
    }

    if (Notification.permission === "default") {
      Notification.requestPermission().catch(
        (error) => {
          console.warn(
            "Notification permission request failed:",
            error
          );
        }
      );
    }
  }, []);

  /**
   * Create alarm audio.
   */
  useEffect(() => {
    const audio = new Audio(
      "/sounds/alarm.mp3"
    );

    audio.loop = true;
    audio.volume = 0.8;

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;

      if (snoozeTimeoutRef.current) {
        clearTimeout(
          snoozeTimeoutRef.current
        );

        snoozeTimeoutRef.current = null;
      }

      audioRef.current = null;
    };
  }, []);

  /**
   * Play alarm sound.
   */
  const playAlarm = useCallback(() => {
    if (!alarmSoundEnabled) {
      return;
    }

    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = 0;

    audio.play().catch((error) => {
      console.warn(
        "Could not play alarm sound:",
        error
      );
    });
  }, [alarmSoundEnabled]);

  /**
   * Trigger alarm or add it to the Zustand queue.
   */
  const triggerAlarm = useCallback(
    (
      taskId: string,
      taskTitle: string
    ) => {
      const alarmState =
        useAlarmStore.getState();

      if (alarmState.isRinging) {
        enqueueAlarm(
          taskId,
          taskTitle
        );

        return;
      }

      startAlarm(
        taskId,
        taskTitle
      );

      playAlarm();
    },
    [
      enqueueAlarm,
      startAlarm,
      playAlarm,
    ]
  );

  /**
   * Process the next queued alarm.
   *
   * Invalid/stale alarms are skipped when:
   * - task no longer exists
   * - task is completed
   * - alarm is disabled
   *
   * This guarantees:
   * A → B → C
   *
   * even when one of the queued tasks
   * becomes invalid.
   */
  const triggerNextQueuedAlarm =
    useCallback(() => {
      let nextAlarm = dequeueAlarm();

      while (nextAlarm) {
        const currentTask =
          useTaskStore
            .getState()
            .tasks.find(
              (task) =>
                task.id ===
                nextAlarm?.taskId
            );

        /**
         * Task was deleted.
         */
        if (!currentTask) {
          console.log(
            "⏭️ Skipping queued alarm: task no longer exists.",
            nextAlarm.taskTitle
          );

          nextAlarm = dequeueAlarm();
          continue;
        }

        /**
         * Task was completed.
         */
        if (currentTask.completed) {
          console.log(
            "⏭️ Skipping queued alarm: task is completed.",
            currentTask.title
          );

          nextAlarm = dequeueAlarm();
          continue;
        }

        /**
         * Alarm was disabled.
         */
        if (
          currentTask.alarmEnabled === false
        ) {
          console.log(
            "⏭️ Skipping queued alarm: alarm is disabled.",
            currentTask.title
          );

          nextAlarm = dequeueAlarm();
          continue;
        }

        /**
         * Valid alarm found.
         */
        setTimeout(() => {
          triggerAlarm(
            currentTask.id,
            currentTask.title
          );
        }, 100);

        return;
      }

      console.log(
        "📭 Alarm queue is empty."
      );
    }, [
      dequeueAlarm,
      triggerAlarm,
    ]);

  /**
   * Stop alarm and advance queue.
   */
  useEffect(() => {
    const handleStopAlarm = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<{
          advanceQueue?: boolean;
        }>;

      const audio = audioRef.current;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      if (snoozeTimeoutRef.current) {
        clearTimeout(
          snoozeTimeoutRef.current
        );

        snoozeTimeoutRef.current = null;
      }

      /**
       * Start Focus / manual stop can stop
       * the current alarm without advancing
       * to the next queued alarm.
       */
      if (
        customEvent.detail
          ?.advanceQueue === false
      ) {
        return;
      }

      /**
       * IMPORTANT:
       *
       * Clear the current alarm state BEFORE
       * processing the next queued alarm.
       *
       * Otherwise triggerAlarm() sees
       * isRinging === true and re-enqueues
       * the next alarm instead of starting it.
       */
      stopAlarm();

      /**
       * Process the next queued alarm.
       *
       * Stale entries are skipped automatically.
       */
      triggerNextQueuedAlarm();
    };

    window.addEventListener(
      "dayflow-stop-alarm",
      handleStopAlarm
    );

    return () => {
      window.removeEventListener(
        "dayflow-stop-alarm",
        handleStopAlarm
      );
    };
  }, [
    stopAlarm,
    triggerNextQueuedAlarm,
  ]);

  /**
   * Smart snooze recovery.
   */
  useEffect(() => {
    const handleSnoozeAlarm = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<{
          minutes: number;
        }>;

      const minutes =
        customEvent.detail?.minutes;

      if (
        typeof minutes !== "number" ||
        minutes <= 0
      ) {
        return;
      }

      /**
       * Stop current alarm sound.
       */
      const audio = audioRef.current;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      /**
       * Cancel previous in-memory snooze.
       */
      if (snoozeTimeoutRef.current) {
        clearTimeout(
          snoozeTimeoutRef.current
        );

        snoozeTimeoutRef.current = null;
      }

      /**
       * Capture the current alarm task
       * before the store clears it.
       */
      const alarmState =
        useAlarmStore.getState();

      const taskId =
        alarmState.taskId;

      const taskTitle =
        alarmState.taskTitle;

      if (!taskId || !taskTitle) {
        return;
      }

      /**
       * Keep the existing queue.
       *
       * Snoozing the current alarm must
       * never remove waiting alarms.
       */
      const queuedAlarms = [
        ...alarmState.queue,
      ];

      console.log(
        `⏰ Alarm snoozed for ${minutes} minute(s):`,
        taskTitle
      );

      /**
       * Schedule in-memory recovery.
       */
      snoozeTimeoutRef.current =
        setTimeout(
          () => {
            const currentTask =
              useTaskStore
                .getState()
                .tasks.find(
                  (task) =>
                    task.id === taskId
                );

            /**
             * Task no longer exists.
             */
            if (!currentTask) {
              console.log(
                "Snoozed alarm cancelled: task no longer exists."
              );

              snoozeTimeoutRef.current =
                null;

              return;
            }

            /**
             * Task completed.
             */
            if (currentTask.completed) {
              console.log(
                "Snoozed alarm cancelled: task is completed."
              );

              snoozeTimeoutRef.current =
                null;

              return;
            }

            /**
             * Alarm disabled.
             */
            if (
              currentTask.alarmEnabled ===
              false
            ) {
              console.log(
                "Snoozed alarm cancelled: alarm disabled."
              );

              snoozeTimeoutRef.current =
                null;

              return;
            }

            /**
             * Clear persisted snooze
             * before ringing again.
             */
            void fetch(
              `/api/tasks/${taskId}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  snoozedUntil: null,
                }),
              }
            ).catch((error) => {
              console.error(
                "Failed to clear snooze:",
                error
              );
            });

            /**
             * Trigger normally.
             *
             * If another alarm is currently
             * ringing, this alarm goes into
             * the queue automatically.
             */
            triggerAlarm(
              currentTask.id,
              currentTask.title
            );

            /**
             * Restore alarms that were
             * already waiting before
             * this alarm was snoozed.
             *
             * enqueueAlarm prevents duplicates.
             */
            queuedAlarms.forEach(
              (alarm) => {
                enqueueAlarm(
                  alarm.taskId,
                  alarm.taskTitle
                );
              }
            );

            /**
             * Desktop notification.
             */
            sendNotification(
              currentTask.title,
              0
            );

            console.log(
              "🔔 Snoozed alarm triggered again:",
              currentTask.title
            );

            snoozeTimeoutRef.current =
              null;
          },
          minutes *
            60 *
            1000
        );
    };

    window.addEventListener(
      "dayflow-snooze-alarm",
      handleSnoozeAlarm
    );

    return () => {
      window.removeEventListener(
        "dayflow-snooze-alarm",
        handleSnoozeAlarm
      );

      if (snoozeTimeoutRef.current) {
        clearTimeout(
          snoozeTimeoutRef.current
        );

        snoozeTimeoutRef.current = null;
      }
    };
  }, [
    enqueueAlarm,
    triggerAlarm,
  ]);

  /**
   * Recover persisted snoozed alarms
   * after refresh/restart.
   */
  useEffect(() => {
    const recoverPersistedSnooze =
      () => {
        const now = Date.now();

        const currentTasks =
          useTaskStore
            .getState()
            .tasks;

        currentTasks.forEach((task) => {
          if (!task.snoozedUntil) {
            return;
          }

          /**
           * Ignore completed tasks.
           */
          if (task.completed) {
            return;
          }

          /**
           * Ignore disabled alarms.
           */
          if (
            task.alarmEnabled === false
          ) {
            return;
          }

          const snoozeTime =
            new Date(
              task.snoozedUntil
            ).getTime();

          /**
           * Ignore invalid or future snoozes.
           */
          if (
            Number.isNaN(snoozeTime) ||
            snoozeTime > now
          ) {
            return;
          }

          const recoveryKey =
            `snoozed-${task.id}-${task.snoozedUntil}`;

          /**
           * Prevent the same recovered
           * alarm from being triggered
           * repeatedly.
           */
          if (
            notifiedTasks.current.has(
              recoveryKey
            )
          ) {
            return;
          }

          notifiedTasks.current.add(
            recoveryKey
          );

          /**
           * Clear persisted snooze.
           */
          void fetch(
            `/api/tasks/${task.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                snoozedUntil: null,
              }),
            }
          ).catch((error) => {
            console.error(
              "Failed to clear recovered snooze:",
              error
            );
          });

          /**
           * Use normal alarm pipeline.
           *
           * If another alarm is already
           * ringing, this alarm is queued.
           */
          triggerAlarm(
            task.id,
            task.title
          );

          /**
           * Desktop notification.
           */
          sendNotification(
            task.title,
            0
          );

          console.log(
            "🔔 Recovered persisted snoozed alarm:",
            task.title
          );
        });
      };

    /**
     * Check immediately.
     */
    recoverPersistedSnooze();

    /**
     * Continue checking every second.
     */
    const interval = setInterval(
      recoverPersistedSnooze,
      1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [
    tasks,
    triggerAlarm,
  ]);

  /**
   * Check scheduled alarms.
   */
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();

      const today = now
        .toISOString()
        .split("T")[0];

      const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

      /**
       * Do not block scheduled alarm
       * detection when another alarm
       * is ringing.
       *
       * triggerAlarm() will automatically
       * queue additional alarms.
       */
      tasks.forEach((task) => {
        /**
         * Ignore completed tasks.
         */
        if (task.completed) {
          return;
        }

        /**
         * Ignore disabled alarms.
         */
        if (
          task.alarmEnabled === false
        ) {
          return;
        }

        /**
         * Ignore tasks with an active
         * persisted snooze.
         */
        if (task.snoozedUntil) {
          const snoozeTime =
            new Date(
              task.snoozedUntil
            ).getTime();

          if (
            !Number.isNaN(snoozeTime) &&
            snoozeTime > Date.now()
          ) {
            return;
          }
        }

        /**
         * Only check today's tasks.
         */
        if (task.date !== today) {
          return;
        }

        /**
         * Task must have a start time.
         */
        if (!task.startTime) {
          return;
        }

        /**
         * Task must have a reminder value.
         */
        if (
          task.reminder === undefined ||
          task.reminder === null
        ) {
          return;
        }

        const [hour, minute] =
          task.startTime
            .split(":")
            .map(Number);

        const taskMinutes =
          hour * 60 + minute;

        const reminderMinutes =
          taskMinutes -
          task.reminder;

        const notificationKey =
          `${task.id}-${task.date}-${task.startTime}-${task.reminder}`;

        /**
         * Allow the alarm to trigger:
         *
         * exactly at the reminder time
         *
         * OR
         *
         * up to 2 minutes afterwards.
         */
        const minutesLate =
          currentMinutes -
          reminderMinutes;

        const withinGraceWindow =
          minutesLate >= 0 &&
          minutesLate <= 2;

        if (
          withinGraceWindow &&
          !notifiedTasks.current.has(
            notificationKey
          )
        ) {
          notifiedTasks.current.add(
            notificationKey
          );

          /**
           * Trigger alarm or queue it.
           */
          triggerAlarm(
            task.id,
            task.title
          );

          /**
           * Desktop notification.
           */
          sendNotification(
            task.title,
            task.reminder
          );
        }
      });
    };

    /**
     * Check immediately.
     */
    checkAlarms();

    /**
     * Check every second.
     */
    const interval = setInterval(
      checkAlarms,
      1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [
    tasks,
    triggerAlarm,
  ]);
}

/**
 * Send desktop notification.
 */
function sendNotification(
  title: string,
  reminderMinutes: number
) {
  const {
    notificationsEnabled,
  } = useSettingsStore.getState();

  if (!notificationsEnabled) {
    return;
  }

  if (
    typeof window === "undefined" ||
    !("Notification" in window)
  ) {
    return;
  }

  const message =
    reminderMinutes === 0
      ? `${title} is starting now.`
      : `${title} starts in ${
          reminderMinutes === 1
            ? "minute"
            : "minutes"
        }.`;

  if (
    Notification.permission ===
    "granted"
  ) {
    new Notification(
      "DayFlow 🔔",
      {
        body: message,
        icon: "/favicon.ico",
      }
    );

    return;
  }

  if (
    Notification.permission !==
    "denied"
  ) {
    Notification.requestPermission().then(
      (permission) => {
        if (
          permission === "granted"
        ) {
          new Notification(
            "DayFlow 🔔",
            {
              body: message,
              icon: "/favicon.ico",
            }
          );
        }
      }
    );
  }
}