"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";

export default function AuthBootstrap() {
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const setLoading = useUserStore((state) => state.setLoading);
  const setInitialized = useUserStore(
    (state) => state.setInitialized
  );

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      setLoading(true);

      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!mounted) {
          return;
        }

        if (response.ok) {
          const data = await response.json();

          if (data.user) {
            setUser(data.user);
          } else {
            clearUser();
          }
        } else {
          clearUser();
        }
      } catch (error) {
        console.error(
          "Failed to restore authentication:",
          error
        );

        if (mounted) {
          clearUser();
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [
    setUser,
    clearUser,
    setLoading,
    setInitialized,
  ]);

  return null;
}