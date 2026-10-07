"use client";

import { useEffect, useState } from "react";

export function useScheduler() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Set the current time only after the component mounts
    setNow(new Date());

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return now;
}