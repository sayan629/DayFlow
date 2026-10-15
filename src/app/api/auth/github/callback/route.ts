import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";

const GITHUB_CLIENT_ID =
  process.env.GITHUB_CLIENT_ID;

const GITHUB_CLIENT_SECRET =
  process.env.GITHUB_CLIENT_SECRET;

const GITHUB_CALLBACK_URL =
  process.env.GITHUB_CALLBACK_URL;

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

function redirectToLogin(
  request: Request,
  error: string
) {
  const url = new URL("/login", request.url);

  url.searchParams.set("error", error);

  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  try {
    if (
      !GITHUB_CLIENT_ID ||
      !GITHUB_CLIENT_SECRET ||
      !GITHUB_CALLBACK_URL
    ) {
      return redirectToLogin(
        request,
        "GitHub authentication is not configured"
      );
    }

    const requestUrl = new URL(request.url);

    const code =
      requestUrl.searchParams.get("code");

    const state =
      requestUrl.searchParams.get("state");

    const githubError =
      requestUrl.searchParams.get("error");

    if (githubError) {
      return redirectToLogin(
        request,
        "GitHub authentication was cancelled"
      );
    }

    if (!code || !state) {
      return redirectToLogin(
        request,
        "Invalid GitHub authentication response"
      );
    }

    const cookieStore = await cookies();

    const savedState =
      cookieStore.get(
        "github_oauth_state"
      )?.value;

    cookieStore.delete(
      "github_oauth_state"
    );

    if (
      !savedState ||
      savedState !== state
    ) {
      return redirectToLogin(
        request,
        "Invalid OAuth state"
      );
    }

    // Exchange GitHub authorization code
    // for an access token.
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret:
            GITHUB_CLIENT_SECRET,
          code,
          redirect_uri:
            GITHUB_CALLBACK_URL,
        }),
        cache: "no-store",
      }
    );

    const tokenData =
      await tokenResponse.json();

    if (
      !tokenResponse.ok ||
      !tokenData.access_token
    ) {
      console.error(
        "GitHub token error:",
        tokenData
      );

      return redirectToLogin(
        request,
        "Unable to authenticate with GitHub"
      );
    }

    const accessToken =
      tokenData.access_token;

    // Get GitHub user profile.
    const userResponse = await fetch(
      "https://api.github.com/user",
      {
        headers: {
          Accept:
            "application/vnd.github+json",
          Authorization:
            `Bearer ${accessToken}`,
          "X-GitHub-Api-Version":
            "2022-11-28",
        },
        cache: "no-store",
      }
    );

    if (!userResponse.ok) {
      return redirectToLogin(
        request,
        "Unable to retrieve your GitHub profile"
      );
    }

    const githubUser =
      (await userResponse.json()) as GitHubUser;

    // Get GitHub emails.
    const emailResponse = await fetch(
      "https://api.github.com/user/emails",
      {
        headers: {
          Accept:
            "application/vnd.github+json",
          Authorization:
            `Bearer ${accessToken}`,
          "X-GitHub-Api-Version":
            "2022-11-28",
        },
        cache: "no-store",
      }
    );

    if (!emailResponse.ok) {
      return redirectToLogin(
        request,
        "Unable to retrieve your GitHub email"
      );
    }

    const emails =
      (await emailResponse.json()) as GitHubEmail[];

    // Prefer verified primary email.
    const primaryEmail =
      emails.find(
        (email) =>
          email.primary &&
          email.verified
      ) ||
      emails.find(
        (email) => email.verified
      );

    if (!primaryEmail) {
      return redirectToLogin(
        request,
        "Please verify your GitHub email first"
      );
    }

    const email =
      primaryEmail.email
        .trim()
        .toLowerCase();

    const name =
      githubUser.name?.trim() ||
      githubUser.login;

    const avatar =
      githubUser.avatar_url || null;

    console.log("GitHub user:", {
      email,
      name,
      avatar,
    });

    // Find existing DayFlow account.
    let user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    // Existing account.
    if (user) {
      user =
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            name,
            avatar: avatar || user.avatar,
            emailVerifiedAt:
              user.emailVerifiedAt ??
              new Date(),
          },
        });
    } else {
      // New GitHub account.
      const randomPassword =
        randomBytes(32).toString("hex");

      const passwordHash =
        await hashPassword(
          randomPassword
        );

      user =
        await prisma.user.create({
          data: {
            name,
            email,
            passwordHash,
            avatar,
            emailVerifiedAt: new Date(),
          },
        });
    }

    // Create normal DayFlow session.
    await createSession(user.id);

    // Go to dashboard.
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  } catch (error) {
    console.error(
      "GitHub OAuth callback error:",
      error
    );

    return redirectToLogin(
      request,
      "GitHub authentication failed"
    );
  }
}