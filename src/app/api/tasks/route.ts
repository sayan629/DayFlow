import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);