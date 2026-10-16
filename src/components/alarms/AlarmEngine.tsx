"use client";

import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import { useAlarmStore } from "@/store/alarmStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTaskStore } from "@/store/taskStore";

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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
            ? "1 minute"
            : `${reminderMinutes} minutes`
        }.`;

  if (Notification.permission === "granted") {
    new Notification("DayFlow 🔔", {
      body: message,
      icon: "/favicon.ico",
    });

    return;
  }

  if (
    Notification.permission !== "denied"
  ) {
    void Notification.requestPermission().then(
      (permission) => {
        if (permission === "granted") {
          new Notification("DayFlow 🔔", {
            body: message,
            icon: "/favicon.ico",
          });
        }
      }
    );
  }
}

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

  const restoreQueue = useAlarmStore(
    (state) => state.restoreQueue
  );

  const alarmSoundEnabled =
    useSettingsStore(
      (state) => state.alarmSoundEnabled
    );

  const notifiedTasks = useRef<Set<string>>(
    new Set()
  );

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const audioUnlockedRef =
    useRef(false);

  const snoozeTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  /*
   * --------------------------------------------------
   * Restore queued alarms
   * --------------------------------------------------
   */

  useEffect(() => {
    restoreQueue();
  }, [restoreQueue]);

  /*
   * --------------------------------------------------
   * Request notification permission
   * --------------------------------------------------
   */

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return;
    }

    if (
      Notification.permission === "default"
    ) {
      void Notification.requestPermission().catch(
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
   * --------------------------------------------------
   * Create alarm audio
   * --------------------------------------------------
   */

  useEffect(() => {
    const audio = new Audio(
      "/sounds/alarm.mp3"
    );

    audio.loop = true;
    audio.volume = 0.8;
    audio.preload = "auto";

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
   * --------------------------------------------------
   * Unlock browser audio after user interaction
   *
   * Chrome can block audio started by a timer if the
   * page has never received a user interaction.
   * --------------------------------------------------
   */

  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    const unlockAudio = () => {
      if (
        audioUnlockedRef.current ||
        !audioRef.current
      ) {
        return;
      }

      const audio = audioRef.current;

      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;

          audioUnlockedRef.current = true;

          console.log(
            "🔓 DayFlow alarm audio unlocked."
          );
        })
        .catch(() => {
          /*
           * Browser may still reject the attempt.
           * Another user interaction will retry it.
           */
        });
    };

    window.addEventListener(
      "pointerdown",
      unlockAudio,
      { passive: true }
    );

    window.addEventListener(
      "keydown",
      unlockAudio
    );

    window.addEventListener(
      "touchstart",
      unlockAudio,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        unlockAudio
      );

      window.removeEventListener(
        "keydown",
        unlockAudio
      );

      window.removeEventListener(
        "touchstart",
        unlockAudio
      );
    };
  }, []);

  /*
   * --------------------------------------------------
   * Play alarm sound
   * --------------------------------------------------
   */

  const playAlarm = useCallback(() => {
    if (!alarmSoundEnabled) {
      console.log(
        "🔕 Alarm sound disabled in settings."
      );

      return;
    }

    const audio = audioRef.current;

    if (!audio) {
      console.warn(
        "⚠️ Alarm audio element is not ready."
      );

      return;
    }

    audio.currentTime = 0;

    void audio.play().then(() => {
      console.log(
        "🔊 DayFlow alarm sound started."
      );
    }).catch((error) => {
      console.warn(
        "⚠️ Could not play alarm sound:",
        error
      );
    });
  }, [alarmSoundEnabled]);

  /*
   * --------------------------------------------------
   * Trigger alarm or put it in the queue
   * --------------------------------------------------
   */

  const triggerAlarm = useCallback(
    (
      taskId: string,
      taskTitle: string
    ) => {
      const alarmState =
        useAlarmStore.getState();

      if (alarmState.isRinging) {
        console.log(
          "📥 Alarm already ringing. Added to queue:",
          taskTitle
        );

        enqueueAlarm(
          taskId,
          taskTitle
        );

        return;
      }

      console.log(
        "🔔 ALARM TRIGGERED:",
        taskTitle
      );

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
   * --------------------------------------------------
   * Process next queued alarm
   * --------------------------------------------------
   */

  const triggerNextQueuedAlarm =
    useCallback(() => {
      let nextAlarm =
        dequeueAlarm();

      while (nextAlarm) {
        const currentTask =
          useTaskStore
            .getState()
            .tasks.find(
              (task) =>
                task.id ===
                nextAlarm?.taskId
            );

        if (!currentTask) {
          console.log(
            "⏭️ Skipping queued alarm: task deleted.",
            nextAlarm.taskTitle
          );

          nextAlarm =
            dequeueAlarm();

          continue;
        }

        if (currentTask.completed) {
          console.log(
            "⏭️ Skipping queued alarm: task completed.",
            currentTask.title
          );

          nextAlarm =
            dequeueAlarm();

          continue;
        }

        if (
          currentTask.alarmEnabled === false
        ) {
          console.log(
            "⏭️ Skipping queued alarm: alarm disabled.",
            currentTask.title
          );

          nextAlarm =
            dequeueAlarm();

          continue;
        }

        const taskId =
          currentTask.id;

        const taskTitle =
          currentTask.title;

        setTimeout(() => {
          triggerAlarm(
            taskId,
            taskTitle
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

  /*
   * --------------------------------------------------
   * Stop alarm listener
   * --------------------------------------------------
   */

  useEffect(() => {
    const handleStopAlarm = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<{
          advanceQueue?: boolean;
        }>;

      const audio =
        audioRef.current;

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
       * Start Focus / manual stop without
       * advancing the queue.
       */

      if (
        customEvent.detail
          ?.advanceQueue === false
      ) {
        return;
      }

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
  }, [triggerNextQueuedAlarm]);

  /*
   * --------------------------------------------------
   * Snooze handling
   * --------------------------------------------------
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

      const audio =
        audioRef.current;

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

      const alarmState =
        useAlarmStore.getState();

      const taskId =
        alarmState.taskId;

      const taskTitle =
        alarmState.taskTitle;

      if (!taskId || !taskTitle) {
        return;
      }

      const queuedAlarms = [
        ...alarmState.queue,
      ];

      console.log(
        `⏰ Alarm snoozed for ${minutes} minute(s):`,
        taskTitle
      );

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
              currentTask.alarmEnabled === false
            ) {
              console.log(
                "Snoozed alarm cancelled: alarm disabled."
              );

              snoozeTimeoutRef.current =
                null;

              return;
            }

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

            triggerAlarm(
              currentTask.id,
              currentTask.title
            );

            queuedAlarms.forEach(
              (alarm) => {
                enqueueAlarm(
                  alarm.taskId,
                  alarm.taskTitle
                );
              }
            );

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
          minutes * 60 * 1000
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
   * --------------------------------------------------
   * Recover persisted snoozed alarms
   * --------------------------------------------------
   */

  useEffect(() => {
    const recoverPersistedSnooze =
      () => {
        const now =
          Date.now();

        const currentTasks =
          useTaskStore
            .getState()
            .tasks;

        currentTasks.forEach(
          (task) => {
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

            if (
              Number.isNaN(
                snoozeTime
              ) ||
              snoozeTime > now
            ) {
              return;
            }

            const recoveryKey =
              `snoozed-${task.id}-${task.snoozedUntil}`;

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

            triggerAlarm(
              task.id,
              task.title
            );

            sendNotification(
              task.title,
              0
            );

            console.log(
              "🔔 Recovered persisted snoozed alarm:",
              task.title
            );
          }
        );
      };

    recoverPersistedSnooze();

    const interval =
      setInterval(
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
   * --------------------------------------------------
   * MAIN SCHEDULED ALARM CHECK
   * --------------------------------------------------
   */

  useEffect(() => {
    const checkAlarms = () => {
      const now =
        new Date();

      /*
       * IMPORTANT:
       *
       * Use LOCAL date here.
       *
       * Do NOT use:
       * now.toISOString().split("T")[0]
       *
       * because that gives UTC date and can be
       * one day different from the user's local date.
       */

      const today =
        getLocalDateKey(now);

      const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

      tasks.forEach(
        (task) => {
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
           * Ignore active snoozes.
           */

          if (task.snoozedUntil) {
            const snoozeTime =
              new Date(
                task.snoozedUntil
              ).getTime();

            if (
              !Number.isNaN(
                snoozeTime
              ) &&
              snoozeTime >
                Date.now()
            ) {
              return;
            }
          }

          /*
           * Only today's tasks.
           */

          if (
            task.date !== today
          ) {
            return;
          }

          /*
           * Task needs a start time.
           */

          if (!task.startTime) {
            return;
          }

          /*
           * Task needs a reminder.
           *
           * reminder = minutes before task.
           */

          if (
            task.reminder ===
              undefined ||
            task.reminder === null
          ) {
            return;
          }

          const [
            hour,
            minute,
          ] =
            task.startTime
              .split(":")
              .map(Number);

          if (
            Number.isNaN(hour) ||
            Number.isNaN(minute)
          ) {
            console.warn(
              "Invalid task start time:",
              task
            );

            return;
          }

          const taskMinutes =
            hour * 60 +
            minute;

          const reminderMinutes =
            taskMinutes -
            task.reminder;

          const notificationKey =
            `${task.id}-${task.date}-${task.startTime}-${task.reminder}`;

          /*
           * Trigger exactly at reminder time
           * or within the next 2 minutes.
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

            console.log(
              "⏰ Scheduled alarm matched:",
              {
                title: task.title,
                date: task.date,
                startTime:
                  task.startTime,
                reminder:
                  task.reminder,
                reminderTime:
                  `${Math.floor(
                    reminderMinutes / 60
                  )
                    .toString()
                    .padStart(2, "0")}:${(
                    reminderMinutes % 60
                  )
                    .toString()
                    .padStart(2, "0")}`,
                currentTime:
                  now.toLocaleTimeString(),
              }
            );

            triggerAlarm(
              task.id,
              task.title
            );

            sendNotification(
              task.title,
              task.reminder
            );
          }
        }
      );
    };

    /*
     * Check immediately.
     */

    checkAlarms();

    /*
     * Check every second.
     */

    const interval =
      setInterval(
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

/*
 * --------------------------------------------------
 * Default component
 *
 * layout.tsx imports:
 *
 * import AlarmEngine from "@/components/alarms/AlarmEngine";
 *
 * and renders:
 *
 * <AlarmEngine />
 *
 * --------------------------------------------------
 */

export default function AlarmEngine() {
  useAlarmEngine();

  return null;
}