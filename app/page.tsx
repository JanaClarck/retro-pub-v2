import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-black text-white">
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-50"></div>
        <div className="relative container mx-auto px-6 py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">Welcome to Retro Pub</h1>
            <p className="text-xl mb-8">
              Experience the charm of a traditional British pub with our carefully curated selection 
              of beers, classic pub food, and regular live events.
            </p>
            <Link 
              href="/booking" 
              className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg 
                       hover:bg-amber-700 transition-colors text-lg font-semibold"
            >
              Book a Table
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">Craft Beers</h3>
              <p className="text-gray-600">Discover our selection of local and international craft beers.</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">Live Events</h3>
              <p className="text-gray-600">Join us for live music, quiz nights, and special events.</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">British Cuisine</h3>
              <p className="text-gray-600">Enjoy traditional British pub food made with local ingredients.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 