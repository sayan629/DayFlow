import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/mailer";

const RESET_TOKEN_EXPIRY_MINUTES = 15;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? normalizeEmail(body.email)
        : "";

    // Always return the same response whether the email exists or not.
    // This prevents account/email enumeration.
    const genericResponse = NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });

    if (!email) {
      return genericResponse;
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return genericResponse;
    }

    // Remove previous unused reset tokens for this user.
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    // Generate a cryptographically secure random token.
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the SHA-256 hash in the database.
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
    );

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Build the reset URL.
    const appUrl =
      process.env.APP_URL || new URL(request.url).origin;

    const resetUrl = new URL(
      "/reset-password",
      appUrl
    );

    resetUrl.searchParams.set("token", resetToken);

    // Send reset email to the user's registered email.
    await sendPasswordResetEmail(
      user.email,
      resetUrl.toString()
    );

    console.log(
      `Password reset email sent to ${user.email}`
    );

    return genericResponse;
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process the password reset request.",
      },
      { status: 500 }
    );
  }
}