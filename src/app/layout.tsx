import type { Metadata } from "next";
import { Roboto, Inter } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Digital Heroes — Performance, Prizes & Purpose",
  description: "Track your Stableford scores, enter the monthly jackpot draw, and fund life-changing charities with every round you play.",
  keywords: ["golf scores", "charity golf", "prize draw", "stableford", "fundraising", "digital heroes"],
  openGraph: {
    title: "Digital Heroes — Play with Purpose",
    description: "Combine golf performance tracking with monthly jackpot draws and transparent charity fundraising.",
    type: "website",
  },
};

import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${inter.variable} antialiased scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#111827]">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
