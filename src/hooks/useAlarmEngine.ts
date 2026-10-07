"use client";

import { useEffect, useRef } from "react";
import { useAlarmStore } from "@/store/alarmStore";
import { useTaskStore } from "@/store/taskStore";

export function useAlarmEngine() {
  const tasks = useTaskStore((state) => state.tasks);
  const startAlarm = useAlarmStore((state) => state.startAlarm);

  const notifiedTasks = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create alarm audio
  useEffect(() => {
    const audio = new Audio("/sounds/alarm.mp3");

    audio.loop = true;
    audio.volume = 0.8;

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  // Listen for stop alarm
  useEffect(() => {
    const handleStopAlarm = () => {
      const audio = audioRef.current;

      if (!audio) return;

      audio.pause();
      audio.currentTime = 0;
    };

    window.addEventListener("dayflow-stop-alarm", handleStopAlarm);

    return () => {
      window.removeEventListener(
        "dayflow-stop-alarm",
        handleStopAlarm
      );
    };
  }, []);

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();

      const today = now.toISOString().split("T")[0];
      const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

      tasks.forEach((task) => {
        if (task.completed) return;
        if (task.date !== today) return;
        if (!task.startTime) return;

        if (
          task.reminder === undefined ||
          task.reminder === null
        ) {
          return;
        }

        const [hour, minute] =
          task.startTime.split(":").map(Number);

        const taskMinutes = hour * 60 + minute;
        const reminderMinutes =
          taskMinutes - task.reminder;

        const notificationKey =
          `${task.id}-${task.date}-${task.startTime}-${task.reminder}`;

        if (
          currentMinutes === reminderMinutes &&
          !notifiedTasks.current.has(notificationKey)
        ) {
          notifiedTasks.current.add(notificationKey);

          // 🔊 Start music
          playAlarm();

          // 🔔 Start alarm state
          startAlarm(task.id, task.title);

          // 🖥️ Desktop notification
          sendNotification(
            task.title,
            task.reminder
          );
        }
      });
    };

    checkAlarms();

    const interval = setInterval(
      checkAlarms,
      1000
    );

    return () => clearInterval(interval);
  }, [tasks, startAlarm]);

  function playAlarm() {
    const audio = audioRef.current;

    if (!audio) return;

    audio.currentTime = 0;

    audio.play().catch((error) => {
      console.warn(
        "Could not play alarm sound:",
        error
      );
    });
  }
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

  if (Notification.permission === "granted") {
    new Notification("DayFlow 🔔", {
      body: message,
      icon: "/favicon.ico",
    });

    return;
  }

  if (Notification.permission !== "denied") {
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