"use client";

import { Bell, BellOff, CheckCircle2, Clock3 } from "lucide-react";
import { useMemo, useState } from "react";

import { useTaskStore } from "@/store/taskStore";

export default function AlarmList() {
  const tasks = useTaskStore((state) => state.tasks);

  const [disabledAlarms, setDisabledAlarms] = useState<string[]>(
    []
  );
