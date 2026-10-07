"use client";

import { ListTodo } from "lucide-react";

import { useTaskStore } from "@/store/taskStore";
import TaskItem from "./TaskItem";

export default function TaskList() {
  const tasks = useTaskStore((state) => state.tasks);

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;

    return a.startTime.localeCompare(b.startTime);
  });

  if (sortedTasks.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <ListTodo size={20} className="text-zinc-500" />
        </div>

        <h3 className="mt-4 text-sm font-medium">
          No tasks yet
        </h3>

        <p className="mt-1 max-w-xs text-xs leading-relaxed text-zinc-600">
          Your schedule is empty. Add your first task to get
          started.
        </p>
      </div>
    );
  }
