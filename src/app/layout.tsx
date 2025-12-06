import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { TRPCProvider } from "@/lib/trpc/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuillNext",
  description: "Curriculum generation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorantGaramond.variable}`}>
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}

