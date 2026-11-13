import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import MotionProvider from "@/components/ui/MotionProvider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: {
    default: "Adamjee Computers · Inventory",
    template: "%s · Adamjee Computers",
  },
  description: "Inventory management for Adamjee Computers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sora.variable} antialiased`}>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
