"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "Invalid or missing password reset link."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to reset your password."
        );
        return;
      }

      setSuccess(
        data.message ||
          "Password reset successfully."
      );

      setPassword("");
      setConfirmPassword("");

      // Give the user a moment to see the success message.
      setTimeout(() => {
        router.replace("/login");
      }, 1800);
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-6 py-12 text-white">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2">
            <img
              src="/dayflow-logo.png"
              alt="DayFlow"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-[#111113]/90 p-8 shadow-2xl backdrop-blur-xl">

          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400/10">
              <Lock
                size={22}
                className="text-yellow-300"
              />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Reset password
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/45">
              Create a new password for your
              DayFlow account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 flex gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
              />
              <span>{success}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* New password */}
            <div>
              <label className="mb-2 block text-sm text-white/70">
                New password
              </label>

              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/40 focus:bg-white/[0.06]"
                />
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-2 block text-sm text-white/70">
                Confirm password
              </label>

              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/40 focus:bg-white/[0.06]"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !token}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-yellow-400 font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Resetting password..."
                : "Reset Password"}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-6 flex justify-center">
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
            >
              <ArrowLeft size={15} />
              Back to login
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/20">
          DayFlow · Personal Productivity OS
        </p>
      </div>
    </main>
  );
}