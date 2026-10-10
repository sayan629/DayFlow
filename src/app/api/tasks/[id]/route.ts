import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
     try {
    const { id } = await context.params;
    const body = await request.json();

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(body.title !== undefined && {
          title: body.title,
        }),
        ...(body.description !== undefined && {
          description: body.description || null,
        }),
        ...(body.date !== undefined && {
          date: body.date,
        }),
         ...(body.startTime !== undefined && {
          startTime: body.startTime || null,
        }),
        ...(body.endTime !== undefined && {
          endTime: body.endTime || null,
        }),
        ...(body.priority !== undefined && {
          priority: body.priority,
        }),
        ...(body.category !== undefined && {
          category: body.category,
        }),
                ...(body.completed !== undefined && {
          completed: body.completed,
        }),
        ...(body.reminder !== undefined && {
          reminder: body.reminder,
        }),
        ...(body.alarmEnabled !== undefined && {
          alarmEnabled: body.alarmEnabled,
        }),
      },
    });
        return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    await prisma.task.delete({
      where: { id },
    });