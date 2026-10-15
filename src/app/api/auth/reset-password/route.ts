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

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing reset token.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    // Hash the token so we can safely compare it
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

    // Token doesn't exist.
    if (!resetToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired reset link.",
        },
        { status: 400 }
      );
    }

    // Token has already been used.
    if (resetToken.usedAt) {
      return NextResponse.json(
        {
          success: false,
          error: "This reset link has already been used.",
        },
        { status: 400 }
      );
    }

    // Token has expired.
    if (resetToken.expiresAt <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: "This reset link has expired.",
        },
        { status: 400 }
      );
    }

    // Hash the new password.
    const passwordHash = await hashPassword(password);

    // Update password and consume the reset token.
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

      // Invalidate all existing sessions.
      prisma.session.deleteMany({
        where: {
          userId: resetToken.userId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message:
        "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to reset password. Please try again.",
      },
      { status: 500 }
    );
  }
}