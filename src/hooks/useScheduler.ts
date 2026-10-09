"use client";

import { useEffect, useState } from "react";

export function useScheduler() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setNow(new Date());
    }, 0);

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return now;
}