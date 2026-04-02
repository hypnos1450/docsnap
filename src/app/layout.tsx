import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DocSnap — Screenshot-to-Documentation Generator",
  description: "Upload screenshots of any workflow. Get step-by-step documentation with annotations in seconds.",
  keywords: "documentation, screenshots, AI docs, step-by-step, SOP, technical writing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
