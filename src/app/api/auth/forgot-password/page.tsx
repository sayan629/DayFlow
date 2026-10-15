"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to process your request."
        );
      }

      setSubmitted(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090908] px-4 py-10 text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-yellow-500/[0.07] blur-[120px]" />

      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute left-[15%] top-[22%] h-1 w-1 rounded-full bg-yellow-200" />
        <div className="absolute left-[78%] top-[18%] h-1 w-1 rounded-full bg-yellow-200" />
        <div className="absolute left-[84%] top-[68%] h-1 w-1 rounded-full bg-yellow-200" />
        <div className="absolute left-[12%] top-[72%] h-1 w-1 rounded-full bg-yellow-200" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/dayflow-logo.png"
            alt="DayFlow"
            width={150}
            height={48}
            className="h-auto w-[150px] object-contain"
            priority
          />
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-[#11110f]/90 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">
          {!submitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight">
                  Forgot password?
                </h1>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  Enter your email and we&apos;ll help you get back into
                  your DayFlow account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-white/70"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-500/50 focus:bg-white/[0.06]"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 font-medium text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7 text-center">
                <Link
                  href="/login"
                  className="text-sm text-white/45 transition hover:text-white"
                >
                  ← Back to login
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                <CheckCircle2
                  size={32}
                  className="text-yellow-400"
                />
              </div>

              <h1 className="text-2xl font-semibold">
                Check your email
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/45">
                If an account exists for{" "}
                <span className="text-white/75">{email}</span>, a
                password reset link has been generated.
              </p>

              <p className="mt-4 text-xs leading-5 text-white/30">
                For security reasons, we don&apos;t reveal whether an
                account exists for a particular email address.
              </p>

              <Link
                href="/login"
                className="mt-7 inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                Back to login
              </Link>
            </div>
          )}
        </div>

        <p className="mt-7 text-center text-xs text-white/20">
          © 2026 DayFlow
        </p>
      </div>
    </main>
  );
}