import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const token =
      typeof body.token === "string"
        ? body.token.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    // Basic validation
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Reset token is required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    // Hash the raw token so we can compare it
    // with the hash stored in the database.
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetToken =
      await prisma.passwordResetToken.findUnique({
        where: {
          tokenHash,
        },
      });

    if (!resetToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired reset link.",
        },
        { status: 400 }
      );
    }

    // Prevent token reuse.
    if (resetToken.usedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "This reset link has already been used.",
        },
        { status: 400 }
      );
    }

    // Check expiration.
    if (resetToken.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        {
          success: false,
          message: "This reset link has expired.",
        },
        { status: 400 }
      );
    }

    // Hash the new password.
    const passwordHash = await hashPassword(password);

    // Update password, mark token as used,
    // and invalidate all existing sessions.
    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          passwordHash,
        },
      }),

      prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),

      prisma.session.deleteMany({
        where: {
          userId: resetToken.userId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message:
        "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to reset password.",
      },
      { status: 500 }
    );
  }
}