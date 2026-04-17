import type { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";
import { fontSans, fontMono } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
