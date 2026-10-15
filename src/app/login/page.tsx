"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Mail,
  Lock,
  User,
  ArrowRight,
} from "lucide-react";

import { useUserStore } from "@/store/userStore";

function GithubLogo({
  size = 16,
}: {
  size?: number;
}) {
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

function GoogleLogo({
  size = 16,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
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
  );
}

export default function LoginPage() {
  const router = useRouter();

  const setUser = useUserStore(
    (state) => state.setUser
  );

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // ============================================================
  // Lamp state
  // ============================================================

  const [lampOn, setLampOn] =
    useState(false);

  const [pulling, setPulling] =
    useState(false);

  function handlePull() {
    if (pulling) return;

    setPulling(true);

    setLampOn((prev) => !prev);

    setTimeout(
      () => setPulling(false),
      220
    );
  }

  // ============================================================
  // Login
  // ============================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to login"
        );

        return;
      }

      setUser(data.user);

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // OAuth
  // ============================================================

  function handleOAuth(
    provider: string
  ) {
    setError(
      `${provider} sign in will be available after OAuth setup.`
    );
  }

  return (
    <main
      className={`relative min-h-screen overflow-hidden text-white transition-colors duration-700 ${
        lampOn
          ? "bg-[#0b0d09]"
          : "bg-[#050505]"
      }`}
    >
      {/* ========================================================
          Ambient background
         ======================================================== */}

      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${
          lampOn
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        <div className="absolute left-[12%] top-[20%] h-72 w-72 rounded-full bg-yellow-400/10 blur-[120px]" />

        <div className="absolute bottom-[10%] right-[10%] h-96 w-96 rounded-full bg-yellow-500/5 blur-[140px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,220,80,0.07),transparent_28%)]" />
      </div>

      {/* ========================================================
          Floating particles
         ======================================================== */}

      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${
          lampOn
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        <span className="absolute left-[6%] top-[12%] h-1 w-1 animate-pulse rounded-full bg-yellow-300 shadow-[0_0_12px_4px_rgba(250,204,21,0.35)]" />

        <span className="absolute left-[22%] top-[22%] h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-200 shadow-[0_0_14px_5px_rgba(250,204,21,0.3)]" />

        <span className="absolute left-[33%] top-[52%] h-1 w-1 animate-pulse rounded-full bg-yellow-300 shadow-[0_0_12px_4px_rgba(250,204,21,0.35)]" />

        <span className="absolute left-[12%] top-[78%] h-1 w-1 animate-pulse rounded-full bg-yellow-200 shadow-[0_0_12px_4px_rgba(250,204,21,0.3)]" />

        <span className="absolute left-[40%] top-[85%] h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-300 shadow-[0_0_15px_5px_rgba(250,204,21,0.3)]" />

        <span className="absolute left-[44%] top-[15%] h-1 w-1 animate-pulse rounded-full bg-yellow-200 shadow-[0_0_12px_4px_rgba(250,204,21,0.25)]" />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-[1fr_520px]">
        {/* ========================================================
            LEFT SIDE
           ======================================================== */}

        <section className="relative hidden overflow-hidden lg:flex">
          <div
            className={`absolute inset-0 bg-gradient-to-br from-[#11150d] via-[#0b0d09] to-[#080a07] transition-opacity duration-1000 ${
              lampOn
                ? "opacity-100"
                : "opacity-0"
            }`}
          />

          {/* ======================================================
              Lamp
             ====================================================== */}

          <div className="absolute left-[24%] top-[27%] flex h-[390px] w-[260px] flex-col items-center">
            {/* Light beam */}

            <div
              className={`absolute top-12 h-60 w-72 transition-opacity duration-700 ${
                lampOn
                  ? "opacity-90"
                  : "opacity-0"
              }`}
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,220,100,0.45), rgba(255,220,100,0.04))",

                clipPath:
                  "polygon(28% 0, 72% 0, 100% 100%, 0 100%)",
              }}
            />

            {/* Lamp shade */}

            <div
              className={`relative z-10 h-14 w-36 rounded-t-[70px] rounded-b-[12px] bg-[#151713] transition-shadow duration-700 ${
                lampOn
                  ? "shadow-[0_0_30px_8px_rgba(255,220,70,0.18)]"
                  : "shadow-none"
              }`}
            >
              <div
                className={`absolute bottom-0 left-1/2 h-1 w-28 -translate-x-1/2 bg-yellow-100/80 blur-sm transition-opacity duration-700 ${
                  lampOn
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              />
            </div>

            {/* Pole */}

            <div
              className={`absolute top-12 h-52 w-[3px] transition-colors duration-700 ${
                lampOn
                  ? "bg-[#736b4b]"
                  : "bg-[#262622]"
              }`}
            />

            {/* Pull cord */}

            <button
              type="button"
              onClick={handlePull}
              aria-label={
                lampOn
                  ? "Pull cord to turn lamp off"
                  : "Pull cord to turn lamp on"
              }
              className="absolute right-[27%] top-14 z-20 flex translate-x-1/2 cursor-pointer flex-col items-center px-3 pb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300/50"
            >
              <span
                className={`block w-px transition-[height] duration-200 ease-out ${
                  lampOn
                    ? "bg-[#8c8259]"
                    : "bg-[#4a4636]"
                }`}
                style={{
                  height: pulling
                    ? 118
                    : 92,
                }}
              />

              <span
                className={`block h-3 w-3 rounded-full transition-all duration-500 ${
                  lampOn
                    ? "bg-[#d9c26a] shadow-[0_0_14px_4px_rgba(250,220,100,0.35)]"
                    : "bg-[#c1ad62]"
                }`}
              />

              <span
                className={`mt-3 whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-yellow-200/50 transition-opacity duration-500 ${
                  lampOn
                    ? "opacity-0"
                    : "animate-pulse opacity-100"
                }`}
              >
                Pull to sign in
              </span>
            </button>

            {/* Base */}

            <div
              className={`absolute bottom-2 h-2 w-36 rounded-full bg-[#171914] transition-shadow duration-700 ${
                lampOn
                  ? "shadow-[0_0_20px_rgba(255,220,100,0.1)]"
                  : "shadow-none"
              }`}
            />

            <div className="absolute bottom-0 h-3 w-44 rounded-full bg-[#0d0f0b]" />
          </div>

          {/* ======================================================
              Brand
             ====================================================== */}

          <div
            className={`absolute bottom-12 left-14 transition-opacity duration-1000 ${
              lampOn
                ? "opacity-100"
                : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* DayFlow logo */}

              <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <Image
                  src="/dayflow-logo.png"
                  alt="DayFlow"
                  fill
                  priority
                  sizes="48px"
                  className="object-contain"
                />
              </div>

              <div>
                <p className="text-lg font-semibold tracking-tight">
                  DayFlow
                </p>

                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">
                  Personal OS
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-6 text-white/35">
              Plan your day. Protect your
              focus. Build momentum.
            </p>
          </div>
        </section>

        {/* ========================================================
            RIGHT SIDE
           ======================================================== */}

        <section className="relative flex min-h-screen items-center justify-center px-6 py-12">
          <div className="absolute inset-y-0 left-0 hidden w-px bg-white/5 lg:block" />

          {/* ======================================================
              Login form
             ====================================================== */}

          <div
            className={`w-full max-w-[430px] transition-all duration-700 ease-out ${
              lampOn
                ? "translate-y-0 opacity-100"
                : "lg:invisible lg:translate-y-6 lg:opacity-0"
            }`}
          >
            {/* ====================================================
                Mobile logo
               ==================================================== */}

            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <Image
                  src="/dayflow-logo.png"
                  alt="DayFlow"
                  fill
                  priority
                  sizes="48px"
                  className="object-contain"
                />
              </div>

              <div>
                <span className="text-lg font-semibold">
                  DayFlow
                </span>

                <p className="text-[8px] uppercase tracking-[0.25em] text-white/30">
                  Personal OS
                </p>
              </div>
            </div>

            {/* ====================================================
                Heading
               ==================================================== */}

            <div className="mb-8 text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-300/20 bg-yellow-300/10 shadow-[0_0_40px_rgba(250,204,21,0.08)]">
                <User
                  size={24}
                  className="text-yellow-300"
                />
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white">
                Welcome back
              </h1>

              <p className="mt-2 text-sm text-white/40">
                Sign in to continue to
                DayFlow
              </p>
            </div>

            {/* ====================================================
                Card
               ==================================================== */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* ==================================================
                    Email
                   ================================================== */}

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
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="h-12 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-yellow-300/50 focus:bg-black/40 focus:ring-2 focus:ring-yellow-300/10"
                    />
                  </div>
                </div>

                {/* ==================================================
                    Password
                   ================================================== */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-medium text-white/60"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                    />

                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      className="h-12 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-yellow-300/50 focus:bg-black/40 focus:ring-2 focus:ring-yellow-300/10"
                    />
                  </div>
                </div>

                {/* ==================================================
                    Error
                   ================================================== */}

                {error && (
                  <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {/* ==================================================
                    Sign in
                   ================================================== */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 text-sm font-semibold text-black shadow-[0_8px_30px_rgba(250,204,21,0.12)] transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Signing in..."
                    : "Sign in"}

                  {!loading && (
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}
                </button>
              </form>

              {/* ====================================================
                  Divider
                 ==================================================== */}

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                  Or continue with
                </span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* ====================================================
                  OAuth buttons
                 ==================================================== */}

              <div className="grid grid-cols-2 gap-3">
                {/* Google */}

                <button
                  type="button"
                  onClick={() =>
                    handleOAuth(
                      "Google"
                    )
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <GoogleLogo size={17} />

                  Google
                </button>

                {/* GitHub */}

                <button
                  type="button"
                  onClick={() =>
                    handleOAuth(
                      "GitHub"
                    )
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <GithubLogo size={17} />

                  GitHub
                </button>
              </div>

              {/* ====================================================
                  Register
                 ==================================================== */}

              <p className="mt-7 text-center text-sm text-white/35">
                Don&apos;t have an
                account?{" "}

                <Link
                  href="/register"
                  className="font-medium text-yellow-300 transition hover:text-yellow-200"
                >
                  Create one
                </Link>
              </p>
            </div>

            {/* ====================================================
                Footer
               ==================================================== */}

            <p className="mt-6 text-center text-xs text-white/20">
              © 2026 DayFlow
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}