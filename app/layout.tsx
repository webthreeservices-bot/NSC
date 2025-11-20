import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import { ErrorSuppressor } from "./error-suppressor";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { GlobalErrorHandler } from "@/components/GlobalErrorHandler";
import "@/lib/db-init-warmup"; // Initialize database connection pool early

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "NSC Bot - Neural Smart Capital | Automated Crypto Investment",
  description: "Invest in NSC Bot starting from $500 USDT. Earn up to 60% ROI over 12 months with automated trading bots.",
  icons: {
    icon: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.trongrid.io" />
        <link rel="dns-prefetch" href="https://bsc-dataseed.binance.org" />
      </head>
      <body className={inter.className}>
        <ErrorSuppressor />
        <GlobalErrorHandler />
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="dark"
        />
        <Providers>
          {children}
        </Providers>
        <CookieConsent />
        
        {/* Load lordicon script for animated icons */}
        <Script 
          src="https://cdn.lordicon.com/lordicon.js" 
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
