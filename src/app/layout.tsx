import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { AppLayoutShell } from "@/components/layout/AppLayoutShell";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#014923",
};

export const metadata: Metadata = {
  title: "Serabondhu — কিনুন • বিক্রি করুন • খুঁজে নিন বাংলায় | serabondhu.net",
  description:
    "Serabondhu (serabondhu.net) is Bangladesh's premier online classifieds marketplace. Buy and sell used cars, bikes, mobile phones, apartments, electronics, and furniture with verified buyers and sellers across Dhaka, Chattogram, Sylhet, and all 64 districts of Bangladesh.",
  keywords: [
    "serabondhu",
    "serabondhu.net",
    "bangladesh classifieds",
    "buy sell bangladesh",
    "bikroy alternative",
    "used cars dhaka",
    "used mobiles chattogram",
    "apartments in bangladesh",
    "কিনুন বিক্রি করুন",
    "খুঁজে নিন বাংলায়",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#F7F9FC] text-slate-900 selection:bg-[#E30613] selection:text-white" suppressHydrationWarning>
        <ReduxProvider>
          <AppLayoutShell>
            {children}
          </AppLayoutShell>
        </ReduxProvider>
      </body>
    </html>
  );
}
