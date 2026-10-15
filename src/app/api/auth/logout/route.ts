import { NextResponse } from "next/server";
import { deleteCurrentSession } from "@/lib/session";

export async function POST() {
  try {
    await deleteCurrentSession();

    return NextResponse.json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while logging out",
      },
      { status: 500 }
    );
  }
}