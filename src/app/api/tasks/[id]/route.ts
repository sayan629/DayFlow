import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const body = await request.json();

    /*
     * First verify that this task belongs
     * to the currently authenticated user.
     */
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const task = await prisma.task.update({
      where: {
        id,
      },

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

        ...(body.snoozedUntil !== undefined && {
          snoozedUntil: body.snoozedUntil
            ? new Date(body.snoozedUntil)
            : null,
        }),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error(
      "PATCH /api/tasks/[id] error:",
      error
    );

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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    /*
     * Verify ownership before deleting.
     */
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/tasks/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}