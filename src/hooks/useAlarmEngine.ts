"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAlarmStore } from "@/store/alarmStore";
import { useTaskStore } from "@/store/taskStore";

export function useAlarmEngine() {
  const tasks = useTaskStore((state) => state.tasks);

  const startAlarm = useAlarmStore(
    (state) => state.startAlarm
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

  // Create alarm audio
  useEffect(() => {
    const audio = new Audio("/sounds/alarm.mp3");

    audio.loop = true;
    audio.volume = 0.8;

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;

      if (snoozeTimeoutRef.current) {
        clearTimeout(snoozeTimeoutRef.current);
        snoozeTimeoutRef.current = null;
      }

      audioRef.current = null;
    };
  }, []);

  // Play alarm sound
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

  // Stop alarm
  useEffect(() => {
    const handleStopAlarm = () => {
      const audio = audioRef.current;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      if (snoozeTimeoutRef.current) {
        clearTimeout(snoozeTimeoutRef.current);
        snoozeTimeoutRef.current = null;
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
  }, []);

  // Snooze alarm
  useEffect(() => {
    const handleSnoozeAlarm = (event: Event) => {
      const customEvent =
        event as CustomEvent<{
          minutes: number;
        }>;

      const minutes =
        customEvent.detail.minutes;

      // Stop current alarm sound
      const audio = audioRef.current;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      // Clear previous snooze
      if (snoozeTimeoutRef.current) {
        clearTimeout(snoozeTimeoutRef.current);
      }

      const alarmState =
        useAlarmStore.getState();

      const taskId = alarmState.taskId;
      const taskTitle =
        alarmState.taskTitle;

      if (!taskId || !taskTitle) {
        return;
      }

      // Wait for snooze duration
      snoozeTimeoutRef.current =
        setTimeout(() => {
          const currentAudio =
            audioRef.current;

          // Check whether task still exists
          // and whether its alarm is enabled.
          const currentTask =
            useTaskStore
              .getState()
              .tasks.find(
                (task) => task.id === taskId
              );

          if (
            !currentTask ||
            currentTask.completed ||
            currentTask.alarmEnabled === false
          ) {
            snoozeTimeoutRef.current = null;
            return;
          }

          if (currentAudio) {
            currentAudio.currentTime = 0;

            currentAudio
              .play()
              .catch((error) => {
                console.warn(
                  "Could not play snoozed alarm:",
                  error
                );
              });
          }

          useAlarmStore
            .getState()
            .startAlarm(
              taskId,
              taskTitle
            );

          snoozeTimeoutRef.current = null;
        }, minutes * 60 * 1000);
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
    };
  }, []);

  // Check scheduled alarms
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();

      const today = now
        .toISOString()
        .split("T")[0];

      const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

      tasks.forEach((task) => {
        // Ignore completed tasks
        if (task.completed) {
          return;
        }

        // Ignore disabled alarms
        if (task.alarmEnabled === false) {
          return;
        }

        // Only check today's tasks
        if (task.date !== today) {
          return;
        }

        // Task must have a start time
        if (!task.startTime) {
          return;
        }

        // Task must have a reminder value
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
          taskMinutes - task.reminder;

        const notificationKey =
          `${task.id}-${task.date}-${task.startTime}-${task.reminder}`;

        /*
         * Allow the alarm to trigger:
         * exactly at the reminder time
         * OR
         * up to 2 minutes afterwards.
         *
         * This protects against small browser/timer delays
         * while preventing very old reminders from firing.
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

          // 🔊 Start alarm sound
          playAlarm();

          // 🔔 Start alarm state
          startAlarm(
            task.id,
            task.title
          );

          // 🖥️ Desktop notification
          sendNotification(
            task.title,
            task.reminder
          );
        }
      });
    };

    // Check immediately
    checkAlarms();

    // Check every second
    const interval = setInterval(
      checkAlarms,
      1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [tasks, startAlarm, playAlarm]);
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
    new Notification("DayFlow 🔔", {
      body: message,
      icon: "/favicon.ico",
    });

    return;
  }

  if (
    Notification.permission !== "denied"
  ) {
    Notification.requestPermission().then(
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