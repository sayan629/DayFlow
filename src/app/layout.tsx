import type { Metadata } from "next";
import "./globals.css";

import AlarmEngine from "@/components/alarms/AlarmEngine";
import AlarmRinging from "@/components/alarms/AlarmRinging";
import AuthBootstrap from "@/components/auth/AuthBootstrap";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "DayFlow | Personal OS",
  description:
    "DayFlow — your personal productivity operating system.",
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

        <AuthGuard>
          {children}
        </AuthGuard>

        <AlarmEngine />
        <AlarmRinging />
      </body>
    </html>
  );
}