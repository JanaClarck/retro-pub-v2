'use client';

import Link from "next/link";
import { EventsPreview, InteriorSection } from "@/components/public";
import Hero from "@/components/public/Hero";

export default function Home() {
  return (
    <div>
      <Hero />

      {/* Featured Events */}
      <EventsPreview limit={3} showTitle={true} />

      {/* Interior Section */}
      <InteriorSection>
        <Link
          href="/public/about"
          className="inline-block mt-6 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
        >
          Learn More
        </Link>
      </InteriorSection>
    </div>
  );
} 