"use client";

import {
  Bell,
  Check,
  CheckCheck,
  Clock3,
  Info,
  Trash2,
  X,
  AlertCircle,
  CircleCheck,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import { useTaskStore } from "@/store/taskStore";
import {
  useNotificationStore,
  type DayFlowNotification,
} from "@/store/notificationStore";

function getTaskTitle(
  task: unknown
): string {
  if (
    typeof task === "object" &&
    task !== null &&
    "title" in task &&
    typeof task.title === "string"
  ) {
    return task.title;
  }

  return "Untitled task";
}

function getTaskId(
  task: unknown
): string | undefined {
  if (
    typeof task === "object" &&
    task !== null &&
    "id" in task &&
    typeof task.id === "string"
  ) {
    return task.id;
  }

  return undefined;
}

function getTaskDate(
  task: unknown
): string | undefined {
  if (
    typeof task === "object" &&
    task !== null &&
    "date" in task &&
    typeof task.date === "string"
  ) {
    return task.date;
  }

  return undefined;
}

function isTaskCompleted(
  task: unknown
): boolean {
  if (
    typeof task === "object" &&
    task !== null &&
    "completed" in task &&
    typeof task.completed === "boolean"
  ) {
    return task.completed;
  }

  return false;
}

function formatNotificationTime(
  dateString: string
) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const minutes = Math.floor(
    difference / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days === 1) {
    return "Yesterday";
  }

  return `${days}d ago`;
}

function getNotificationIcon(
  notification: DayFlowNotification
) {
  switch (notification.type) {
    case "task":
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
          <Clock3 size={17} />
        </div>
      );

    case "success":
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
          <CircleCheck size={17} />
        </div>
      );

    case "reminder":
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-400">
          <Bell size={17} />
        </div>
      );

    default:
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
          <Info size={17} />
        </div>
      );
  }
}

export default function NotificationBell() {
  const tasks = useTaskStore(
    (state) => state.tasks
  );

  const notifications = useNotificationStore(
    (state) => state.notifications
  );

  const addNotification =
    useNotificationStore(
      (state) => state.addNotification
    );

  const markAsRead =
    useNotificationStore(
      (state) => state.markAsRead
    );

  const markAllAsRead =
    useNotificationStore(
      (state) => state.markAllAsRead
    );

  const clearNotifications =
    useNotificationStore(
      (state) => state.clearNotifications
    );

  const [open, setOpen] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  /*
   * Generate task notifications.
   *
   * Only tasks that contain an actual time
   * are considered for due/overdue notifications.
   */
  useEffect(() => {
    const checkTaskNotifications = () => {
      const now = new Date();

      tasks.forEach((task) => {
        if (isTaskCompleted(task)) {
          return;
        }

        const taskDateString =
          getTaskDate(task);

        const taskId =
          getTaskId(task);

        if (!taskDateString || !taskId) {
          return;
        }

        /*
         * Ignore date-only tasks.
         *
         * Example:
         * 2026-10-15
         *
         * We only want:
         * 2026-10-15T18:00:00
         */
        if (
          !taskDateString.includes("T")
        ) {
          return;
        }

        const taskDate =
          new Date(taskDateString);

        if (
          Number.isNaN(
            taskDate.getTime()
          )
        ) {
          return;
        }

        const difference =
          taskDate.getTime() -
          now.getTime();

        const taskTitle =
          getTaskTitle(task);

        /*
         * 30-minute warning.
         */
        if (
          difference > 0 &&
          difference <= 30 * 60 * 1000
        ) {
          const notificationId =
            `task-due-soon-${taskId}`;

          addNotification({
            id: notificationId,
            type: "task",
            title: "Task due soon",
            message: `${taskTitle} is due in less than 30 minutes.`,
            taskId,
          });
        }

        /*
         * Overdue notification.
         */
        if (difference < 0) {
          const overdueMinutes =
            Math.abs(
              difference / 60000
            );

          /*
           * Don't generate overdue notifications
           * for tasks older than 24 hours.
           */
          if (
            overdueMinutes <= 24 * 60
          ) {
            const notificationId =
              `task-overdue-${taskId}-${taskDate.getTime()}`;

            addNotification({
              id: notificationId,
              type: "task",
              title: "Task overdue",
              message: `${taskTitle} was due earlier.`,
              taskId,
            });
          }
        }
      });
    };

    checkTaskNotifications();

    /*
     * Recheck every minute.
     */
    const interval =
      window.setInterval(
        checkTaskNotifications,
        60 * 1000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [tasks, addNotification]);

  /*
   * Close notification panel when clicking outside.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [open]);

  /*
   * Close with Escape.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.read
      ).length,
    [notifications]
  );

  const sortedNotifications =
    useMemo(() => {
      return [...notifications].sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      );
    }, [notifications]);

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* Bell button */}

      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        className="group relative rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 text-zinc-500 outline-none transition hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-white/30"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell
          size={17}
          strokeWidth={1.8}
          className="origin-top transition-transform group-hover:rotate-[14deg]"
        />

        {/* Unread indicator */}

        {unreadCount > 0 && (
          <>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />

            {unreadCount > 1 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white ring-2 ring-[#09090b]">
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Notification panel */}

      {open && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-[100] w-[380px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d0d10] shadow-2xl shadow-black/60">
          {/* Header */}

          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3.5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  Notifications
                </h3>

                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-semibold text-red-400">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-[10px] text-zinc-600">
                Stay updated with your DayFlow
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="rounded-lg p-1.5 text-zinc-600 transition hover:bg-white/5 hover:text-white"
              aria-label="Close notifications"
            >
              <X size={16} />
            </button>
          </div>

          {/* Actions */}

          {notifications.length > 0 && (
            <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-2">
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={
                  unreadCount === 0
                }
                className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <CheckCheck size={13} />
                Mark all as read
              </button>

              <button
                type="button"
                onClick={clearNotifications}
                className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-600 transition hover:text-red-400"
              >
                <Trash2 size={13} />
                Clear all
              </button>
            </div>
          )}

          {/* Notifications */}

          <div className="max-h-[430px] overflow-y-auto">
            {sortedNotifications.length ===
            0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.035] ring-1 ring-white/[0.06]">
                  <Bell
                    size={23}
                    className="text-zinc-600"
                  />
                </div>

                <h4 className="text-sm font-medium text-zinc-300">
                  You're all caught up
                </h4>

                <p className="mt-1.5 max-w-[230px] text-[10px] leading-relaxed text-zinc-600">
                  You'll see task reminders and
                  important updates here.
                </p>
              </div>
            ) : (
              <div>
                {sortedNotifications.map(
                  (notification) => (
                    <div
                      key={notification.id}
                      className={`group relative flex gap-3 border-b border-white/[0.05] px-4 py-3.5 transition ${
                        notification.read
                          ? "bg-transparent"
                          : "bg-white/[0.025]"
                      } hover:bg-white/[0.04]`}
                    >
                      {getNotificationIcon(
                        notification
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          markAsRead(
                            notification.id
                          )
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-xs font-medium ${
                              notification.read
                                ? "text-zinc-400"
                                : "text-white"
                            }`}
                          >
                            {notification.title}
                          </p>

                          {!notification.read && (
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                          )}
                        </div>

                        <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-[9px] text-zinc-700">
                          {formatNotificationTime(
                            notification.createdAt
                          )}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          useNotificationStore
                            .getState()
                            .removeNotification(
                              notification.id
                            )
                        }
                        className="absolute right-2 top-2 hidden rounded-md p-1 text-zinc-700 transition hover:bg-white/5 hover:text-red-400 group-hover:block"
                        aria-label="Remove notification"
                      >
                        <X size={12} />
                      </button>

                      {!notification.read && (
                        <Check
                          size={13}
                          className="absolute bottom-3 right-3 text-zinc-700 opacity-0 transition group-hover:opacity-100"
                        />
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Footer */}

          {notifications.length > 0 && (
            <div className="border-t border-white/[0.07] px-4 py-2.5">
              <p className="flex items-center justify-center gap-1.5 text-[9px] text-zinc-700">
                <AlertCircle size={11} />
                DayFlow notifications update automatically
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}