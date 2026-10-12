"use client";

import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import { useAlarmStore } from "@/store/alarmStore";
import { useTaskStore } from "@/store/taskStore";

export function useAlarmEngine() {
  const tasks = useTaskStore(
    (state) => state.tasks
  );

  const startAlarm = useAlarmStore(
    (state) => state.startAlarm
  );

  const enqueueAlarm = useAlarmStore(
    (state) => state.enqueueAlarm
  );

  const dequeueAlarm = useAlarmStore(
    (state) => state.dequeueAlarm
  );

  const notifiedTasks = useRef<
    Set<string>
  >(new Set());

  const audioRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const snoozeTimeoutRef =
    useRef<
      ReturnType<typeof setTimeout> | null
    >(null);

  /*
   * Request browser notification permission once
   */
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return;
    }

    if (
      Notification.permission ===
      "default"
    ) {
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

  /*
   * Create alarm audio
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

  /*
   * Play alarm sound
   */
  const playAlarm = useCallback(() => {
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
  }, []);

  /*
   * Trigger alarm or add it to the Zustand queue
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

  /*
   * Stop alarm and advance queue
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

      /*
       * Start Focus stops the current alarm
       * without advancing to the next queued alarm.
       */
      if (
        customEvent.detail
          ?.advanceQueue === false
      ) {
        return;
      }

      const nextAlarm =
        dequeueAlarm();

      if (nextAlarm) {
        setTimeout(() => {
          triggerAlarm(
            nextAlarm.taskId,
            nextAlarm.taskTitle
          );
        }, 100);
      }
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
    dequeueAlarm,
    triggerAlarm,
  ]);

  /*
   * Smart snooze recovery
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

      /*
       * Stop current alarm sound
       */
      const audio = audioRef.current;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      /*
       * Cancel previous in-memory snooze
       */
      if (snoozeTimeoutRef.current) {
        clearTimeout(
          snoozeTimeoutRef.current
        );

        snoozeTimeoutRef.current = null;
      }

      /*
       * Capture the alarm task before
       * the store clears it.
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

      /*
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

      /*
       * Schedule in-memory recovery
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

            if (!currentTask) {
              console.log(
                "Snoozed alarm cancelled: task no longer exists."
              );

              snoozeTimeoutRef.current =
                null;

              return;
            }

            if (currentTask.completed) {
              console.log(
                "Snoozed alarm cancelled: task is completed."
              );

              snoozeTimeoutRef.current =
                null;

              return;
            }

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

            /*
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

            /*
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

            /*
             * Restore alarms that were already
             * waiting before this alarm was snoozed.
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

            /*
             * Desktop notification
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

  /*
   * Recover persisted snoozed alarms
   * after refresh/restart.
   *
   * Multiple recovered alarms are allowed.
   * triggerAlarm() automatically queues
   * additional alarms if one is already ringing.
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

          if (task.completed) {
            return;
          }

          if (
            task.alarmEnabled === false
          ) {
            return;
          }

          const snoozeTime =
            new Date(
              task.snoozedUntil
            ).getTime();

          /*
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

          /*
           * Prevent the same recovered alarm
           * from being triggered repeatedly.
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

          /*
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

          /*
           * Use the normal alarm pipeline.
           *
           * If another alarm is already
           * ringing, this alarm is queued.
           */
          triggerAlarm(
            task.id,
            task.title
          );

          /*
           * Desktop notification
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

    /*
     * Check immediately.
     */
    recoverPersistedSnooze();

    /*
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

  /*
   * Check scheduled alarms
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

      /*
       * Do not return when another alarm
       * is ringing.
       *
       * triggerAlarm() will automatically
       * queue additional alarms.
       */
      tasks.forEach((task) => {
        /*
         * Ignore completed tasks.
         */
        if (task.completed) {
          return;
        }

        /*
         * Ignore disabled alarms.
         */
        if (
          task.alarmEnabled === false
        ) {
          return;
        }

        /*
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

        /*
         * Only check today's tasks.
         */
        if (task.date !== today) {
          return;
        }

        /*
         * Task must have a start time.
         */
        if (!task.startTime) {
          return;
        }

        /*
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

        /*
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

          /*
           * Trigger alarm or queue it.
           */
          triggerAlarm(
            task.id,
            task.title
          );

          /*
           * Desktop notification.
           */
          sendNotification(
            task.title,
            task.reminder
          );
        }
      });
    };

    /*
     * Check immediately.
     */
    checkAlarms();

    /*
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

function sendNotification(
  title: string,
  reminderMinutes: number
) {
  if (
    typeof window === "undefined" ||
    !("Notification" in window)
  ) {
    return;
  }

  const message =
    reminderMinutes === 0
      ? `${title} is starting now.`
      : `${title} starts in ${reminderMinutes} ${
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