import type { Metadata } from "next";
import "./globals.css";

import AppShell from "@/components/layout/AppShell";
import AlarmEngine from "@/components/alarms/AlarmEngine";
import AlarmRinging from "@/components/alarms/AlarmRinging";

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
        <AlarmEngine />
        <AlarmRinging />

        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}