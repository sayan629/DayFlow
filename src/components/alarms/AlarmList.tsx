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
  if (alarmTasks.length === 0) {
    return (
      <section className="flex min-h-[360px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <Bell
              size={24}
              className="text-zinc-500"
            />
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            No alarms scheduled
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
            Create a task with a start time to see its
            alarm here.
          </p>
        </div>
      </section>
    );
  }