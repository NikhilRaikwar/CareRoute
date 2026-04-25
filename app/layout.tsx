import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { DM_Mono, DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "CareRoute",
  description:
    "CareRoute is an Arc-native clinical workflow assistant where multi-agent triage steps settle in sub-cent USDC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${dmSans.variable} ${dmMono.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
