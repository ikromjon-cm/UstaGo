import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/layout/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "UstaGo - Uzbekistan's Service Marketplace",
  description: "Find the best masters for any service in Uzbekistan. Plumbers, electricians, welders, builders and more.",
  keywords: ["usta", "master", "service", "uzbekistan", "plumber", "electrician", "repair"],
  openGraph: {
    title: "UstaGo - Service Marketplace",
    description: "Find the best masters for any service in Uzbekistan",
    type: "website",
    locale: "uz_UZ",
    siteName: "UstaGo",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563EB" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-dark font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
