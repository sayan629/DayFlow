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