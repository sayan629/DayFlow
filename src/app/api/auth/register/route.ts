import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  normalizeEmail,
} from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? normalizeEmail(body.email)
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    // Validation
    if (!name) {
      return NextResponse.json(
        {
          error: "Name is required",
        },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          error: "Name must be at least 2 characters",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          error: "Password is required",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error: "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
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

    // Create login session
    await createSession(user.id);

    return NextResponse.json(
      {
        message: "Account created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while creating your account",
      },
      { status: 500 }
    );
  }
}