import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "sonner";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export const metadata: Metadata = {
  title: {
    default: "Cognify-AI — AI-Powered Frontend Code Generation",
    template: "%s | Cognify-AI",
  },
  description:
    "Transform your UI ideas into production-ready React, HTML, and Tailwind code instantly. Live preview, Monaco editor, and one-click export.",
  keywords: [
    "AI code generation",
    "frontend code generator",
    "React generator",
    "Tailwind CSS AI",
    "UI builder",
    "no-code frontend",
  ],
  authors: [{ name: "Cognify-AI" }],
  creator: "Cognify-AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cognify-ai.com",
    title: "Cognify-AI — AI-Powered Frontend Code Generation",
    description:
      "Transform your UI ideas into production-ready React, HTML, and Tailwind code instantly.",
    siteName: "Cognify-AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cognify-AI",
    description: "AI-powered frontend code generation platform.",
    creator: "@cognifyai",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        {/* Skip-nav for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-xl focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ErrorBoundary>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </ErrorBoundary>
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
