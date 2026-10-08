"use client";

import {
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

        {/* Main Area */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Top Header */}
          <header className="flex h-20 items-center justify-between border-b border-white/10 px-5 md:px-8">
            {/* Left */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setSidebarOpen((open) => !open)
                }
                className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                aria-label={
                  sidebarOpen
                    ? "Close sidebar"
                    : "Open sidebar"
                }
                title={
                  sidebarOpen
                    ? "Close sidebar"
                    : "Open sidebar"
                }
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
                aria-label="Notifications"
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

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1500px] p-5 md:p-8">
              {/* Page Header */}
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
                {/* Total Tasks */}
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

                {/* Active */}
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

                {/* Completed */}
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
          </div>
        </section>
      </div>
    </main>
  );
}