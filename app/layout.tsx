import type { Metadata, Viewport } from "next";
import { Instrument_Serif, DM_Mono } from "next/font/google";
import "./globals.css";

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const body = DM_Mono({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const SITE_URL = "https://kova-headphones.vercel.app";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "KOVA — Immersive Sound · Premium Headphones",
    template: "%s | KOVA",
  },
  description:
    "Experience pure sound with KOVA headphones. 40mm neodymium drivers, adaptive ANC, 50-hour battery, and spatial audio. Engineered for audiophiles.",
  keywords: [
    "KOVA",
    "headphones",
    "premium headphones",
    "noise cancelling",
    "ANC",
    "spatial audio",
    "wireless headphones",
  ],
  authors: [{ name: "KOVA Audio" }],
  creator: "KOVA Audio",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon-192.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "KOVA",
    title: "KOVA — Immersive Sound · Premium Headphones",
    description:
      "Experience pure sound with KOVA headphones. 40mm neodymium drivers, adaptive ANC, 50-hour battery, and spatial audio.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KOVA Premium Headphones",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KOVA — Immersive Sound",
    description:
      "Premium headphones engineered for pure sound. 40mm drivers, adaptive ANC, 50h battery.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ background: "#000" }}>
      <body className={`${display.variable} ${body.variable} grain`}>
        {children}
      </body>
    </html>
  );
}
