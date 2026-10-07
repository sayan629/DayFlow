"use client";

import AddTaskDialog from "@/components/tasks/AddTaskDialog";
import TaskList from "@/components/tasks/TaskList";
import { useTaskStore } from "@/store/taskStore";
import {
  CheckCircle2,
  ListTodo,
  Search,
} from "lucide-react";
import { useState } from "react";

export default function TasksPage() {
  const tasks = useTaskStore((state) => state.tasks);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "active" | "completed"
  >("all");

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

        {/* Controls */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search tasks..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-white/20"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              {[
                {
                  label: "All",
                  value: "all" as const,
                },
                {
                  label: "Active",
                  value: "active" as const,
                },
                {
                  label: "Completed",
                  value: "completed" as const,
                },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setFilter(item.value)
                  }
                  className={`rounded-xl px-4 py-2 text-xs font-medium transition ${
                    filter === item.value
                      ? "bg-white text-black"
                      : "text-zinc-500 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task List */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="font-semibold">
              {filter === "all"
                ? "All Tasks"
                : filter === "active"
                  ? "Active Tasks"
                  : "Completed Tasks"}
            </h2>

            <p className="mt-1 text-xs text-zinc-600">
              {tasks.length} total tasks
            </p>
          </div>

          <div className="p-5">
            <TaskList
              search={search}
              filter={filter}
            />
          </div>
        </section>
      </div>
    </main>
  );
}