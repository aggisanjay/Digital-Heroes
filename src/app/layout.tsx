import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#06080F] text-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
