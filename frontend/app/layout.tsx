import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RIP | Network Intelligence",
  description: "Road Intelligence Platform - Command Center",
};

import { Providers } from "./src/providers";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased bg-[#020617] text-slate-50`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <Toaster position="top-right" theme="dark" closeButton />
      </body>
    </html>
  );
}
