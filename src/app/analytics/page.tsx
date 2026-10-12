"use client";

import {
  BarChart3,
  Bell,
  CheckCircle2,
  Clock3,
  Flame,
  History,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useScheduler } from "@/hooks/useScheduler";
import {
  useFocusStore,
} from "@/store/focusStore";
import {
  useAlarmStore,
  type AlarmHistoryItem,
} from "@/store/alarmStore";
import { useTaskStore } from "@/store/taskStore";

const CATEGORY_LABELS: Record<string, string> = {
  study: "Study",
  development: "Development",
  personal: "Personal",
  fitness: "Fitness",
  other: "Other",
};

function AnalyticsMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-600">
          {label}
        </span>

        <span className="text-zinc-600">
          {icon}
        </span>
      </div>

      <div className="mt-3 text-2xl font-semibold tracking-tight text-white">
        {value}
      </div>
    </div>
  );
}

function formatAlarmTime(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getAlarmResponseLabel(
  alarm: AlarmHistoryItem
) {
  if (alarm.status === "snoozed") {
    return "Snoozed";
  }

  if (
    alarm.status !== "stopped" ||
    !alarm.stoppedAt
  ) {
    return "Stopped";
  }

  const triggeredAt = new Date(
    alarm.triggeredAt
  ).getTime();

  const stoppedAt = new Date(
    alarm.stoppedAt
  ).getTime();

  if (
    Number.isNaN(triggeredAt) ||
    Number.isNaN(stoppedAt) ||
    stoppedAt < triggeredAt
  ) {
    return "Stopped";
  }

  const minutes = Math.round(
    (stoppedAt - triggeredAt) / 60000
  );

  if (minutes < 1) {
    return "Responded in < 1m";
  }

  return `Responded in ${minutes}m`;
}

export default function AnalyticsPage() {
  const router = useRouter();

  const now = useScheduler();

  const tasks = useTaskStore(
    (state) => state.tasks
  );

  const sessionHistory = useFocusStore(
    (state) => state.sessionHistory
  );

  const alarmHistory = useAlarmStore(
    (state) => state.history
  );

  const loadSessionHistory = useFocusStore(
    (state) => state.loadSessionHistory
  );

  const loadAlarmHistory = useAlarmStore(
    (state) => state.loadHistory
  );

  useEffect(() => {
    void loadSessionHistory();
    void loadAlarmHistory();
  }, [
    loadSessionHistory,
    loadAlarmHistory,
  ]);

  const analytics = useMemo(() => {
    if (!now) {
      return {
        todayTasks: [],
        completedToday: 0,
        totalToday: 0,
        completionRate: 0,
        focusMinutes: 0,
        focusSessions: 0,
        streak: 0,
        weeklyActivity: [],
        categoryStats: [],
        priorityStats: [],
        mostFocusedTasks: [],
        stoppedAlarms: [],
        snoozedAlarms: [],
        alarmResponseTimes: [],
        averageAlarmResponse: null,
        fastestAlarmResponse: null,
        slowestAlarmResponse: null,
        formatAlarmResponse: () => "—",
        alarmHandlingRate: 0,
        snoozeRate: 0,
        alarmDisciplineScore: null,
        alarmDisciplineLabel: "No data",
        last7AlarmDays: [],
        maxAlarmActivity: 1,
        alarmInsight: "No alarm activity yet.",
        mostActiveAlarmDay: null,
        recentAlarms:
          [] as AlarmHistoryItem[],
      };
    }

    const today =
      now.toISOString().split("T")[0];

    // -----------------------------
    // Today's Tasks
    // -----------------------------

    const todayTasks = tasks.filter(
      (task) => task.date === today
    );

    const completedToday =
      todayTasks.filter(
        (task) => task.completed
      ).length;

    const totalToday =
      todayTasks.length;

    const completionRate =
      totalToday > 0
        ? Math.round(
            (completedToday /
              totalToday) *
              100
          )
        : 0;

    // -----------------------------
    // Today's Focus
    // -----------------------------

    const todaySessions =
      sessionHistory.filter((session) => {
        const completedAt = new Date(
          session.completedAt
        );

        return (
          completedAt
            .toISOString()
            .split("T")[0] === today
        );
      });

    const focusMinutes = Math.round(
      todaySessions.reduce(
        (total, session) =>
          total +
          session.durationSeconds / 60,
        0
      )
    );

    const focusSessions =
      todaySessions.length;

    // -----------------------------
    // 7-Day Activity
    // -----------------------------

    const weeklyActivity = Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date(
          now.getTime()
        );

        date.setDate(
          date.getDate() -
            (6 - index)
        );

        const dateString =
          date
            .toISOString()
            .split("T")[0];

        const dayTasks =
          tasks.filter(
            (task) =>
              task.date === dateString
          );

        const completed =
          dayTasks.filter(
            (task) =>
              task.completed
          ).length;

        const daySessions =
          sessionHistory.filter(
            (session) => {
              const completedAt =
                new Date(
                  session.completedAt
                );

              return (
                completedAt
                  .toISOString()
                  .split("T")[0] ===
                dateString
              );
            }
          );

        const dayFocusMinutes =
          Math.round(
            daySessions.reduce(
              (
                total,
                session
              ) =>
                total +
                session.durationSeconds /
                  60,
              0
            )
          );

        return {
          date: dateString,
          label:
            date.toLocaleDateString(
              "en-US",
              {
                weekday: "short",
              }
            ),
          total: dayTasks.length,
          completed,
          focusMinutes:
            dayFocusMinutes,
          active:
            completed > 0 ||
            dayFocusMinutes > 0,
        };
      }
    );

    // -----------------------------
    // Productivity Streak
    // -----------------------------

    let streak = 0;

    for (
      let index =
        weeklyActivity.length - 1;
      index >= 0;
      index--
    ) {
      if (
        !weeklyActivity[index].active
      ) {
        break;
      }

      streak++;
    }

    // -----------------------------
    // Category Statistics
    // -----------------------------

    const categoryMap = new Map<
      string,
      {
        total: number;
        completed: number;
      }
    >();

    tasks.forEach((task) => {
      const current =
        categoryMap.get(
          task.category
        ) ?? {
          total: 0,
          completed: 0,
        };

      current.total++;

      if (task.completed) {
        current.completed++;
      }

      categoryMap.set(
        task.category,
        current
      );
    });

    const categoryStats =
      Array.from(
        categoryMap.entries()
      )
        .map(([category, stats]) => ({
          category,
          label:
            CATEGORY_LABELS[
              category
            ] ?? category,
          total: stats.total,
          completed:
            stats.completed,
          rate:
            stats.total > 0
              ? Math.round(
                  (stats.completed /
                    stats.total) *
                    100
                )
              : 0,
        }))
        .sort(
          (a, b) =>
            b.total - a.total
        );

    // -----------------------------
    // Priority Statistics
    // -----------------------------

    const priorityMap = new Map<
      string,
      {
        total: number;
        completed: number;
      }
    >();

    tasks.forEach((task) => {
      const current =
        priorityMap.get(
          task.priority
        ) ?? {
          total: 0,
          completed: 0,
        };

      current.total++;

      if (task.completed) {
        current.completed++;
      }

      priorityMap.set(
        task.priority,
        current
      );
    });

    const priorityStats =
      Array.from(
        priorityMap.entries()
      )
        .map(([priority, stats]) => ({
          priority,
          total: stats.total,
          completed:
            stats.completed,
          rate:
            stats.total > 0
              ? Math.round(
                  (stats.completed /
                    stats.total) *
                    100
                )
              : 0,
        }))
        .sort(
          (a, b) =>
            b.total - a.total
        );

    // -----------------------------
    // Most Focused Tasks
    // -----------------------------

    const mostFocusedTasks =
      tasks
        .map((task) => {
          const taskSessions =
            sessionHistory.filter(
              (session) =>
                session.taskId ===
                task.id
            );

          const minutes = Math.round(
            taskSessions.reduce(
              (
                total,
                session
              ) =>
                total +
                session.durationSeconds /
                  60,
              0
            )
          );

          return {
            task,
            sessions:
              taskSessions.length,
            minutes,
          };
        })
        .filter(
          (item) =>
            item.sessions > 0
        )
        .sort(
          (a, b) =>
            b.minutes - a.minutes
        )
        .slice(0, 5);

    // -----------------------------
    // Alarm Analytics
    // -----------------------------

    const stoppedAlarms =
      alarmHistory.filter(
        (alarm) =>
          alarm.status === "stopped"
      );

    const snoozedAlarms =
      alarmHistory.filter(
        (alarm) =>
          alarm.status === "snoozed"
      );

    const alarmResponseTimes =
      stoppedAlarms
        .map((alarm) => {
          if (!alarm.stoppedAt) {
            return null;
          }

          const triggeredAt =
            new Date(
              alarm.triggeredAt
            ).getTime();

          const stoppedAt =
            new Date(
              alarm.stoppedAt
            ).getTime();

          if (
            Number.isNaN(
              triggeredAt
            ) ||
            Number.isNaN(
              stoppedAt
            ) ||
            stoppedAt < triggeredAt
          ) {
            return null;
          }

          return Math.max(
            0,
            Math.round(
              (stoppedAt -
                triggeredAt) /
                60000
            )
          );
        })
        .filter(
          (
            value
          ): value is number =>
            value !== null
        );

    const averageAlarmResponse =
      alarmResponseTimes.length >
      0
        ? Math.round(
            alarmResponseTimes.reduce(
              (
                total,
                value
              ) =>
                total + value,
              0
            ) /
              alarmResponseTimes.length
          )
        : null;

    const fastestAlarmResponse =
      alarmResponseTimes.length >
      0
        ? Math.min(
            ...alarmResponseTimes
          )
        : null;

    const slowestAlarmResponse =
      alarmResponseTimes.length >
      0
        ? Math.max(
            ...alarmResponseTimes
          )
        : null;

    const formatAlarmResponse = (
      minutes: number | null
    ) => {
      if (minutes === null) {
        return "—";
      }

      if (minutes < 1) {
        return "< 1m";
      }

      if (minutes === 1) {
        return "1m";
      }

      return `${minutes}m`;
    };

    // -----------------------------
    // Alarm Discipline
    // -----------------------------

    const alarmCount =
      alarmHistory.length;

    const alarmHandlingRate =
      alarmCount > 0
        ? (stoppedAlarms.length /
            alarmCount) *
          100
        : 0;

    const snoozeRate =
      alarmCount > 0
        ? (snoozedAlarms.length /
            alarmCount) *
          100
        : 0;

    let responseScore = 100;

    if (
      averageAlarmResponse !==
      null
    ) {
      if (
        averageAlarmResponse <= 1
      ) {
        responseScore = 100;
      } else if (
        averageAlarmResponse <= 2
      ) {
        responseScore = 95;
      } else if (
        averageAlarmResponse <= 5
      ) {
        responseScore = 85;
      } else if (
        averageAlarmResponse <= 10
      ) {
        responseScore = 70;
      } else if (
        averageAlarmResponse <= 20
      ) {
        responseScore = 50;
      } else {
        responseScore = 30;
      }
    }

    const alarmDisciplineScore =
      alarmCount === 0
        ? null
        : Math.round(
            responseScore * 0.7 +
              alarmHandlingRate *
                0.3
          );

    const alarmDisciplineLabel =
      alarmDisciplineScore ===
      null
        ? "No data"
        : alarmDisciplineScore >=
            90
          ? "Excellent"
          : alarmDisciplineScore >=
              75
            ? "Good"
            : alarmDisciplineScore >=
                60
              ? "Fair"
              : "Needs improvement";

    // -----------------------------
    // 7-Day Alarm Activity
    // -----------------------------

    const last7AlarmDays =
      Array.from(
        { length: 7 },
        (_, index) => {
          const date = new Date(
            now.getTime()
          );

          date.setDate(
            date.getDate() -
              (6 - index)
          );

          const dateString =
            date
              .toISOString()
              .split("T")[0];

          const dayAlarms =
            alarmHistory.filter(
              (alarm) => {
                const alarmDate =
                  alarm.triggeredAt.split(
                    "T"
                  )[0];

                return (
                  alarmDate ===
                  dateString
                );
              }
            );

          const triggered =
            dayAlarms.length;

          const stopped =
            dayAlarms.filter(
              (alarm) =>
                alarm.status ===
                "stopped"
            ).length;

          const snoozed =
            dayAlarms.filter(
              (alarm) =>
                alarm.status ===
                "snoozed"
            ).length;

          return {
            date: dateString,
            label:
              date.toLocaleDateString(
                "en-US",
                {
                  weekday: "short",
                }
              ),
            triggered,
            stopped,
            snoozed,
          };
        }
      );

    const maxAlarmActivity =
      Math.max(
        ...last7AlarmDays.map(
          (day) =>
            day.triggered
        ),
        1
      );

    // -----------------------------
    // Alarm Insights
    // -----------------------------

    const mostActiveAlarmDay =
      last7AlarmDays.reduce(
        (best, day) =>
          day.triggered >
          best.triggered
            ? day
            : best,
        last7AlarmDays[0]
      );

    let alarmInsight =
      "No alarm activity yet.";

    if (alarmHistory.length > 0) {
      if (
        averageAlarmResponse !==
          null &&
        averageAlarmResponse <= 2
      ) {
        alarmInsight =
          "You respond quickly to your alarms. Your average response time is under 2 minutes.";
      } else if (
        snoozeRate >= 50
      ) {
        alarmInsight =
          "You snooze more than half of your alarms. Consider reducing snooze usage to improve consistency.";
      } else if (
        alarmHandlingRate >= 80
      ) {
        alarmInsight =
          "You have strong alarm discipline. Most of your alarms are handled without repeated snoozing.";
      } else if (
        mostActiveAlarmDay &&
        mostActiveAlarmDay.triggered >
          0
      ) {
        alarmInsight = `${mostActiveAlarmDay.label} was your most active alarm day with ${mostActiveAlarmDay.triggered} alarm${
          mostActiveAlarmDay.triggered ===
          1
            ? ""
            : "s"
        }.`;
      }
    }

    // -----------------------------
    // Recent Alarm Activity
    // -----------------------------

    const recentAlarms: AlarmHistoryItem[] =
      [...alarmHistory]
        .sort(
          (a, b) =>
            new Date(
              b.triggeredAt
            ).getTime() -
            new Date(
              a.triggeredAt
            ).getTime()
        )
        .slice(0, 5);

    return {
      todayTasks,
      completedToday,
      totalToday,
      completionRate,
      focusMinutes,
      focusSessions,
      streak,
      weeklyActivity,
      categoryStats,
      priorityStats,
      mostFocusedTasks,
      stoppedAlarms,
      snoozedAlarms,
      alarmResponseTimes,
      averageAlarmResponse,
      fastestAlarmResponse,
      slowestAlarmResponse,
      formatAlarmResponse,
      alarmHandlingRate,
      snoozeRate,
      alarmDisciplineScore,
      alarmDisciplineLabel,
      last7AlarmDays,
      maxAlarmActivity,
      alarmInsight,
      mostActiveAlarmDay,
      recentAlarms,
    };
  }, [
    now,
    tasks,
    sessionHistory,
    alarmHistory,
  ]);

  if (!now) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto max-w-[1500px] p-5 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
              <BarChart3
                size={20}
                className="text-zinc-300"
              />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Analytics
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Understand your productivity,
                focus, and consistency.
              </p>
            </div>
          </div>
        </div>

        {/* Top Metrics */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AnalyticsMetric
            label="Completion Rate"
            value={`${analytics.completionRate}%`}
            icon={
              <CheckCircle2 size={17} />
            }
          />

          <AnalyticsMetric
            label="Focus Time"
            value={`${analytics.focusMinutes}m`}
            icon={
              <Timer size={17} />
            }
          />

          <AnalyticsMetric
            label="Focus Sessions"
            value={
              analytics.focusSessions
            }
            icon={
              <Target size={17} />
            }
          />

          <AnalyticsMetric
            label="Current Streak"
            value={`${analytics.streak}d`}
            icon={
              <Flame size={17} />
            }
          />
        </div>

        {/* Today's Overview */}
        <section className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">
                Today&apos;s Overview
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Your current productivity
                snapshot.
              </p>
            </div>

            <TrendingUp
              size={17}
              className="text-zinc-600"
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-xs text-zinc-600">
                Tasks
              </p>

              <p className="mt-2 text-xl font-semibold text-white">
                {
                  analytics.completedToday
                }

                <span className="ml-1 text-sm font-normal text-zinc-600">
                  /{" "}
                  {
                    analytics.totalToday
                  }
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-xs text-zinc-600">
                Focus
              </p>

              <p className="mt-2 text-xl font-semibold text-white">
                {
                  analytics.focusMinutes
                }

                <span className="ml-1 text-sm font-normal text-zinc-600">
                  min
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-xs text-zinc-600">
                Sessions
              </p>

              <p className="mt-2 text-xl font-semibold text-white">
                {
                  analytics.focusSessions
                }
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-zinc-600">
                Daily completion
              </span>

              <span className="text-zinc-400">
                {
                  analytics.completionRate
                }
                %
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{
                  width: `${analytics.completionRate}%`,
                }}
              />
            </div>
          </div>
        </section>

        {/* Weekly Activity */}
        <section className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">
                Weekly Activity
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Tasks completed and focus time
                over the last seven days.
              </p>
            </div>

            <Clock3
              size={17}
              className="text-zinc-600"
            />
          </div>

          <div className="mt-6 grid grid-cols-7 gap-2">
            {analytics.weeklyActivity.map(
              (day) => {
                const maxCompleted =
                  Math.max(
                    ...analytics.weeklyActivity.map(
                      (item) =>
                        item.completed
                    ),
                    1
                  );

                const height =
                  day.completed > 0
                    ? Math.max(
                        8,
                        (day.completed /
                          maxCompleted) *
                          100
                      )
                    : 2;

                return (
                  <div
                    key={day.date}
                    className="flex min-w-0 flex-col items-center"
                  >
                    <div className="flex h-32 w-full items-end justify-center rounded-xl border border-white/5 bg-white/[0.015] px-2 pb-2">
                      <div
                        className="w-full max-w-8 rounded-t-xl bg-white/60 transition-all"
                        style={{
                          height: `${height}%`,
                        }}
                        title={`${day.completed} completed`}
                      />
                    </div>

                    <span className="mt-2 text-[10px] text-zinc-600">
                      {day.label}
                    </span>

                    <span className="mt-1 text-[10px] text-zinc-500">
                      {
                        day.completed
                      }
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* Task Breakdown */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Categories */}
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">
                Category Performance
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Completion by task category.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {analytics.categoryStats
                .length === 0 ? (
                <p className="text-sm text-zinc-600">
                  No category data yet.
                </p>
              ) : (
                analytics.categoryStats.map(
                  (item) => (
                    <div
                      key={
                        item.category
                      }
                    >
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-zinc-400">
                          {item.label}
                        </span>

                        <span className="text-zinc-600">
                          {
                            item.completed
                          }
                          /
                          {item.total}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-white/60 transition-all"
                          style={{
                            width: `${item.rate}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </section>

          {/* Priorities */}
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">
                Priority Performance
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Completion by task priority.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {analytics.priorityStats
                .length === 0 ? (
                <p className="text-sm text-zinc-600">
                  No priority data yet.
                </p>
              ) : (
                analytics.priorityStats.map(
                  (item) => (
                    <div
                      key={
                        item.priority
                      }
                    >
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="capitalize text-zinc-400">
                          {
                            item.priority
                          }
                        </span>

                        <span className="text-zinc-600">
                          {
                            item.completed
                          }
                          /
                          {item.total}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-white/60 transition-all"
                          style={{
                            width: `${item.rate}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </section>
        </div>

        {/* Most Focused Tasks */}
        <section className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">
              Most Focused Tasks
            </h2>

            <p className="mt-1 text-xs text-zinc-600">
              Tasks that received the most focus
              time.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {analytics.mostFocusedTasks
              .length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.015] p-6 text-center">
                <Timer
                  size={22}
                  className="mx-auto text-zinc-700"
                />

                <p className="mt-3 text-sm text-zinc-500">
                  No focus sessions yet.
                </p>

                <p className="mt-1 text-xs text-zinc-700">
                  Start a focus session from
                  a task to see your focus
                  analytics.
                </p>
              </div>
            ) : (
              analytics.mostFocusedTasks.map(
                (item) => (
                  <div
                    key={item.task.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.015] p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-300">
                        {
                          item.task.title
                        }
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        {item.sessions}{" "}
                        {item.sessions ===
                        1
                          ? "session"
                          : "sessions"}
                      </p>
                    </div>

                    <div className="ml-4 text-right">
                      <p className="text-sm font-semibold text-white">
                        {item.minutes}m
                      </p>

                      <p className="text-[10px] text-zinc-600">
                        focus time
                      </p>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </section>

        {/* Alarm Analytics */}
        <section className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Bell
                  size={17}
                  className="text-zinc-500"
                />

                <h2 className="text-sm font-semibold text-zinc-200">
                  Alarm Analytics
                </h2>
              </div>

              <p className="mt-1 text-xs text-zinc-600">
                Understand how you respond to
                scheduled alarms.
              </p>
            </div>

            <Timer
              size={17}
              className="text-zinc-600"
            />
          </div>

          {/* Alarm Overview */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <AnalyticsMetric
              label="Total Alarms"
              value={
                alarmHistory.length
              }
              icon={
                <Bell size={16} />
              }
            />

            <AnalyticsMetric
              label="Stopped"
              value={
                analytics.stoppedAlarms
                  .length
              }
              icon={
                <CheckCircle2
                  size={16}
                />
              }
            />

            <AnalyticsMetric
              label="Snoozed"
              value={
                analytics.snoozedAlarms
                  .length
              }
              icon={
                <Clock3 size={16} />
              }
            />
          </div>

          {/* Response Analytics */}
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <AnalyticsMetric
              label="Average Response"
              value={analytics.formatAlarmResponse(
                analytics.averageAlarmResponse
              )}
              icon={
                <Timer size={16} />
              }
            />

            <AnalyticsMetric
              label="Fastest Response"
              value={analytics.formatAlarmResponse(
                analytics.fastestAlarmResponse
              )}
              icon={
                <TrendingUp
                  size={16}
                />
              }
            />

            <AnalyticsMetric
              label="Slowest Response"
              value={analytics.formatAlarmResponse(
                analytics.slowestAlarmResponse
              )}
              icon={
                <Clock3 size={16} />
              }
            />
          </div>

          {/* Alarm Discipline */}
          <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.015] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  Alarm Discipline
                </h3>

                <p className="mt-1 text-xs text-zinc-600">
                  A score based on response speed
                  and how often alarms are stopped
                  instead of snoozed.
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-semibold text-white">
                  {
                    analytics.alarmDisciplineScore ??
                    "—"
                  }

                  {analytics.alarmDisciplineScore !==
                    null && (
                    <span className="ml-0.5 text-sm text-zinc-600">
                      %
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-zinc-600">
                  {
                    analytics.alarmDisciplineLabel
                  }
                </p>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{
                  width: `${
                    analytics.alarmDisciplineScore ??
                    0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Alarm Rates */}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600">
                  Handling Rate
                </span>

                <span className="text-sm font-semibold text-zinc-300">
                  {Math.round(
                    analytics.alarmHandlingRate
                  )}
                  %
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-emerald-400/70"
                  style={{
                    width: `${analytics.alarmHandlingRate}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600">
                  Snooze Rate
                </span>

                <span className="text-sm font-semibold text-zinc-300">
                  {Math.round(
                    analytics.snoozeRate
                  )}
                  %
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-amber-400/70"
                  style={{
                    width: `${analytics.snoozeRate}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* 7-Day Alarm Activity */}
          <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  7-Day Alarm Activity
                </h3>

                <p className="mt-1 text-xs text-zinc-600">
                  Your alarm behavior over the last
                  seven days.
                </p>
              </div>

              <BarChart3
                size={17}
                className="text-zinc-600"
              />
            </div>

            <div className="mt-6 grid grid-cols-7 gap-2">
              {analytics.last7AlarmDays.map(
                (day) => (
                  <div
                    key={day.date}
                    className="flex min-w-0 flex-col items-center"
                  >
                    <div className="flex h-36 w-full items-end justify-center gap-1 rounded-xl border border-white/5 bg-white/[0.015] px-1.5 pb-2">
                      <div
                        className="w-2 rounded-full bg-white/70 transition-all"
                        style={{
                          height: `${Math.max(
                            day.triggered >
                              0
                              ? 8
                              : 2,
                            (day.triggered /
                              analytics.maxAlarmActivity) *
                              100
                          )}%`,
                        }}
                        title={`${day.triggered} triggered`}
                      />

                      <div
                        className="w-2 rounded-full bg-emerald-400/70 transition-all"
                        style={{
                          height: `${Math.max(
                            day.stopped >
                              0
                              ? 8
                              : 2,
                            (day.stopped /
                              analytics.maxAlarmActivity) *
                              100
                          )}%`,
                        }}
                        title={`${day.stopped} stopped`}
                      />

                      <div
                        className="w-2 rounded-full bg-amber-400/70 transition-all"
                        style={{
                          height: `${Math.max(
                            day.snoozed >
                              0
                              ? 8
                              : 2,
                            (day.snoozed /
                              analytics.maxAlarmActivity) *
                              100
                          )}%`,
                        }}
                        title={`${day.snoozed} snoozed`}
                      />
                    </div>

                    <span className="mt-2 text-[10px] text-zinc-600">
                      {day.label}
                    </span>

                    <span className="mt-1 text-[10px] font-medium text-zinc-400">
                      {day.triggered}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-5 text-[10px] text-zinc-600">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/70" />
                Triggered
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                Stopped
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400/70" />
                Snoozed
              </div>
            </div>
          </div>

          {/* Alarm Insights */}
          <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.015] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <TrendingUp
                  size={16}
                  className="text-zinc-400"
                />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-zinc-200">
                  Alarm Insight
                </h3>

                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  {analytics.alarmInsight}
                </p>
              </div>
            </div>

            {analytics.mostActiveAlarmDay &&
              analytics.mostActiveAlarmDay
                .triggered > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <span className="text-xs text-zinc-600">
                    Most active day
                  </span>

                  <span className="text-xs font-medium text-zinc-300">
                    {
                      analytics
                        .mostActiveAlarmDay
                        .label
                    }

                    {" · "}

                    {
                      analytics
                        .mostActiveAlarmDay
                        .triggered
                    }{" "}
                    alarms
                  </span>
                </div>
              )}
          </div>

          {/* Recent Alarm Activity */}
          <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <History
                    size={16}
                    className="text-zinc-500"
                  />

                  <h3 className="text-sm font-semibold text-zinc-200">
                    Recent Alarm Activity
                  </h3>
                </div>

                <p className="mt-1 text-xs text-zinc-600">
                  Your five most recent alarm
                  events.
                </p>
              </div>

              {analytics.recentAlarms
                .length > 0 && (
                <span className="text-[10px] text-zinc-700">
                  Latest
                </span>
              )}
            </div>

            <div className="mt-5 space-y-2">
              {analytics.recentAlarms
                .length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.015] p-6 text-center">
                  <Bell
                    size={21}
                    className="mx-auto text-zinc-700"
                  />

                  <p className="mt-3 text-sm text-zinc-500">
                    No alarm activity yet.
                  </p>

                  <p className="mt-1 text-xs text-zinc-700">
                    Your alarm responses will
                    appear here.
                  </p>
                </div>
              ) : (
                analytics.recentAlarms.map(
                  (alarm: AlarmHistoryItem) => {
                    const responseLabel =
                      getAlarmResponseLabel(
                        alarm
                      );

                    const isStopped =
                      alarm.status ===
                      "stopped";

                    return (
                      <div
                        key={alarm.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.015] px-4 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              isStopped
                                ? "bg-emerald-400/10 text-emerald-400"
                                : "bg-amber-400/10 text-amber-400"
                            }`}
                          >
                            {isStopped ? (
                              <CheckCircle2
                                size={16}
                              />
                            ) : (
                              <Clock3
                                size={16}
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-300">
                              {
                                alarm.taskTitle
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-zinc-600">
                              {
                                responseLabel
                              }
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span
                            className={`text-[10px] font-medium ${
                              isStopped
                                ? "text-emerald-400/80"
                                : "text-amber-400/80"
                            }`}
                          >
                            {isStopped
                              ? "Stopped"
                              : "Snoozed"}
                          </span>

                          <p className="mt-1 text-[10px] text-zinc-700">
                            {formatAlarmTime(
                              alarm.triggeredAt
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/alarms"
                )
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              <History size={14} />
              View Full Alarm History
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}