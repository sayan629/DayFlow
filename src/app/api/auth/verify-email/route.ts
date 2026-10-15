
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TOKEN_EXPIRY_HOURS = 24;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token || token.length > 512) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification link.",
        },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);

    const verificationToken =
      await prisma.emailVerificationToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

    if (!verificationToken || verificationToken.usedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "This verification link is invalid or has already been used.",
        },
        { status: 400 }
      );
    }

    if (verificationToken.expiresAt <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "This verification link has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    if (verificationToken.user.emailVerifiedAt) {
      return NextResponse.json({
        success: true,
        message: "Your email address is already verified.",
      });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.emailVerificationToken.deleteMany({
        where: {
          userId: verificationToken.userId,
          id: { not: verificationToken.id },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. You can now log in to DayFlow.",
    });
  } catch (error) {
    console.error("Email verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while verifying your email. Please try again.",
      },
      { status: 500 }
    );
  }
}
