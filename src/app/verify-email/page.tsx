
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Please wait while we verify your email.");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let cancelled = false;

    async function verifyEmail() {
      const token = new URLSearchParams(window.location.search).get("token");

      if (!token) {
        setStatus("error");
        setMessage("The verification link is missing or invalid.");
        return;
      }

      try {
        const response = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (cancelled) return;

        if (!response.ok || !data.success) {
          setStatus("error");
          setMessage(
            data.message || "Verification failed. Please request a new link."
          );
          return;
        }

        setStatus("success");
        setMessage("Email verified successfully!");

        // Redirect to login after 3 seconds.
        setTimeout(() => {
          if (!cancelled) {
            router.replace("/login");
          }
        }, 3000);
      } catch {
        if (cancelled) return;

        setStatus("error");
        setMessage("Unable to verify your email. Please try again.");
      }
    }

    verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (status !== "success") return;

    const interval = setInterval(() => {
      setCountdown((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
        <Link
          href="/login"
          className="mb-8 inline-block text-3xl font-bold text-yellow-400"
        >
          DayFlow
        </Link>

        <div className="mb-6 flex justify-center">
          {status === "loading" && (
            <div
              className="h-14 w-14 animate-spin rounded-full border-4 border-zinc-700 border-t-yellow-400"
              role="status"
              aria-label="Verifying email"
            />
          )}

          {status === "success" && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="h-9 w-9"
                aria-hidden="true"
              >
                <path
                  d="m5 12 4 4L19 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          {status === "error" && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <span className="text-3xl" aria-hidden="true">!</span>
            </div>
          )}
        </div>

        <h1 className="mb-3 text-2xl font-semibold">
          {status === "loading" && "Verifying your email"}
          {status === "success" && "Email verified successfully!"}
          {status === "error" && "Verification failed"}
        </h1>

        <p aria-live="polite" className="mb-6 text-sm leading-6 text-zinc-400">
          {message}
        </p>

        {status === "success" && (
          <p className="mb-6 text-sm text-zinc-500">
            Redirecting to login in {countdown} seconds...
          </p>
        )}

        {status === "error" && (
          <p className="mb-6 text-sm text-zinc-500">
            Your link may have expired or already been used.
          </p>
        )}

        {status === "success" && (
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="w-full rounded-lg bg-yellow-400 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-yellow-300"
          >
            Continue to Login
          </button>
        )}

        {status === "error" && (
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="w-full rounded-lg bg-yellow-400 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-yellow-300"
          >
            Go to Login
          </button>
        )}

        <p className="mt-8 text-xs text-zinc-600">
          DayFlow · Plan your day, one task at a time.
        </p>
      </div>
    </main>
  );
}
