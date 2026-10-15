import { create } from "zustand";

export type NotificationType =
  | "task"
  | "reminder"
  | "system"
  | "success";

export interface DayFlowNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  taskId?: string;
}

interface NotificationStore {
  notifications: DayFlowNotification[];

  hydrated: boolean;

  setNotifications: (
    notifications: DayFlowNotification[]
  ) => void;

  addNotification: (
    notification: Omit<
      DayFlowNotification,
      "id" | "createdAt" | "read"
    > & {
      id?: string;
      createdAt?: string;
      read?: boolean;
    }
  ) => void;

  markAsRead: (id: string) => void;

  markAllAsRead: () => void;

  removeNotification: (id: string) => void;

  clearNotifications: () => void;

  setHydrated: (hydrated: boolean) => void;
}

const STORAGE_KEY = "dayflow_notifications";

function loadNotifications(): DayFlowNotification[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error(
      "Failed to load notifications:",
      error
    );

    return [];
  }
}

function saveNotifications(
  notifications: DayFlowNotification[]
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notifications)
    );
  } catch (error) {
    console.error(
      "Failed to save notifications:",
      error
    );
  }
}

export const useNotificationStore =
  create<NotificationStore>((set, get) => ({
    notifications: [],
    hydrated: false,

    setNotifications: (notifications) => {
      set({ notifications });

      saveNotifications(notifications);
    },

    addNotification: (notification) => {
      const current = get().notifications;

      const id =
        notification.id ||
        crypto.randomUUID();

      /*
       * Prevent duplicate notifications.
       */
      if (
        current.some(
          (item) => item.id === id
        )
      ) {
        return;
      }

      const newNotification: DayFlowNotification = {
        id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        taskId: notification.taskId,
        createdAt:
          notification.createdAt ||
          new Date().toISOString(),
        read: notification.read ?? false,
      };

      const updated = [
        newNotification,
        ...current,
      ].slice(0, 50);

      set({
        notifications: updated,
      });

      saveNotifications(updated);
    },

    markAsRead: (id) => {
      const updated = get().notifications.map(
        (notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
      );

      set({
        notifications: updated,
      });

      saveNotifications(updated);
    },

    markAllAsRead: () => {
      const updated = get().notifications.map(
        (notification) => ({
          ...notification,
          read: true,
        })
      );

      set({
        notifications: updated,
      });

      saveNotifications(updated);
    },

    removeNotification: (id) => {
      const updated =
        get().notifications.filter(
          (notification) =>
            notification.id !== id
        );

      set({
        notifications: updated,
      });

      saveNotifications(updated);
    },

    clearNotifications: () => {
      set({
        notifications: [],
      });

      saveNotifications([]);
    },

    setHydrated: (hydrated) => {
      set({ hydrated });
    },
  }));

/*
 * Hydrate the store from localStorage.
 *
 * This is intentionally outside the Zustand
 * store so it only runs in the browser.
 */
if (typeof window !== "undefined") {
  const notifications =
    loadNotifications();

  useNotificationStore.setState({
    notifications,
    hydrated: true,
  });
}