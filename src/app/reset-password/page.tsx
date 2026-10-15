"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [token, setToken] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /*
   * Read token directly from the browser URL.
   */
  useEffect(() => {
    const readToken = () => {
      const params = new URLSearchParams(
        window.location.search
      );

      const urlToken = params.get("token") || "";

      console.log(
        "DAYFLOW RESET TOKEN:",
        urlToken ? "FOUND" : "MISSING"
      );

      setToken(urlToken);
    };

    readToken();
  }, []);

  /*
   * Password reset function
   */
  async function resetPassword() {
    setError("");
    setSuccess(false);

    /*
     * Always get the latest token directly from URL.
     */
    const currentToken =
      token ||
      new URLSearchParams(window.location.search).get(
        "token"
      ) ||
      "";

    console.log(
      "DAYFLOW RESET:",
      currentToken ? "Token found" : "Token missing"
    );

    if (!currentToken) {
      setError(
        "This password reset link is invalid or missing. Please request a new reset email."
      );
      return;
    }

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      console.log(
        "DAYFLOW RESET: Sending request..."
      );

      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            token: currentToken,
            password,
          }),
        }
      );

      console.log(
        "DAYFLOW RESET STATUS:",
        response.status
      );

      const data = await response.json();

      console.log(
        "DAYFLOW RESET RESPONSE:",
        data
      );

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to reset your password."
        );
        return;
      }

      /*
       * SUCCESS
       */
      setSuccess(true);

      setPassword("");
      setConfirmPassword("");

      /*
       * Redirect after the user has seen
       * the success message.
       */
      setTimeout(() => {
        router.replace("/login");
      }, 3000);
    } catch (error) {
      console.error(
        "DAYFLOW RESET ERROR:",
        error
      );

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-6 py-12 text-white">
      {/* Background */}
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

          {/* Header */}
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
              Create a new password for your DayFlow account.
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
            <div className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                  <CheckCircle2
                    size={20}
                    className="text-green-400"
                  />
                </div>

                <div>

                  <p className="font-semibold text-green-300">
                    Password changed successfully!
                  </p>

                  <p className="mt-1 text-sm leading-5 text-green-300/70">
                    Your DayFlow password has been updated.
                    You can now log in with your new password.
                  </p>

                </div>

              </div>

              <div className="mt-4 text-xs text-green-300/50">
                Redirecting you to login...
              </div>

            </div>
          )}

          {/* Password fields */}
          {!success && (
            <div className="space-y-5">

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
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/40 focus:bg-white/[0.06]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                <p className="mt-2 text-xs text-white/25">
                  Minimum 8 characters
                </p>

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
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/40 focus:bg-white/[0.06]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* Reset button */}
              <button
                type="button"
                onClick={resetPassword}
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-yellow-400 font-semibold text-black transition hover:bg-yellow-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Changing password..."
                  : "Reset Password"}
              </button>

            </div>
          )}

          {/* Back to login */}
          {!success && (
            <div className="mt-6 flex justify-center">

              <Link
                href="/login"
                className="flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
              >
                <ArrowLeft size={15} />
                Back to login
              </Link>

            </div>
          )}

        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/20">
          DayFlow · Personal Productivity OS
        </p>

      </div>
    </main>
  );
}