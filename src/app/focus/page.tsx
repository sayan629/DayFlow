"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Menu,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import { useFocusStore } from "@/store/focusStore";
import { useTaskStore } from "@/store/taskStore";

export default function FocusPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [today, setToday] = useState("");

  // Focus store
  const mode = useFocusStore((state) => state.mode);

  const remainingSeconds = useFocusStore(
    (state) => state.remainingSeconds
  );

  const isRunning = useFocusStore(
    (state) => state.isRunning
  );

  const completedSessions = useFocusStore(
    (state) => state.completedSessions
  );

  const selectedTaskId = useFocusStore(
    (state) => state.selectedTaskId
  );

  const start = useFocusStore((state) => state.start);
  const pause = useFocusStore((state) => state.pause);
  const reset = useFocusStore((state) => state.reset);
  const setMode = useFocusStore((state) => state.setMode);

  const setTestDuration = useFocusStore(
    (state) => state.setTestDuration
  );

  const setSelectedTask = useFocusStore(
    (state) => state.setSelectedTask
  );

  // Task store
  const tasks = useTaskStore((state) => state.tasks);

  // Get today's date after mount
  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  // Today's incomplete tasks
  const todayTasks = useMemo(() => {
    return tasks
      .filter(
        (task) =>
          task.date === today &&
          !task.completed
      )
      .sort((a, b) =>
        (a.startTime ?? "").localeCompare(
          b.startTime ?? ""
        )
      );
  }, [tasks, today]);

  // Currently selected task
  const selectedTask = useMemo(() => {
    return todayTasks.find(
      (task) => task.id === selectedTaskId
    );
  }, [todayTasks, selectedTaskId]);

  // Remove selected task if it no longer exists
  useEffect(() => {
    if (
      selectedTaskId &&
      !todayTasks.some(
        (task) => task.id === selectedTaskId
      )
    ) {
      setSelectedTask(null);
    }
  }, [
    selectedTaskId,
    todayTasks,
    setSelectedTask,
  ]);

  // Timer
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      const current = useFocusStore.getState();

      if (current.remainingSeconds <= 1) {
        current.completeSession();
        return;
      }

      useFocusStore.setState({
        remainingSeconds:
          current.remainingSeconds - 1,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const minutes = Math.floor(
    remainingSeconds / 60
  );

  const seconds = remainingSeconds % 60;

  const formattedTime = `${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;

  const modeLabel =
    mode === "focus"
      ? "Focus Session"
      : mode === "shortBreak"
        ? "Short Break"
        : "Long Break";

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} />

        {/* Main Area */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-white/10 px-5 md:px-8">
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
                  Personal OS
                </p>

                <p className="text-sm font-medium text-zinc-300">
                  Focus
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft size={15} />
              Dashboard
            </Link>
          </header>

          {/* Content */}
          <div className="flex flex-1 items-center justify-center overflow-y-auto p-5 md:p-8">
            <div className="w-full max-w-2xl">
              {/* Heading */}
              <div className="text-center">
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-600">
                  Focus Mode
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  {modeLabel}
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                  Stay focused and make progress.
                </p>
              </div>

              {/* Task Selector */}
              {mode === "focus" && (
                <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-zinc-500"
                    />

                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
                      Focus Task
                    </p>
                  </div>

                  {todayTasks.length > 0 ? (
                    <>
                      <select
                        value={selectedTaskId ?? ""}
                        onChange={(event) => {
                          const taskId =
                            event.target.value;

                          const task =
                            todayTasks.find(
                              (item) =>
                                item.id === taskId
                            );

                          setSelectedTask(
                            taskId || null,
                            task?.title ?? null
                          );
                        }}
                        disabled={isRunning}
                        className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-zinc-300 outline-none transition focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option
                          value=""
                          className="bg-[#111113]"
                        >
                          Select a task to focus on
                        </option>

                        {todayTasks.map((task) => (
                          <option
                            key={task.id}
                            value={task.id}
                            className="bg-[#111113]"
                          >
                            {task.startTime
                              ? `${task.startTime} · `
                              : ""}
                            {task.title}
                          </option>
                        ))}
                      </select>

                      {selectedTask && (
                        <div className="mt-3 rounded-xl bg-white/[0.03] px-3 py-2">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">
                            Focusing on
                          </p>

                          <p className="mt-1 truncate text-sm font-medium text-zinc-300">
                            {selectedTask.title}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center">
                      <p className="text-sm text-zinc-500">
                        No incomplete tasks for today.
                      </p>

                      <Link
                        href="/tasks"
                        className="mt-2 inline-block text-xs text-zinc-400 transition hover:text-white"
                      >
                        Create a task →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Timer */}
              <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 md:p-12">
                <div className="flex flex-col items-center">
                  {/* Mode Selector */}
                  <div className="flex rounded-2xl border border-white/10 bg-black/20 p-1">
                    <ModeButton
                      active={mode === "focus"}
                      onClick={() =>
                        setMode("focus")
                      }
                    >
                      Focus
                    </ModeButton>

                    <ModeButton
                      active={mode === "shortBreak"}
                      onClick={() =>
                        setMode("shortBreak")
                      }
                    >
                      Short Break
                    </ModeButton>

                    <ModeButton
                      active={mode === "longBreak"}
                      onClick={() =>
                        setMode("longBreak")
                      }
                    >
                      Long Break
                    </ModeButton>
                  </div>

                  {/* Selected Task */}
                  {mode === "focus" &&
                    selectedTask && (
                      <div className="mt-8 flex max-w-md items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
                        <CheckCircle2
                          size={15}
                          className="shrink-0 text-zinc-500"
                        />

                        <span className="truncate text-xs text-zinc-400">
                          {selectedTask.title}
                        </span>
                      </div>
                    )}

                  {/* Time */}
                  <div className="mt-10">
                    <p className="font-mono text-7xl font-semibold tracking-tight md:text-9xl">
                      {formattedTime}
                    </p>
                  </div>

                  {/* Status */}
                  <p className="mt-5 text-xs uppercase tracking-[0.2em] text-zinc-600">
                    {isRunning
                      ? "Session Running"
                      : "Ready"}
                  </p>

                  {/* Controls */}
                  <div className="mt-8 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={
                        isRunning ? pause : start
                      }
                      disabled={
                        mode === "focus" &&
                        !selectedTaskId
                      }
                      className="flex h-12 items-center gap-2 rounded-2xl bg-white px-6 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isRunning ? (
                        <Pause size={17} />
                      ) : (
                        <Play size={17} />
                      )}

                      {isRunning
                        ? "Pause"
                        : "Start"}
                    </button>

                    <button
                      type="button"
                      onClick={reset}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:bg-white/5 hover:text-white"
                      aria-label="Reset timer"
                      title="Reset timer"
                    >
                      <RotateCcw size={17} />
                    </button>
                  </div>

                  {/* Developer Test Control */}
                  <button
                    type="button"
                    onClick={() =>
                      setTestDuration(10)
                    }
                    className="mt-4 text-xs text-zinc-600 transition hover:text-zinc-300"
                  >
                    Test 10s
                  </button>
                </div>
              </div>

              {/* Session Stats */}
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                  <p className="text-xs text-zinc-600">
                    Completed Sessions
                  </p>

                  <p className="mt-2 text-3xl font-semibold">
                    {completedSessions}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                  <p className="text-xs text-zinc-600">
                    Current Mode
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    {mode === "focus"
                      ? "Focus"
                      : mode === "shortBreak"
                        ? "Short Break"
                        : "Long Break"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-xs transition md:px-4 ${
        active
          ? "bg-white text-black"
          : "text-zinc-500 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}