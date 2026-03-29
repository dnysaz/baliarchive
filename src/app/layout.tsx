import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

import prisma from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await (prisma as any).siteSettings.findFirst({ where: { id: 1 } });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const globalTitle = settings?.title || "BaliArchive — Bali, As The Locals Know It";
  const globalDesc = settings?.description || "BaliArchive — Bali as the locals know it. Insider guides to temples, culture, and hidden destinations across all 8 regencies.";
  const globalIcon = settings?.favicon || "/favicon.ico";
  const iconWithCache = `${globalIcon}${globalIcon.includes('?') ? '&' : '?'}v=1`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: globalTitle,
      template: `%s | ${globalTitle}`,
    },
    description: globalDesc,
    icons: {
      icon: iconWithCache,
      shortcut: iconWithCache,
      apple: iconWithCache,
    },
    openGraph: {
      title: globalTitle,
      description: globalDesc,
      siteName: globalTitle,
      locale: 'en_ID',
      type: 'website',
    }
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${cormorantGaramond.variable} h-full overflow-hidden`}
    >
      <body className="bg-black text-white selection:bg-amber-500/30 font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
