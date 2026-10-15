"use client";

import { useEffect, useState } from "react";

import {
  Bell,
  Check,
  Clock,
  Eye,
  EyeOff,
  Flame,
  ListChecks,
  Save,
  Settings,
  Target,
  User,
  Volume2,
} from "lucide-react";

import {
  StreakMode,
  usePreferencesStore,
} from "@/store/preferencesStore";

import { useSettingsStore } from "@/store/settingsStore";
import { useUserStore } from "@/store/userStore";

const streakOptions: {
  value: StreakMode;
  title: string;
  description: string;
  icon: typeof Flame;
}[] = [
  {
    value: "activity",
    title: "Activity",
    description:
      "Completed tasks and focus sessions both count.",
    icon: Flame,
  },
  {
    value: "tasks",
    title: "Tasks",
    description:
      "Only completed tasks count toward your streak.",
    icon: ListChecks,
  },
  {
    value: "focus",
    title: "Focus",
    description:
      "Only completed focus sessions count toward your streak.",
    icon: Target,
  },
];

const focusDurationOptions = [15, 25, 50, 90];

export default function SettingsPage() {
  // ------------------------------------------------------
  // Profile
  // ------------------------------------------------------

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // ------------------------------------------------------
  // Change Password
  // ------------------------------------------------------

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  // ------------------------------------------------------
  // Streak
  // ------------------------------------------------------

  const streakMode = usePreferencesStore(
    (state) => state.streakMode
  );

  const setStreakMode = usePreferencesStore(
    (state) => state.setStreakMode
  );

  // ------------------------------------------------------
  // Alarms
  // ------------------------------------------------------

  const notificationsEnabled = useSettingsStore(
    (state) => state.notificationsEnabled
  );

  const alarmSoundEnabled = useSettingsStore(
    (state) => state.alarmSoundEnabled
  );

  const defaultSnoozeMinutes = useSettingsStore(
    (state) => state.defaultSnoozeMinutes
  );

  // ------------------------------------------------------
  // Focus
  // ------------------------------------------------------

  const defaultFocusMinutes = useSettingsStore(
    (state) => state.defaultFocusMinutes
  );

  const setNotificationsEnabled = useSettingsStore(
    (state) => state.setNotificationsEnabled
  );

  const setAlarmSoundEnabled = useSettingsStore(
    (state) => state.setAlarmSoundEnabled
  );

  const setDefaultSnoozeMinutes = useSettingsStore(
    (state) => state.setDefaultSnoozeMinutes
  );

  const setDefaultFocusMinutes = useSettingsStore(
    (state) => state.setDefaultFocusMinutes
  );

  // ------------------------------------------------------
  // Profile Save
  // ------------------------------------------------------

  const handleSaveProfile = async () => {
    setProfileError("");
    setProfileMessage("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setProfileError("Name is required.");
      return;
    }

    if (trimmedName.length < 2) {
      setProfileError(
        "Name must be at least 2 characters."
      );
      return;
    }

    if (trimmedName.length > 100) {
      setProfileError(
        "Name must be less than 100 characters."
      );
      return;
    }

    setSavingProfile(true);

    try {
      const response = await fetch(
        "/api/user/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update profile."
        );
      }

      setUser(data.user);
      setName(data.user.name);

      setProfileMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ------------------------------------------------------
  // Change Password
  // ------------------------------------------------------

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordMessage("");

    if (!currentPassword) {
      setPasswordError(
        "Current password is required."
      );
      return;
    }

    if (!newPassword) {
      setPasswordError(
        "New password is required."
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (newPassword.length > 100) {
      setPasswordError(
        "New password must be less than 100 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(
        "/api/user/change-password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to change password."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordMessage(
        "Password changed successfully."
      );
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ------------------------------------------------------
  // Password Input Helper
  // ------------------------------------------------------

  const passwordInputClass =
    "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/20 focus:bg-white/[0.05]";

  // ------------------------------------------------------
  // Render
  // ------------------------------------------------------

  return (
    <main className="min-h-full bg-[#09090b] p-5 text-white md:p-8">
      <div className="mx-auto max-w-4xl">

        {/* ------------------------------------------------------ */}
        {/* Header */}
        {/* ------------------------------------------------------ */}

        <div className="mb-8">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06]">
            <Settings size={20} />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Settings
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Customize how DayFlow works for you.
          </p>
        </div>

        {/* ------------------------------------------------------ */}
        {/* Profile */}
        {/* ------------------------------------------------------ */}

        <section className="mb-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <User
                size={18}
                className="text-zinc-300"
              />

              <h2 className="text-sm font-semibold text-white">
                Profile
              </h2>
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              Manage your DayFlow profile information.
            </p>
          </div>

          <div className="space-y-8">

            {/* Avatar */}

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-lg font-semibold text-black">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user?.name
                    ?.split(" ")
                    .filter(Boolean)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "U"
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-white">
                  Profile picture
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Your profile picture comes from your
                  connected Google or GitHub account.
                </p>
              </div>
            </div>

            {/* Name */}

            <div>
              <label
                htmlFor="profile-name"
                className="mb-2 block text-xs font-medium text-zinc-300"
              >
                Name
              </label>

              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setProfileMessage("");
                  setProfileError("");
                }}
                placeholder="Enter your name"
                maxLength={100}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/20 focus:bg-white/[0.05]"
              />
            </div>

            {/* Email */}

            <div>
              <label
                htmlFor="profile-email"
                className="mb-2 block text-xs font-medium text-zinc-300"
              >
                Email
              </label>

              <input
                id="profile-email"
                type="email"
                value={user?.email ?? ""}
                disabled
                className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-zinc-500 outline-none"
              />

              <p className="mt-2 text-xs text-zinc-600">
                Your email address cannot be changed here.
              </p>
            </div>

            {/* Save Profile */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={savingProfile}
                onClick={handleSaveProfile}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProfile ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={15} />
                    Save Changes
                  </>
                )}
              </button>

              {profileMessage && (
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <Check size={14} />
                  {profileMessage}
                </div>
              )}

              {profileError && (
                <p className="text-xs text-red-400">
                  {profileError}
                </p>
              )}
            </div>

            {/* -------------------------------------------------- */}
            {/* Change Password */}
            {/* -------------------------------------------------- */}

            <div className="border-t border-white/10 pt-8">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-white">
                  Change Password
                </h3>

                <p className="mt-2 text-xs text-zinc-500">
                  Update your password to keep your account secure.
                </p>
              </div>

              <div className="space-y-4">

                {/* Current Password */}

                <div>
                  <label
                    htmlFor="current-password"
                    className="mb-2 block text-xs font-medium text-zinc-300"
                  >
                    Current Password
                  </label>

                  <div className="relative">
                    <input
                      id="current-password"
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      value={currentPassword}
                      onChange={(event) => {
                        setCurrentPassword(
                          event.target.value
                        );
                        setPasswordMessage("");
                        setPasswordError("");
                      }}
                      placeholder="Enter current password"
                      autoComplete="current-password"
                      className={passwordInputClass}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          !showCurrentPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                      aria-label={
                        showCurrentPassword
                          ? "Hide current password"
                          : "Show current password"
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}

                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-xs font-medium text-zinc-300"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      id="new-password"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(event) => {
                        setNewPassword(
                          event.target.value
                        );
                        setPasswordMessage("");
                        setPasswordError("");
                      }}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      className={passwordInputClass}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          !showNewPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                      aria-label={
                        showNewPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-zinc-600">
                    Use at least 8 characters.
                  </p>
                </div>

                {/* Confirm Password */}

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-xs font-medium text-zinc-300"
                  >
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(
                          event.target.value
                        );
                        setPasswordMessage("");
                        setPasswordError("");
                      }}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      className={passwordInputClass}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Action */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    disabled={changingPassword}
                    onClick={handleChangePassword}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {changingPassword ? (
                      "Changing Password..."
                    ) : (
                      <>
                        <Save size={15} />
                        Change Password
                      </>
                    )}
                  </button>

                  {passwordMessage && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <Check size={14} />
                      {passwordMessage}
                    </div>
                  )}

                  {passwordError && (
                    <p className="text-xs text-red-400">
                      {passwordError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ */}
        {/* Streak */}
        {/* ------------------------------------------------------ */}

        <section className="mb-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Flame
                size={18}
                className="text-orange-400"
              />

              <h2 className="text-sm font-semibold text-white">
                Streak
              </h2>
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              Choose what should count as a productive day.
            </p>
          </div>

          <div className="space-y-3">
            {streakOptions.map((option) => {
              const Icon = option.icon;

              const selected =
                streakMode === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setStreakMode(option.value)
                  }
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-white/20 bg-white/[0.07]"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      selected
                        ? "bg-white text-black"
                        : "bg-white/[0.06] text-zinc-400"
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">
                      {option.title}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {option.description}
                    </p>
                  </div>

                  {selected && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-black">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------------ */}
        {/* Alarms */}
        {/* ------------------------------------------------------ */}

        <section className="mb-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Bell
                size={18}
                className="text-zinc-300"
              />

              <h2 className="text-sm font-semibold text-white">
                Alarms
              </h2>
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              Control how DayFlow handles scheduled alarms.
            </p>
          </div>

          <div className="space-y-3">

            {/* Notifications */}

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-400">
                  <Bell size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Notifications
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Show a desktop notification when an alarm triggers.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={notificationsEnabled}
                onClick={() =>
                  setNotificationsEnabled(
                    !notificationsEnabled
                  )
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  notificationsEnabled
                    ? "bg-white"
                    : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full transition ${
                    notificationsEnabled
                      ? "left-6 bg-black"
                      : "left-1 bg-zinc-500"
                  }`}
                />
              </button>
            </div>

            {/* Alarm Sound */}

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-400">
                  <Volume2 size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Alarm Sound
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Play the alarm sound when a scheduled alarm starts.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={alarmSoundEnabled}
                onClick={() =>
                  setAlarmSoundEnabled(
                    !alarmSoundEnabled
                  )
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  alarmSoundEnabled
                    ? "bg-white"
                    : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full transition ${
                    alarmSoundEnabled
                      ? "left-6 bg-black"
                      : "left-1 bg-zinc-500"
                  }`}
                />
              </button>
            </div>

            {/* Snooze */}

            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Default Snooze
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Choose the default snooze duration.
                </p>
              </div>

              <div className="flex gap-2">
                {[5, 10, 15].map((minutes) => {
                  const selected =
                    defaultSnoozeMinutes === minutes;

                  return (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() =>
                        setDefaultSnoozeMinutes(
                          minutes
                        )
                      }
                      className={`rounded-xl border px-4 py-2 text-xs font-medium transition ${
                        selected
                          ? "border-white/20 bg-white text-black"
                          : "border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      {minutes} min
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ */}
        {/* Focus */}
        {/* ------------------------------------------------------ */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Clock
                size={18}
                className="text-zinc-300"
              />

              <h2 className="text-sm font-semibold text-white">
                Focus
              </h2>
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              Choose the default duration for Focus sessions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {focusDurationOptions.map((minutes) => {
              const selected =
                defaultFocusMinutes === minutes;

              return (
                <button
                  key={minutes}
                  type="button"
                  onClick={() =>
                    setDefaultFocusMinutes(minutes)
                  }
                  className={`rounded-xl border px-5 py-3 text-xs font-medium transition ${
                    selected
                      ? "border-white/20 bg-white text-black"
                      : "border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {minutes} min
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}