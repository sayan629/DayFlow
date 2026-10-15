import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashPassword, normalizeEmail } from "@/lib/auth";
import { createSession } from "@/lib/session";

const GOOGLE_TOKEN_URL =
  "https://oauth2.googleapis.com/token";

const GOOGLE_USERINFO_URL =
  "https://openidconnect.googleapis.com/v1/userinfo";

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

    if (!clientId || !clientSecret || !callbackUrl) {
      return NextResponse.redirect(
        new URL("/login?error=google_config", request.url)
      );
    }

    const searchParams = request.nextUrl.searchParams;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("Google OAuth error:", error);

      return NextResponse.redirect(
        new URL("/login?error=google_denied", request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/login?error=google_invalid_callback", request.url)
      );
    }

    const savedState =
      request.cookies.get("google_oauth_state")?.value;

    if (!savedState || savedState !== state) {
      console.error("Google OAuth state mismatch");

      return NextResponse.redirect(
        new URL("/login?error=google_state", request.url)
      );
    }

    // Exchange authorization code for Google access token
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: callbackUrl,
      }),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();

      console.error(
        "Google token exchange failed:",
        tokenError
      );

      return NextResponse.redirect(
        new URL("/login?error=google_token", request.url)
      );
    }

    const tokenData = await tokenResponse.json();

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(
        new URL("/login?error=google_no_token", request.url)
      );
    }

    // Get Google profile
    const userInfoResponse = await fetch(
      GOOGLE_USERINFO_URL,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!userInfoResponse.ok) {
      const userInfoError =
        await userInfoResponse.text();

      console.error(
        "Google userinfo failed:",
        userInfoError
      );

      return NextResponse.redirect(
        new URL("/login?error=google_profile", request.url)
      );
    }

    const googleUser = await userInfoResponse.json();

    console.log("Google user info:", {
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
    });

    const email =
      typeof googleUser.email === "string"
        ? normalizeEmail(googleUser.email)
        : "";

    const name =
      typeof googleUser.name === "string" &&
      googleUser.name.trim()
        ? googleUser.name.trim()
        : email.split("@")[0];

    const avatar =
      typeof googleUser.picture === "string" &&
      googleUser.picture.trim()
        ? googleUser.picture
        : null;

    if (!email) {
      return NextResponse.redirect(
        new URL("/login?error=google_no_email", request.url)
      );
    }

    // Find existing DayFlow user
    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Create account if Google email doesn't exist
    if (!user) {
      const randomPassword =
        randomBytes(32).toString("hex");

      const passwordHash =
        await hashPassword(randomPassword);

      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          avatar,
          emailVerifiedAt: new Date(),
        },
      });
    } else {
      // Update Google profile information
      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name,
          avatar,
          emailVerifiedAt:
            user.emailVerifiedAt ?? new Date(),
        },
      });
    }

    // Create normal DayFlow session
    await createSession(user.id);

    const response = NextResponse.redirect(
      new URL("/", request.url)
    );

    // Remove OAuth state cookie
    response.cookies.delete(
      "google_oauth_state"
    );

    return response;
  } catch (error) {
    console.error(
      "Google OAuth callback error:",
      error
    );

    return NextResponse.redirect(
      new URL("/login?error=google_failed", request.url)
    );
  }
}