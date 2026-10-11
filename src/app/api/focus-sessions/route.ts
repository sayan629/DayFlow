import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sessions = await prisma.focusSession.findMany({
      orderBy: {
        completedAt: "desc",
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error(
      "GET /api/focus-sessions error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch focus sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const session = await prisma.focusSession.create({
      data: {
        id: body.id,
        taskId: body.taskId ?? null,
        taskTitle: body.taskTitle ?? null,
        mode: body.mode,
        durationSeconds: body.durationSeconds,
        startedAt: new Date(body.startedAt),
        completedAt: new Date(body.completedAt),
      },
    });

    return NextResponse.json(session, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "POST /api/focus-sessions error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to create focus session" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.focusSession.deleteMany();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/focus-sessions error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to clear focus sessions" },
      { status: 500 }
    );
  }
}