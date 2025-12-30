import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SeoulGigibae - 외국인 환자 맞춤 병원 매칭 플랫폼",
  description: "서울기기배 - 외국인 환자를 위한 최고의 병원을 찾아드립니다",
};

import { Providers } from "./providers";
import ComparisonBar from "./_components/ComparisonBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <ComparisonBar />
        </Providers>
      </body>
    </html>
  );
}
