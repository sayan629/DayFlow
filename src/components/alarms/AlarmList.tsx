"use client";

import { Bell, BellOff, CheckCircle2, Clock3 } from "lucide-react";
import { useMemo, useState } from "react";

import { useTaskStore } from "@/store/taskStore";

export default function AlarmList() {
  const tasks = useTaskStore((state) => state.tasks);

  const [disabledAlarms, setDisabledAlarms] = useState<string[]>(
    []
  );
const today = new Date().toISOString().split("T")[0];

  const alarmTasks = useMemo(() => {
    return tasks
      .filter(
        (task) =>
          task.date === today &&
          task.startTime &&
          !task.completed
      )
      .sort((a, b) =>
        (a.startTime ?? "").localeCompare(b.startTime ?? "")
      );
  }, [tasks, today]);
  const toggleAlarm = (taskId: string) => {
    setDisabledAlarms((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId]
    );
  };