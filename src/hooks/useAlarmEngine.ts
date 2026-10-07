"use client";

import { useEffect, useRef } from "react";

import { useTaskStore } from "@/store/taskStore";

export function useAlarmEngine() {
  const tasks = useTaskStore((state) => state.tasks);

  const notifiedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();

      const today = now.toISOString().split("T")[0];

      const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

      tasks.forEach((task) => {
        if (task.completed) {
          return;
        }

        if (task.date !== today) {
          return;
        }

        if (!task.startTime) {
          return;
        }

        if (
          task.reminder === undefined ||
          task.reminder === null
        ) {
          return;
        }

        const [hour, minute] = task.startTime
          .split(":")
          .map(Number);

        const taskMinutes =
          hour * 60 + minute;

        const reminderMinutes =
          taskMinutes - task.reminder;

        const notificationKey =
          `${task.id}-${task.date}-${task.startTime}-${task.reminder}`;

        if (
          currentMinutes === reminderMinutes &&
          !notifiedTasks.current.has(
            notificationKey
          )
        ) {
          notifiedTasks.current.add(
            notificationKey
          );

          sendNotification(task.title, task.reminder);
        }
      });
    };

    checkAlarms();

    const interval = setInterval(
      checkAlarms,
      1000
    );

    return () => clearInterval(interval);
  }, [tasks]);
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
    new Notification("DayFlow", {
      body: message,
      icon: "/favicon.ico",
    });

    return;
  }

  if (Notification.permission !== "denied") {
    Notification.requestPermission().then(
      (permission) => {
        if (permission === "granted") {
          new Notification("DayFlow", {
            body: message,
            icon: "/favicon.ico",
          });
        }
      }
    );
  }
}