"use client";

import {
  ListTodo,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useTaskStore } from "@/store/taskStore";
import TaskItem from "./TaskItem";
import {
  TaskCategory,
  TaskPriority,
} from "@/types/task";

export default function TaskList() {
  const tasks = useTaskStore((state) => state.tasks);

  const today = new Date().toISOString().split("T")[0];

  const [search, setSearch] = useState("");
  const [priority, setPriority] =
    useState<TaskPriority | "all">("all");

  const [category, setCategory] =
    useState<TaskCategory | "all">("all");

  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => task.date === today)
      .filter((task) => {
        if (!search.trim()) {
          return true;
        }

        const query = search.toLowerCase();

        return (
          task.title.toLowerCase().includes(query) ||
          task.description
            ?.toLowerCase()
            .includes(query)
        );
      })
      .filter((task) => {
        if (priority === "all") {
          return true;
        }

        return task.priority === priority;
      })
      .filter((task) => {
        if (category === "all") {
          return true;
        }

        return task.category === category;
      })
      .sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;

        return a.startTime.localeCompare(b.startTime);
      });
  }, [tasks, today, search, priority, category]);

  const hasActiveFilters =
    search.trim() !== "" ||
    priority !== "all" ||
    category !== "all";

  const clearFilters = () => {
    setSearch("");
    setPriority("all");
    setCategory("all");
  };

  return (
    <div>
      {/* Search + Filter Header */}
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search today's tasks..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.025] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/20"
            />
          </div>

          {/* Filter Button */}
          <button
            type="button"
            onClick={() =>
              setFiltersOpen((value) => !value)
            }
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition ${
              filtersOpen || hasActiveFilters
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 bg-white/[0.025] text-zinc-500 hover:bg-white/5 hover:text-white"
            }`}
          >
            <SlidersHorizontal size={16} />

            <span className="hidden sm:inline">
              Filters
            </span>

            {hasActiveFilters && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-semibold text-black">
                {
                  [
                    search.trim() !== "",
                    priority !== "all",
                    category !== "all",
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {filtersOpen && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Priority */}
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-500">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(
                      e.target.value as
                        | TaskPriority
                        | "all"
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#18181b] px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
                >
                  <option value="all">
                    All priorities
                  </option>
                  <option value="high">High</option>
                  <option value="medium">
                    Medium
                  </option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-500">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value as
                        | TaskCategory
                        | "all"
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#18181b] px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
                >
                  <option value="all">
                    All categories
                  </option>
                  <option value="study">Study</option>
                  <option value="development">
                    Development
                  </option>
                  <option value="personal">
                    Personal
                  </option>
                  <option value="fitness">
                    Fitness
                  </option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 flex items-center gap-2 text-xs text-zinc-500 transition hover:text-white"
              >
                <X size={14} />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {filteredTasks.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <ListTodo
              size={20}
              className="text-zinc-500"
            />
          </div>

          <h3 className="mt-4 text-sm font-medium">
            {hasActiveFilters
              ? "No matching tasks"
              : "No tasks for today"}
          </h3>

          <p className="mt-1 max-w-xs text-xs leading-relaxed text-zinc-600">
            {hasActiveFilters
              ? "Try changing your search or filters."
              : "Your schedule is empty. Add your first task to get started."}
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
            />
          ))}
        </div>
      )}
    </div>
  );
}