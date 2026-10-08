"use client";

import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ListTodo,
  Menu,
} from "lucide-react";
import { useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import AddTaskDialog from "@/components/tasks/AddTaskDialog";
import TaskList from "@/components/tasks/TaskList";
import { useTaskStore } from "@/store/taskStore";

export default function TasksPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tasks = useTaskStore((state) => state.tasks);

  const completedTasks = tasks.filter(
    (task) => task.completed
  );

  const activeTasks = tasks.filter(
    (task) => !task.completed
  );

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} />

        {/* Main */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-white/10 px-5 md:px-8">
            {/* Left */}
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <button
                type="button"
                onClick={() => window.history.back()}
                className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>

              {/* Sidebar Button */}
              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(!sidebarOpen)
                }
                className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Toggle sidebar"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-xs text-zinc-500">
                  Workspace
                </p>

                <p className="text-sm font-medium text-zinc-300">
                  Tasks
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                <Bell size={18} />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
              </button>

              <div className="flex items-center gap-3 border-l border-white/10 pl-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-zinc-300 to-zinc-600 text-sm font-semibold text-black">
                  S
                </div>

                <div className="hidden md:block">
                  <p className="text-sm font-medium">
                    Sayan
                  </p>

                  <p className="text-xs text-zinc-500">
                    My workspace
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1500px] p-5 md:p-8">
              {/* Page Header */}
              <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                    Workspace
                  </p>

                  <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                    Tasks
                  </h1>

                  <p className="mt-2 text-sm text-zinc-500">
                    Manage everything you need to get
                    done.
                  </p>
                </div>

                <AddTaskDialog />
              </div>

              {/* Stats */}
              <div className="mb-8 grid gap-4 md:grid-cols-3">
                <StatCard
                  icon={<ListTodo size={19} />}
                  label="Total Tasks"
                  value={String(tasks.length)}
                />

                <StatCard
                  icon={<ListTodo size={19} />}
                  label="Active"
                  value={String(activeTasks.length)}
                />

                <StatCard
                  icon={<CheckCircle2 size={19} />}
                  label="Completed"
                  value={String(
                    completedTasks.length
                  )}
                />
              </div>

              {/* Today's Tasks */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.02]">
                <div className="border-b border-white/10 p-5 md:p-6">
                  <h2 className="font-semibold">
                    Today's Tasks
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    Your scheduled tasks for today
                  </p>
                </div>

                <div className="p-5 md:p-6">
                  <TaskList />
                </div>
              </section>
            </div>
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
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/20 hover:bg-white/[0.03]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400">
        {icon}
      </div>

      <p className="mt-6 text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}