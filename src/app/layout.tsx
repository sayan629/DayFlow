import type { Metadata } from "next";
import "./globals.css";

import AppShell from "@/components/layout/AppShell";
import AlarmEngine from "@/components/alarms/AlarmEngine";
import AlarmRinging from "@/components/alarms/AlarmRinging";

import AuthBootstrap from "@/components/auth/AuthBootstrap";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "DayFlow",
  description:
    "A personal productivity operating system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#09090b] text-white antialiased">
        <AuthBootstrap />

        <AlarmEngine />
        <AlarmRinging />

        <AuthGuard>
          <AppShell>
            {children}
          </AppShell>
        </AuthGuard>
      </body>
    </html>
  );
}