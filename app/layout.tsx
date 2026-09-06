import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import SiteFooter from "@/components/SiteFooter";
import {
  organizationJsonLd,
  webSiteJsonLd,
} from "@/lib/json-ld";
import { SITE_BASE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

const SITE_DESCRIPTION =
  "Compare eSIM data plans and prices by country. Cheapest plans, best-value picks, transparent scoring, and data updated every 12 hours.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_BASE_URL),
  title: {
    default: `${SITE_NAME} — Compare eSIM Plans by Country`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/",
    title: `${SITE_NAME} — Compare eSIM Plans by Country`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Compare eSIM Plans by Country`,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={webSiteJsonLd()} />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}