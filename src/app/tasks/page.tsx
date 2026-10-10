"use client";

import {
  CheckCircle2,
  ListTodo,
} from "lucide-react";

import AddTaskDialog from "@/components/tasks/AddTaskDialog";
import TaskList from "@/components/tasks/TaskList";
import { useTaskStore } from "@/store/taskStore";

export default function TasksPage() {
  const tasks = useTaskStore(
    (state) => state.tasks
  );

  const completedTasks = tasks.filter(
    (task) => task.completed
  );

  const activeTasks = tasks.filter(
    (task) => !task.completed
  );

  return (
    <main className="min-h-full">
      <div className="mx-auto w-full max-w-[1500px] p-5 md:p-8 lg:p-10">
        {/* Page Header */}
        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
              Workspace
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Tasks
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              Manage everything you need to get done.
            </p>
          </div>

          <AddTaskDialog />
        </section>

        {/* Stats */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {/* Total Tasks */}
          <StatCard
            icon={
              <ListTodo
                size={18}
                className="text-zinc-400"
              />
            }
            label="Total Tasks"
            value={tasks.length}
          />

          {/* Active */}
          <StatCard
            icon={
              <ListTodo
                size={18}
                className="text-zinc-400"
              />
            }
            label="Active"
            value={activeTasks.length}
          />

          {/* Completed */}
          <StatCard
            icon={
              <CheckCircle2
                size={18}
                className="text-zinc-400"
              />
            }
            label="Completed"
            value={completedTasks.length}
          />
        </section>

        {/* Today's Tasks */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="font-semibold text-white">
              Today&apos;s Tasks
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

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20 hover:bg-white/[0.03]">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
        {icon}
      </div>

      <p className="mt-5 text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}