"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, LockKeyhole, UserRound, ArrowRight } from "lucide-react";

import { useUserStore } from "@/store/userStore";

function GithubLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const setUser = useUserStore((state) => state.setUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create account");
        return;
      }

      setUser(data.user);

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Registration error:", error);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleOAuth(provider: string) {
    setError(`${provider} sign up will be available after OAuth setup.`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b0e08] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,rgba(202,174,55,0.12),transparent_28%),radial-gradient(circle_at_75%_20%,rgba(255,213,45,0.05),transparent_25%)]" />

        <div className="absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-yellow-400/5 blur-3xl" />

        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-lime-300/5 blur-3xl" />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-[9%] top-[42%] h-1 w-1 animate-pulse rounded-full bg-yellow-300 shadow-[0_0_12px_4px_rgba(250,204,21,0.35)]" />

        <span className="absolute left-[18%] top-[30%] h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-200 shadow-[0_0_14px_5px_rgba(250,204,21,0.3)]" />

        <span className="absolute left-[29%] top-[63%] h-1 w-1 animate-pulse rounded-full bg-yellow-300 shadow-[0_0_12px_4px_rgba(250,204,21,0.35)]" />

        <span className="absolute left-[39%] top-[46%] h-1 w-1 animate-pulse rounded-full bg-yellow-200 shadow-[0_0_12px_4px_rgba(250,204,21,0.3)]" />

        <span className="absolute right-[23%] top-[38%] h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-300 shadow-[0_0_15px_5px_rgba(250,204,21,0.3)]" />

        <span className="absolute right-[13%] top-[67%] h-1 w-1 animate-pulse rounded-full bg-yellow-200 shadow-[0_0_12px_4px_rgba(250,204,21,0.25)]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left visual */}
        <section className="relative hidden min-h-screen flex-1 overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(186,164,65,0.18),transparent_55%)]" />

          {/* Lamp glow */}
          <div className="absolute left-[29%] top-[25%] h-44 w-44 rounded-full bg-yellow-300/10 blur-3xl" />

          {/* Lamp shade */}
          <div className="absolute left-[24%] top-[29%] h-9 w-32 rounded-[50%] bg-[#191b12] shadow-[0_0_20px_8px_rgba(255,214,75,0.08)]" />

          <div className="absolute left-[26%] top-[32%] h-1 w-28 bg-yellow-100/60 blur-[1px]" />

          {/* Light */}
          <div className="absolute left-[22%] top-[33%] h-0 w-0 border-l-[90px] border-r-[90px] border-t-[190px] border-l-transparent border-r-transparent border-t-yellow-200/20 blur-[1px]" />

          <div className="absolute left-[25%] top-[34%] h-0 w-0 border-l-[60px] border-r-[60px] border-t-[150px] border-l-transparent border-r-transparent border-t-yellow-100/15" />

          {/* Stand */}
          <div className="absolute left-[29.5%] top-[34%] h-36 w-[3px] bg-[#77705a]" />

          {/* Switch */}
          <div className="absolute left-[34%] top-[48%] h-8 w-[2px] bg-[#81795c]" />

          <div className="absolute left-[33.7%] top-[54%] h-2 w-2 rounded-full bg-[#aaa077]" />

          {/* Base */}
          <div className="absolute left-[25%] top-[67%] h-2 w-28 rounded-full bg-[#171912]" />

          {/* Branding */}
          <div className="absolute bottom-12 left-12">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-lg font-black text-black shadow-[0_0_25px_rgba(250,204,21,0.2)]">
                D
              </div>

              <span className="text-xl font-semibold tracking-tight">
                DayFlow
              </span>
            </div>

            <p className="max-w-sm text-sm leading-6 text-white/40">
              Create your personal productivity workspace and make every day
              count.
            </p>
          </div>
        </section>

        {/* Register section */}
        <section className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[48%] lg:px-14 xl:w-[45%]">
          <div className="w-full max-w-md">
            <div className="rounded-[22px] border border-white/10 bg-[#171a12]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-8">
              {/* Header */}
              <div className="mb-7 text-center">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-lg font-black text-black shadow-[0_0_25px_rgba(250,204,21,0.15)]">
                  D
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Create Account
                </h1>

                <p className="mt-2 text-xs text-white/45">
                  Start organizing your day with DayFlow
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="relative">
                  <UserRound
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35"
                  />

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Full Name"
                    autoComplete="name"
                    required
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#0c0f09] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/15 focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/10"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email Address"
                    autoComplete="email"
                    required
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#0c0f09] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/15 focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/10"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <LockKeyhole
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35"
                  />

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#0c0f09] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/15 focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/10"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                    {error}
                  </div>
                )}

                {/* Create account */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 text-sm font-bold text-black shadow-[0_8px_25px_rgba(250,204,21,0.12)] transition hover:bg-yellow-300 hover:shadow-[0_8px_35px_rgba(250,204,21,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating Account..." : "Create Account"}

                  {!loading && (
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-[10px] uppercase tracking-wider text-white/30">
                  Or continue with
                </span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* OAuth */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuth("Google")}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-medium text-white/75 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.42Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 21.7c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.7Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6.54 13.79A5.85 5.85 0 0 1 6.23 12c0-.62.11-1.22.31-1.79V7.68H3.3A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.32l3.24-2.53Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 6.18c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.26 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53c1.01-1.96 3.16-3.68 5.7-3.68Z"
                    />
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuth("GitHub")}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-medium text-white/75 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                >
                  <GithubLogo size={16} />
                  GitHub
                </button>
              </div>

              {/* Login */}
              <div className="mt-7 text-center text-xs text-white/40">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-yellow-400 transition hover:text-yellow-300"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <p className="mt-6 text-center text-[10px] text-white/20">
              © 2026 DayFlow
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}