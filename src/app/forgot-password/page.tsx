"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to process your request.");
        return;
      }

      setMessage(
        data.message ||
          "If an account exists with that email, a password reset link has been created."
      );
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-6 py-12 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-yellow-400/[0.06] blur-[140px]" />

        <div className="absolute left-[15%] top-[20%] h-1 w-1 rounded-full bg-yellow-300 shadow-[0_0_14px_4px_rgba(250,204,21,0.3)]" />

        <div className="absolute right-[20%] top-[30%] h-1.5 w-1.5 rounded-full bg-yellow-200 shadow-[0_0_14px_4px_rgba(250,204,21,0.25)]" />

        <div className="absolute bottom-[20%] left-[25%] h-1 w-1 rounded-full bg-yellow-300 shadow-[0_0_14px_4px_rgba(250,204,21,0.25)]" />
      </div>

      <div className="relative w-full max-w-[430px]">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <img
              src="/dayflow-logo.png"
              alt="DayFlow"
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <p className="text-lg font-semibold">DayFlow</p>
            <p className="text-[8px] uppercase tracking-[0.25em] text-white/30">
              Personal OS
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-300/20 bg-yellow-300/10 shadow-[0_0_40px_rgba(250,204,21,0.08)]">
              <Mail size={24} className="text-yellow-300" />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              Forgot password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/40">
              Enter your email and we&apos;ll help you reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium text-white/60"
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="h-12 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-yellow-300/50 focus:bg-black/40 focus:ring-2 focus:ring-yellow-300/10"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm leading-5 text-green-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 text-sm font-semibold text-black shadow-[0_8px_30px_rgba(250,204,21,0.12)] transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}

              {!loading && (
                <Send
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          <div className="mt-7 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-yellow-300"
            >
              <ArrowLeft size={15} />
              Back to login
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/20">
          © 2026 DayFlow
        </p>
      </div>
    </main>
  );
}