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
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">
              Today's Alarms
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              {alarmTasks.length}{" "}
              {alarmTasks.length === 1
                ? "alarm"
                : "alarms"}{" "}
              scheduled
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
            <Bell
              size={17}
              className="text-zinc-400"
            />
          </div>
        </div>
      </div>
       {/* Alarm list */}
      <div className="divide-y divide-white/10">
        {alarmTasks.map((task) => {
          const disabled = disabledAlarms.includes(
            task.id
          );

          return (
            <div
              key={task.id}
              className={`flex items-center gap-4 px-6 py-5 transition ${
                disabled
                  ? "opacity-50"
                  : "hover:bg-white/[0.02]"
              }`}
            >
            </div>
            {/* Time */}
              <div className="w-24 shrink-0">
                <p className="text-lg font-semibold tracking-tight">
                  {formatTime(task.startTime!)}
                </p>

                {task.endTime && (
                  <p className="mt-1 text-[11px] text-zinc-600">
                    until {formatTime(task.endTime)}
                  </p>
                )}
              </div>

              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                {disabled ? (
                  <BellOff
                    size={17}
                    className="text-zinc-600"
                  />
                ) : (
                  <Clock3
                    size={17}
                    className="text-zinc-400"
                  />
                )}
              </div>