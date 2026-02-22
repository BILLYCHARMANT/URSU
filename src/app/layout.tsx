import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

const fontSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "URSU Projects | University of Rwanda Students' Union",
  description: "University of Rwanda Students' Union — project-based competition, progress tracking, and certification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontMono.variable} antialiased min-h-screen`}
        style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
