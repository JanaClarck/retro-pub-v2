import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
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
    url: 'https://retropub.com',
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
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
