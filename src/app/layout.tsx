import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EarnGames — Platform Game Internal & Sistem Poin",
  description: "Mainkan game internal EarnGames, selesaikan level, dan kumpulkan poin. Platform game dengan sistem poin yang jujur dan transparan.",
  keywords: ["game online", "poin", "level", "Indonesia", "EarnGames", "earngames.web.id"],
  authors: [{ name: "EarnGames" }],
  verification: { google: "MFTBP1pIqJDwKuUGAe15ysYpezdewwwyT8zKNS90" },
  metadataBase: new URL("https://earngames.web.id"),
  alternates: { canonical: "https://earngames.web.id" },
  openGraph: {
    title: "EarnGames — Platform Game Internal",
    description: "Mainkan game, selesaikan level, kumpulkan poin.",
    siteName: "EarnGames",
    url: "https://earngames.web.id",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EarnGames — Platform Game Internal",
    description: "Mainkan game, selesaikan level, kumpulkan poin.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <SonnerToaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
