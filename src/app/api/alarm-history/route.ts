
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const history = await prisma.alarmHistory.findMany({
      orderBy: {
        triggeredAt: "desc",
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("GET /api/alarm-history error:", error);

    return NextResponse.json(
      { error: "Failed to fetch alarm history" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const historyItem = await prisma.alarmHistory.create({
      data: {
        id: body.id,
        taskId: body.taskId ?? null,
        taskTitle: body.taskTitle,
        status: body.status,
        triggeredAt: new Date(body.triggeredAt),
        stoppedAt: body.stoppedAt
          ? new Date(body.stoppedAt)
          : null,
        snoozedUntil: body.snoozedUntil
          ? new Date(body.snoozedUntil)
          : null,
      },
    });

    return NextResponse.json(historyItem, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/alarm-history error:", error);

    return NextResponse.json(
      { error: "Failed to save alarm history" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.alarmHistory.deleteMany();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/alarm-history error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to clear alarm history" },
      { status: 500 }
    );
  }
}