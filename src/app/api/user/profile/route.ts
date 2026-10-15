import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          error:
            "Name must be at least 2 characters.",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          error:
            "Name must be less than 100 characters.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while updating your profile.",
      },
      { status: 500 }
    );
  }
}