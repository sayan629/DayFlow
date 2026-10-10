"use client";

import {
  CheckCircle2,
  Clock3,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Target,
  Timer,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useMemo,
} from "react";
import { subDays } from "date-fns";

import { useScheduler } from "@/hooks/useScheduler";
import {
  getTaskFocusStats,
  useFocusStore,
} from "@/store/focusStore";
import { useTaskStore } from "@/store/taskStore";

function FocusPageContent() {
  const searchParams = useSearchParams();

  const taskIdFromUrl =
    searchParams.get("taskId");

  const now = useScheduler();

  const today = now
    ? now.toISOString().split("T")[0]
    : null;

  // --------------------------------------------------
  // Focus store
  // --------------------------------------------------

  const mode = useFocusStore(
    (state) => state.mode
  );

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

  const sessionHistory = useFocusStore(
    (state) => state.sessionHistory
  );

  const start = useFocusStore(
    (state) => state.start
  );

  const pause = useFocusStore(
    (state) => state.pause
  );

  const reset = useFocusStore(
    (state) => state.reset
  );

  const setMode = useFocusStore(
    (state) => state.setMode
  );

  const setTestDuration = useFocusStore(
    (state) => state.setTestDuration
  );

  const setSelectedTask = useFocusStore(
    (state) => state.setSelectedTask
  );

  const clearSessionHistory = useFocusStore(
    (state) => state.clearSessionHistory
  );

  // --------------------------------------------------
  // Task store
  // --------------------------------------------------

  const tasks = useTaskStore(
    (state) => state.tasks
  );

  const updateTask = useTaskStore(
    (state) => state.updateTask
  );

  // --------------------------------------------------
  // Today's incomplete tasks
  // --------------------------------------------------

  const todayTasks = useMemo(() => {
    if (!today) {
      return [];
    }

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

  // --------------------------------------------------
  // Currently selected task
  // --------------------------------------------------

  const selectedTask = useMemo(() => {
    return todayTasks.find(
      (task) => task.id === selectedTaskId
    );
  }, [todayTasks, selectedTaskId]);

  // --------------------------------------------------
  // Automatically select task from URL
  // --------------------------------------------------

  useEffect(() => {
    if (!taskIdFromUrl) {
      return;
    }

    const taskFromUrl = todayTasks.find(
      (task) => task.id === taskIdFromUrl
    );

    if (
      taskFromUrl &&
      selectedTaskId !== taskFromUrl.id
    ) {
      setSelectedTask(
        taskFromUrl.id,
        taskFromUrl.title
      );
    }
  }, [
    taskIdFromUrl,
    todayTasks,
    selectedTaskId,
    setSelectedTask,
  ]);

  // --------------------------------------------------
  // Remove selected task if completed/deleted
  // --------------------------------------------------

  useEffect(() => {
    if (
      selectedTaskId &&
      !todayTasks.some(
        (task) => task.id === selectedTaskId
      )
    ) {
      setSelectedTask(null, null);
    }
  }, [
    selectedTaskId,
    todayTasks,
    setSelectedTask,
  ]);

  // --------------------------------------------------
  // Timer
  // --------------------------------------------------

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      const current =
        useFocusStore.getState();

      if (
        current.remainingSeconds <= 1
      ) {
        // Focus session completed

        if (
          current.mode === "focus" &&
          current.selectedTaskId
        ) {
          updateTask(
            current.selectedTaskId,
            {
              completed: true,
            }
          );
        }

        // Save session and move to break.
        current.completeSession();

        return;
      }

      useFocusStore.setState({
        remainingSeconds:
          current.remainingSeconds - 1,
      });
    }, 1000);

    return () =>
      clearInterval(interval);
  }, [isRunning, updateTask]);

  // --------------------------------------------------
  // Timer formatting
  // --------------------------------------------------

  const minutes = Math.floor(
    remainingSeconds / 60
  );

  const seconds =
    remainingSeconds % 60;

  const formattedTime = `${String(
    minutes
  ).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  // --------------------------------------------------
  // Mode label
  // --------------------------------------------------

  const modeLabel =
    mode === "focus"
      ? "Focus Session"
      : mode === "shortBreak"
        ? "Short Break"
        : "Long Break";

  // --------------------------------------------------
  // Latest completed session
  // --------------------------------------------------

  const latestCompletedSession =
    sessionHistory[0] ?? null;

  const showCompletionCard =
    mode !== "focus" &&
    latestCompletedSession?.mode ===
      "focus";

  // --------------------------------------------------
  // Productivity statistics
  // --------------------------------------------------

  const todaySessions = useMemo(() => {
    if (!today) {
      return [];
    }

    return sessionHistory.filter(
      (session) =>
        session.mode === "focus" &&
        session.completedAt.startsWith(today)
    );
  }, [sessionHistory, today]);

  const todayFocusSeconds =
    useMemo(() => {
      return todaySessions.reduce(
        (total, session) =>
          total + session.durationSeconds,
        0
      );
    }, [todaySessions]);

  const todayFocusTime = useMemo(() => {
    const totalMinutes =
      Math.floor(
        todayFocusSeconds / 60
      );

    const hours = Math.floor(
      totalMinutes / 60
    );

    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  }, [todayFocusSeconds]);

  const completedToday = useMemo(() => {
    if (!today) {
      return 0;
    }

    return tasks.filter(
      (task) =>
        task.date === today &&
        task.completed
    ).length;
  }, [tasks, today]);

  // --------------------------------------------------
  // Focus streak
  // --------------------------------------------------

  const focusStreak = useMemo(() => {
    if (
      sessionHistory.length === 0 ||
      !now
    ) {
      return 0;
    }

    const completedDates = new Set(
      sessionHistory
        .filter(
          (session) =>
            session.mode === "focus"
        )
        .map(
          (session) =>
            session.completedAt.split("T")[0]
        )
    );

    let streak = 0;

    let date = now;

    const todayKey = date
      .toISOString()
      .split("T")[0];

    if (!completedDates.has(todayKey)) {
      date = subDays(date, 1);
    }

    while (true) {
      const key = date
        .toISOString()
        .split("T")[0];

      if (!completedDates.has(key)) {
        break;
      }

      streak += 1;

      date = subDays(date, 1);
    }

    return streak;
  }, [sessionHistory, now]);

  // --------------------------------------------------
  // Statistics cards
  // --------------------------------------------------

  const stats = [
    {
      label: "Focus Time",
      value: todayFocusTime,
      icon: Timer,
      description: "Today",
    },
    {
      label: "Sessions",
      value: todaySessions.length,
      icon: Target,
      description: "Completed today",
    },
    {
      label: "Tasks Done",
      value: completedToday,
      icon: CheckCircle2,
      description: "Scheduled today",
    },
    {
      label: "Focus Streak",
      value: focusStreak,
      icon: Flame,
      description:
        focusStreak === 1
          ? "day"
          : "days",
    },
  ];

  // --------------------------------------------------
  // Focus Analytics
  // --------------------------------------------------

  const taskFocusAnalytics = useMemo(() => {
    const taskMap = new Map<
      string,
      {
        taskId: string;
        taskTitle: string;
        sessions: number;
        totalSeconds: number;
        lastFocusedAt: string | null;
      }
    >();

    sessionHistory
      .filter(
        (session) =>
          session.mode === "focus" &&
          session.taskId
      )
      .forEach((session) => {
        const taskId = session.taskId!;

        if (!taskMap.has(taskId)) {
          const taskStats =
            getTaskFocusStats(
              sessionHistory,
              taskId
            );

          if (taskStats) {
            taskMap.set(
              taskId,
              taskStats
            );
          }
        }
      });

    return Array.from(
      taskMap.values()
    ).sort(
      (a, b) =>
        b.totalSeconds -
        a.totalSeconds
    );
  }, [sessionHistory]);

  const totalFocusSeconds = useMemo(
    () =>
      sessionHistory
        .filter(
          (session) =>
            session.mode === "focus"
        )
        .reduce(
          (total, session) =>
            total +
            session.durationSeconds,
          0
        ),
    [sessionHistory]
  );

  const totalFocusTime = useMemo(() => {
    const totalMinutes = Math.floor(
      totalFocusSeconds / 60
    );

    const hours = Math.floor(
      totalMinutes / 60
    );

    const minutes =
      totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  }, [totalFocusSeconds]);

  const mostFocusedTask =
    taskFocusAnalytics[0] ?? null;

  const formatAnalyticsTime = (
    seconds: number
  ) => {
    const totalMinutes = Math.floor(
      seconds / 60
    );

    const hours = Math.floor(
      totalMinutes / 60
    );

    const minutes =
      totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  };

  // --------------------------------------------------
  // Wait for scheduler
  // --------------------------------------------------

  if (!now) {
    return null;
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="flex min-h-screen">
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Content */}

          <div className="flex-1 overflow-y-auto p-5 md:p-8">
            <div className="mx-auto w-full max-w-2xl">
              {/* Heading */}

              <div className="text-center">
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-600">
                  Focus Mode
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  {modeLabel}
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                  Stay focused and make
                  progress.
                </p>
              </div>

              {/* Focus Session Completion */}

              {showCompletionCard &&
                latestCompletedSession && (
                  <div className="mt-8 overflow-hidden rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.04]">
                    <div className="border-b border-emerald-400/10 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                          <CheckCircle2
                            size={19}
                            className="text-emerald-400"
                          />
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/70">
                            Session Complete
                          </p>

                          <h2 className="mt-1 text-sm font-semibold text-white">
                            Focus session
                            completed
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-sm text-zinc-300">
                        Great work. You
                        completed:
                      </p>

                      <p className="mt-2 truncate text-base font-semibold text-white">
                        {latestCompletedSession.taskTitle ??
                          "Focus Session"}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                            Session
                          </p>

                          <p className="mt-1 font-mono text-sm text-zinc-300">
                            {Math.floor(
                              latestCompletedSession.durationSeconds /
                                60
                            )}
                            m{" "}
                            {String(
                              latestCompletedSession.durationSeconds %
                                60
                            ).padStart(
                              2,
                              "0"
                            )}
                            s
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                            Next
                          </p>

                          <p className="mt-1 text-sm font-medium text-zinc-300">
                            {mode ===
                            "shortBreak"
                              ? "5 min break"
                              : "15 min break"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <button
                          type="button"
                          onClick={start}
                          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-medium text-black transition hover:bg-zinc-200"
                        >
                          <Play size={16} />
                          Start Break
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setMode("focus")
                          }
                          className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
                        >
                          Skip Break
                        </button>
                      </div>
                    </div>
                  </div>
                )}

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
                        value={
                          selectedTaskId ??
                          ""
                        }
                        onChange={(event) => {
                          const taskId =
                            event.target.value;

                          const task =
                            todayTasks.find(
                              (item) =>
                                item.id ===
                                taskId
                            );

                          setSelectedTask(
                            taskId || null,
                            task?.title ??
                              null
                          );
                        }}
                        disabled={isRunning}
                        className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-zinc-300 outline-none transition focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option
                          value=""
                          className="bg-[#111113]"
                        >
                          Select a task to
                          focus on
                        </option>

                        {todayTasks.map(
                          (task) => (
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
                          )
                        )}
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
                        No incomplete tasks
                        for today.
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
                      active={
                        mode === "focus"
                      }
                      onClick={() =>
                        setMode("focus")
                      }
                    >
                      Focus
                    </ModeButton>

                    <ModeButton
                      active={
                        mode ===
                        "shortBreak"
                      }
                      onClick={() =>
                        setMode(
                          "shortBreak"
                        )
                      }
                    >
                      Short Break
                    </ModeButton>

                    <ModeButton
                      active={
                        mode ===
                        "longBreak"
                      }
                      onClick={() =>
                        setMode(
                          "longBreak"
                        )
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
                        isRunning
                          ? pause
                          : start
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
                      <RotateCcw
                        size={17}
                      />
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

              {/* Productivity Statistics */}

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-zinc-600">
                          {stat.label}
                        </p>

                        <Icon
                          size={15}
                          className="text-zinc-700"
                        />
                      </div>

                      <p className="mt-3 text-2xl font-semibold tracking-tight">
                        {stat.value}
                      </p>

                      <p className="mt-1 text-[10px] text-zinc-700">
                        {stat.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Session Stats */}

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                  <p className="text-xs text-zinc-600">
                    Total Completed
                    Sessions
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
                      : mode ===
                          "shortBreak"
                        ? "Short Break"
                        : "Long Break"}
                  </p>
                </div>
              </div>

              {/* Focus Analytics */}

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    Focus Analytics
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Your focus performance
                    across completed
                    sessions.
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-zinc-600">
                        Total Focus Time
                      </p>

                      <Timer
                        size={15}
                        className="text-zinc-700"
                      />
                    </div>

                    <p className="mt-3 text-2xl font-semibold tracking-tight">
                      {totalFocusTime}
                    </p>

                    <p className="mt-1 text-[10px] text-zinc-700">
                      All completed
                      sessions
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-zinc-600">
                        Total Sessions
                      </p>

                      <Target
                        size={15}
                        className="text-zinc-700"
                      />
                    </div>

                    <p className="mt-3 text-2xl font-semibold tracking-tight">
                      {
                        sessionHistory.filter(
                          (session) =>
                            session.mode ===
                            "focus"
                        ).length
                      }
                    </p>

                    <p className="mt-1 text-[10px] text-zinc-700">
                      Completed focus
                      sessions
                    </p>
                  </div>
                </div>

                {mostFocusedTask && (
                  <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                      Most Focused Task
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-300">
                          {
                            mostFocusedTask.taskTitle
                          }
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                          {
                            mostFocusedTask.sessions
                          }{" "}
                          {mostFocusedTask.sessions ===
                          1
                            ? "session"
                            : "sessions"}
                        </p>
                      </div>

                      <p className="shrink-0 font-mono text-sm text-zinc-400">
                        {formatAnalyticsTime(
                          mostFocusedTask.totalSeconds
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {taskFocusAnalytics.length >
                0 ? (
                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-medium text-zinc-400">
                        Task Breakdown
                      </p>

                      <p className="text-[10px] text-zinc-700">
                        {
                          taskFocusAnalytics.length
                        }{" "}
                        {taskFocusAnalytics.length ===
                        1
                          ? "task"
                          : "tasks"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {taskFocusAnalytics.map(
                        (taskStats) => {
                          const percentage =
                            totalFocusSeconds >
                            0
                              ? Math.round(
                                  (taskStats.totalSeconds /
                                    totalFocusSeconds) *
                                    100
                                )
                              : 0;

                          return (
                            <div
                              key={
                                taskStats.taskId
                              }
                              className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-zinc-300">
                                    {
                                      taskStats.taskTitle
                                    }
                                  </p>

                                  <p className="mt-1 text-[11px] text-zinc-600">
                                    {
                                      taskStats.sessions
                                    }{" "}
                                    {taskStats.sessions ===
                                    1
                                      ? "session"
                                      : "sessions"}{" "}
                                    ·{" "}
                                    {percentage}%
                                    of focus
                                    time
                                  </p>
                                </div>

                                <p className="shrink-0 font-mono text-xs text-zinc-400">
                                  {formatAnalyticsTime(
                                    taskStats.totalSeconds
                                  )}
                                </p>
                              </div>

                              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                                <div
                                  className="h-full rounded-full bg-white/30 transition-all"
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center">
                    <Target
                      size={20}
                      className="mx-auto text-zinc-700"
                    />

                    <p className="mt-3 text-sm text-zinc-500">
                      No task analytics
                      yet.
                    </p>

                    <p className="mt-1 text-xs text-zinc-700">
                      Complete a focus
                      session linked to
                      a task to see
                      analytics here.
                    </p>
                  </div>
                )}
              </div>

              {/* Focus History */}

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      Focus History
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Your completed focus
                      sessions.
                    </p>
                  </div>

                  {sessionHistory.length >
                    0 && (
                    <button
                      type="button"
                      onClick={
                        clearSessionHistory
                      }
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                      Clear
                    </button>
                  )}
                </div>

                {sessionHistory.length ===
                0 ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center">
                    <Clock3
                      size={22}
                      className="mx-auto text-zinc-700"
                    />

                    <p className="mt-3 text-sm text-zinc-500">
                      No focus sessions
                      yet.
                    </p>

                    <p className="mt-1 text-xs text-zinc-700">
                      Complete a focus
                      session and it
                      will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-2">
                    {sessionHistory.map(
                      (session) => {
                        const durationMinutes =
                          Math.floor(
                            session.durationSeconds /
                              60
                          );

                        const durationSeconds =
                          session.durationSeconds %
                          60;

                        const completedAt =
                          new Date(
                            session.completedAt
                          );

                        return (
                          <div
                            key={
                              session.id
                            }
                            className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <CheckCircle2
                                  size={15}
                                  className="shrink-0 text-zinc-600"
                                />

                                <p className="truncate text-sm font-medium text-zinc-300">
                                  {session.taskTitle ??
                                    "Focus Session"}
                                </p>
                              </div>

                              <p className="mt-1 pl-6 text-[11px] text-zinc-600">
                                {completedAt.toLocaleDateString(
                                  undefined,
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}{" "}
                                ·{" "}
                                {completedAt.toLocaleTimeString(
                                  undefined,
                                  {
                                    hour: "2-digit",
                                    minute:
                                      "2-digit",
                                  }
                                )}
                              </p>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="font-mono text-xs text-zinc-400">
                                {durationMinutes}
                                m{" "}
                                {String(
                                  durationSeconds
                                ).padStart(
                                  2,
                                  "0"
                                )}
                                s
                              </p>

                              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-zinc-700">
                                Focus
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
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

export default function FocusPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#09090b] text-white">
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-sm text-zinc-500">
              Loading Focus...
            </div>
          </div>
        </main>
      }
    >
      <FocusPageContent />
    </Suspense>
  );
}