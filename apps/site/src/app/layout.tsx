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
        {/*
         * `iki-app` is the stacking root §13 names: `theme.css` gives it
         * `isolation: isolate`, so the overlays Base UI portals to <body> sit
         * above everything in here whatever z-index the page uses.
         *
         * `min-w-0` because this is a flex item of <body>, and a flex item will
         * not shrink below its min-content width by default. Without it the
         * widest line of any code block or table set that width, and every page
         * scrolled sideways at 375px. The `min-w-0` on the column below is the
         * same rule one row down, and both are needed: that one lets the
         * column shrink inside this row, this one stops the row growing.
         * `site-rules.test.ts` fails if either goes.
         */}
        <div className="iki-app flex min-h-full min-w-0 flex-1">
          <a
            href="#main-content"
            className="sr-only z-50 rounded-md bg-paper px-3 py-2 text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
          >
            Skip to content
          </a>
          <SiteNav />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
