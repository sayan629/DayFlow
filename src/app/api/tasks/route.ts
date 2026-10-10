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

        return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const task = await prisma.task.create({
      data: {
        id: body.id,
        title: body.title,
        description: body.description || null,
        date: body.date,
        startTime: body.startTime || null,
        endTime: body.endTime || null,
        priority: body.priority ?? "medium",
        category: body.category ?? "other",
        completed: body.completed ?? false,
        reminder: body.reminder ?? null,
        alarmEnabled: body.alarmEnabled ?? true,
        createdAt: body.createdAt
          ? new Date(body.createdAt)
          : new Date(),
      },
    });

        return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);

    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}