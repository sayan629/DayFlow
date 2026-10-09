"use client";

import { useEffect, useState } from "react";

let sharedNow: Date | null = null;
let listeners: Array<(date: Date) => void> = [];
let interval: ReturnType<typeof setInterval> | null = null;

function startScheduler() {
  if (interval) {
    return;
  }

  interval = setInterval(() => {
    const date = new Date();

    sharedNow = date;

    listeners.forEach((listener) => {
      listener(date);
    });
  }, 1000);
}

function subscribe(listener: (date: Date) => void) {
  listeners.push(listener);

  startScheduler();

  return () => {
    listeners = listeners.filter(
      (currentListener) => currentListener !== listener
    );

    if (listeners.length === 0 && interval) {
      clearInterval(interval);
      interval = null;
    }
  };
}

export function useScheduler() {
  const [now, setNow] = useState<Date | null>(() => {
    return sharedNow;
  });

  useEffect(() => {
    return subscribe(setNow);
  }, []);

  return now;
}