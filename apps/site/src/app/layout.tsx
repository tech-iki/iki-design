import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";

/*
 * Geist, self-hosted by next/font, on the two custom properties the package's
 * theme.css reads (`--font-geist-sans`, `--font-geist-mono`). This is exactly
 * what a consuming Next app does; a plain-CSS consumer loads Geist itself.
 */
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "IKI design", template: "%s · IKI design" },
  description:
    "The design system of the Islands Knowledge Institute: its tokens, status colours, controls and components, rendered live from @tech-iki/design.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full">
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-paper px-3 py-2 text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
        >
          Skip to content
        </a>
        <SiteNav />
        <div className="min-w-0 flex-1">{children}</div>
      </body>
    </html>
  );
}
