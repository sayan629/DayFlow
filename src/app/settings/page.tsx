"use client";

import {
  Check,
  Flame,
  ListChecks,
  Settings,
  Target,
} from "lucide-react";

import {
  StreakMode,
  usePreferencesStore,
} from "@/store/preferencesStore";

const streakOptions: {
  value: StreakMode;
  title: string;
  description: string;
  icon: typeof Flame;
}[] = [
  {
    value: "activity",
    title: "Activity",
    description:
      "Completed tasks and focus sessions both count.",
    icon: Flame,
  },
  {
    value: "tasks",
    title: "Tasks",
    description:
      "Only completed tasks count toward your streak.",
    icon: ListChecks,
  },
  {
    value: "focus",
    title: "Focus",
    description:
      "Only completed focus sessions count toward your streak.",
    icon: Target,
  },
];

export default function SettingsPage() {
  const streakMode = usePreferencesStore(
    (state) => state.streakMode
  );

  const setStreakMode = usePreferencesStore(
    (state) => state.setStreakMode
  );

  return (
    <main className="min-h-full bg-[#09090b] p-5 text-white md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06]">
            <Settings size={20} />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Settings
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Customize how DayFlow tracks your productivity.
          </p>
        </div>

        {/* Streak */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Flame
                size={18}
                className="text-orange-400"
              />

              <h2 className="text-sm font-semibold text-white">
                Streak
              </h2>
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              Choose what should count as a productive day.
            </p>
          </div>

          <div className="space-y-3">
            {streakOptions.map((option) => {
              const Icon = option.icon;
              const selected =
                streakMode === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setStreakMode(option.value)
                  }
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-white/20 bg-white/[0.07]"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      selected
                        ? "bg-white text-black"
                        : "bg-white/[0.06] text-zinc-400"
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">
                      {option.title}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {option.description}
                    </p>
                  </div>

                  {selected && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-black">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}