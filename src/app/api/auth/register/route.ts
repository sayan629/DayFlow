
import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, normalizeEmail } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mailer";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string"
        ? normalizeEmail(body.email)
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check for an existing account
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create the account as unverified
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Generate a cryptographically secure verification token
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date(
      Date.now() +
        VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    // Store only the hashed token
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Use APP_URL so verification links work from the intended device
    const appUrl = process.env.APP_URL?.replace(/\/+$/, "");

    if (!appUrl) {
      throw new Error("APP_URL is not configured");
    }

    const verificationUrl = new URL(
  "/verify-email",
  `${appUrl}/`
);

    verificationUrl.searchParams.set("token", rawToken);

    // Send the verification email
    await sendVerificationEmail(
      user.email,
      verificationUrl.toString()
    );

    return NextResponse.json(
      {
        message:
          "Account created. Please check your email to verify your account before logging in.",
        requiresEmailVerification: true,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating your account. Please try again.",
      },
      { status: 500 }
    );
  }
}
