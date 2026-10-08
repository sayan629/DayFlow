"use client";

import {
  ArrowLeft,
  Menu,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import { useFocusStore } from "@/store/focusStore";

export default function FocusPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const start = useFocusStore((state) => state.start);
  const pause = useFocusStore((state) => state.pause);
  const reset = useFocusStore((state) => state.reset);
  const setMode = useFocusStore((state) => state.setMode);

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
                  Personal OS
                </p>

                <p className="text-sm font-medium text-zinc-300">
                  Focus
                </p>
              </div>
            </div>

            {/* Right */}
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

              {/* Timer */}
              <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 md:p-12">
                <div className="flex flex-col items-center">
                  {/* Mode Selector */}
                  <div className="flex rounded-2xl border border-white/10 bg-black/20 p-1">
                    <ModeButton
                      active={mode === "focus"}
                      onClick={() => setMode("focus")}
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

                  {/* Time */}
                  <div className="mt-12">
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
                      className="flex h-12 items-center gap-2 rounded-2xl bg-white px-6 text-sm font-medium text-black transition hover:bg-zinc-200"
                    >
                      {isRunning ? (
                        <Pause size={17} />
                      ) : (
                        <Play size={17} />
                      )}

                      {isRunning ? "Pause" : "Start"}
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