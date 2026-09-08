import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XYZ Buying House | Apparel Sourcing Platform",
  description: "B2B Apparel Sourcing, Ethical Garment Manufacturing Management, and Buyer Order Telemetry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <AuthProvider>
          <main className="flex-grow">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
