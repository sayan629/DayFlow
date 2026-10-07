"use client";

import { useEffect, useRef } from "react";
import { useTaskStore } from "@/store/taskStore";

export function useAlarmEngine() {
  const tasks = useTaskStore((state) => state.tasks);
  const notifiedTasks = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/alarm.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.8;

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();

      const today = now.toISOString().split("T")[0];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      tasks.forEach((task) => {
        if (task.completed) return;
        if (task.date !== today) return;
        if (!task.startTime) return;
        if (task.reminder === undefined || task.reminder === null) return;

        const [hour, minute] = task.startTime.split(":").map(Number);

        const taskMinutes = hour * 60 + minute;
        const reminderMinutes = taskMinutes - task.reminder;

        const notificationKey =
          `${task.id}-${task.date}-${task.startTime}-${task.reminder}`;

        if (
          currentMinutes === reminderMinutes &&
          !notifiedTasks.current.has(notificationKey)
        ) {
          notifiedTasks.current.add(notificationKey);

          // 🔊 Play alarm music
          playAlarm();

          // 🔔 Browser notification
          sendNotification(task.title, task.reminder);
        }
      });
    };

    checkAlarms();

    const interval = setInterval(checkAlarms, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  function playAlarm() {
    const audio = audioRef.current;

    if (!audio) return;

    audio.currentTime = 0;

    audio.play().catch((error) => {
      console.warn("Could not play alarm sound:", error);
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
          reminderMinutes === 1 ? "minute" : "minutes"
        }.`;

  if (Notification.permission === "granted") {
    new Notification("DayFlow 🔔", {
      body: message,
      icon: "/favicon.ico",
    });

    return;
  }

  if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("DayFlow 🔔", {
          body: message,
          icon: "/favicon.ico",
        });
      }
    });
  }
}