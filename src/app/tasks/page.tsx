"use client";

import AddTaskDialog from "@/components/tasks/AddTaskDialog";
import TaskList from "@/components/tasks/TaskList";
import { useTaskStore } from "@/store/taskStore";
import {
  CheckCircle2,
  ListTodo,
} from "lucide-react";

export default function TasksPage() {
  const tasks = useTaskStore((state) => state.tasks);

  const completedTasks = tasks.filter(
    (task) => task.completed
  );

  const activeTasks = tasks.filter(
    (task) => !task.completed
  );

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto max-w-[1500px] p-5 md:p-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
              Workspace
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Tasks
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Manage everything you need to get done.
            </p>
          </div>

          <AddTaskDialog />
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
              <ListTodo
                size={18}
                className="text-zinc-400"
              />
            </div>

            <p className="mt-5 text-xs text-zinc-500">
              Total Tasks
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {tasks.length}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
              <ListTodo
                size={18}
                className="text-zinc-400"
              />
            </div>

            <p className="mt-5 text-xs text-zinc-500">
              Active
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {activeTasks.length}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
              <CheckCircle2
                size={18}
                className="text-zinc-400"
              />
            </div>

            <p className="mt-5 text-xs text-zinc-500">
              Completed
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {completedTasks.length}
            </p>
          </div>
        </div>

        {/* Today's Tasks */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="font-semibold">
              Today's Tasks
            </h2>

            <p className="mt-1 text-xs text-zinc-600">
              Your scheduled tasks for today
            </p>
          </div>

          <div className="p-5 md:p-6">
            <TaskList />
          </div>
        </section>
      </div>
    </main>
  );
}