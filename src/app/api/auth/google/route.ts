import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

const GOOGLE_AUTH_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !callbackUrl) {
    return NextResponse.json(
      {
        error:
          "Google OAuth environment variables are not configured",
      },
      { status: 500 }
    );
  }

  const state = randomBytes(32).toString("hex");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",

    scope: [
      "openid",
      "email",
      "profile",
    ].join(" "),

    state,
    access_type: "online",
    prompt: "select_account",
  });

  const response = NextResponse.redirect(
    `${GOOGLE_AUTH_URL}?${params.toString()}`
  );

  response.cookies.set(
    "google_oauth_state",
    state,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    }
  );

  return response;
}