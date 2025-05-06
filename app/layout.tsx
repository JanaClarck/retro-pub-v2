import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://retropub.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Retro Pub - Traditional British Pub Experience',
    template: '%s | Retro Pub'
  },
  description: "Experience the charm of a traditional British pub with our carefully curated selection of beers, classic pub food, and regular live events.",
  keywords: ["pub", "british pub", "beer", "events", "live music", "traditional food"],
  authors: [{ name: 'Retro Pub' }],
  openGraph: {
    title: 'Retro Pub - Traditional British Pub Experience',
    description: 'Experience the charm of a traditional British pub with our carefully curated selection of beers, classic pub food, and regular live events.',
    url: 'https://retropub.vercel.app',
    siteName: 'Retro Pub',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Retro Pub - Traditional British Pub Experience',
    description: 'Experience the charm of a traditional British pub with our carefully curated selection of beers, classic pub food, and regular live events.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
