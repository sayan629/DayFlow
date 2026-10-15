import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CALLBACK_URL =
  process.env.GITHUB_CALLBACK_URL;

export async function GET() {
  try {
    if (!GITHUB_CLIENT_ID || !GITHUB_CALLBACK_URL) {
      return NextResponse.json(
        {
          error: "GitHub OAuth is not configured",
        },
        { status: 500 }
      );
    }

    const state = randomBytes(32).toString("hex");

    const cookieStore = await cookies();

    cookieStore.set("github_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: GITHUB_CALLBACK_URL,
      scope: "read:user user:email",
      state,
    });

    const githubAuthorizationUrl =
      `https://github.com/login/oauth/authorize?${params.toString()}`;

    return NextResponse.redirect(
      githubAuthorizationUrl
    );
  } catch (error) {
    console.error(
      "GitHub OAuth start error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to start GitHub authentication",
      },
      { status: 500 }
    );
  }
}