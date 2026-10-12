"use client";

import {
  Bell,
  Check,
  Clock,
  Flame,
  ListChecks,
  Settings,
  Target,
  Volume2,
} from "lucide-react";

import {
  StreakMode,
  usePreferencesStore,
} from "@/store/preferencesStore";

import { useSettingsStore } from "@/store/settingsStore";

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

const focusDurationOptions = [15, 25, 50, 90];

export default function SettingsPage() {
  const streakMode = usePreferencesStore(
    (state) => state.streakMode
  );

  const setStreakMode = usePreferencesStore(
    (state) => state.setStreakMode
  );

  const notificationsEnabled = useSettingsStore(
    (state) => state.notificationsEnabled
  );

  const alarmSoundEnabled = useSettingsStore(
    (state) => state.alarmSoundEnabled
  );

  const defaultSnoozeMinutes = useSettingsStore(
    (state) => state.defaultSnoozeMinutes
  );

  const defaultFocusMinutes = useSettingsStore(
    (state) => state.defaultFocusMinutes
  );

  const setNotificationsEnabled = useSettingsStore(
    (state) => state.setNotificationsEnabled
  );

  const setAlarmSoundEnabled = useSettingsStore(
    (state) => state.setAlarmSoundEnabled
  );

  const setDefaultSnoozeMinutes = useSettingsStore(
    (state) => state.setDefaultSnoozeMinutes
  );

  const setDefaultFocusMinutes = useSettingsStore(
    (state) => state.setDefaultFocusMinutes
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
            Customize how DayFlow works for you.
          </p>
        </div>

        {/* ------------------------------------------------------ */}
        {/* Streak                                                  */}
        {/* ------------------------------------------------------ */}

        <section className="mb-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
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

        {/* ------------------------------------------------------ */}
        {/* Alarms                                                   */}
        {/* ------------------------------------------------------ */}

        <section className="mb-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Bell
                size={18}
                className="text-zinc-300"
              />

              <h2 className="text-sm font-semibold text-white">
                Alarms
              </h2>
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              Control how DayFlow handles scheduled alarms.
            </p>
          </div>

          <div className="space-y-3">
            {/* Notifications */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-400">
                  <Bell size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Notifications
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Show a desktop notification when an alarm triggers.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={notificationsEnabled}
                onClick={() =>
                  setNotificationsEnabled(
                    !notificationsEnabled
                  )
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  notificationsEnabled
                    ? "bg-white"
                    : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full transition ${
                    notificationsEnabled
                      ? "left-6 bg-black"
                      : "left-1 bg-zinc-500"
                  }`}
                />
              </button>
            </div>

            {/* Alarm Sound */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-400">
                  <Volume2 size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Alarm Sound
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Play the alarm sound when a scheduled alarm starts.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={alarmSoundEnabled}
                onClick={() =>
                  setAlarmSoundEnabled(
                    !alarmSoundEnabled
                  )
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  alarmSoundEnabled
                    ? "bg-white"
                    : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full transition ${
                    alarmSoundEnabled
                      ? "left-6 bg-black"
                      : "left-1 bg-zinc-500"
                  }`}
                />
              </button>
            </div>

            {/* Snooze */}
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Default Snooze
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Choose the default snooze duration.
                </p>
              </div>

              <div className="flex gap-2">
                {[5, 10, 15].map((minutes) => {
                  const selected =
                    defaultSnoozeMinutes === minutes;

                  return (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() =>
                        setDefaultSnoozeMinutes(
                          minutes
                        )
                      }
                      className={`rounded-xl border px-4 py-2 text-xs font-medium transition ${
                        selected
                          ? "border-white/20 bg-white text-black"
                          : "border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      {minutes} min
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ */}
        {/* Focus                                                     */}
        {/* ------------------------------------------------------ */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Clock
                size={18}
                className="text-zinc-300"
              />

              <h2 className="text-sm font-semibold text-white">
                Focus
              </h2>
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              Choose the default duration for Focus sessions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {focusDurationOptions.map((minutes) => {
              const selected =
                defaultFocusMinutes === minutes;

              return (
                <button
                  key={minutes}
                  type="button"
                  onClick={() =>
                    setDefaultFocusMinutes(minutes)
                  }
                  className={`rounded-xl border px-5 py-3 text-xs font-medium transition ${
                    selected
                      ? "border-white/20 bg-white text-black"
                      : "border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {minutes} min
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}