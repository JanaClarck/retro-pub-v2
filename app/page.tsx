import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const featuredEvents = [
    {
      id: 1,
      title: 'Live Jazz Night',
      date: '2024-05-15',
      time: '8:00 PM',
      description: 'Join us for an evening of smooth jazz with the Retro Quartet.',
      image: '/images/jazz-night.jpg',
    },
    {
      id: 2,
      title: 'Comedy Night',
      date: '2024-05-20',
      time: '7:30 PM',
      description: 'Laugh the night away with our lineup of top comedians.',
      image: '/images/comedy-night.jpg',
    },
    {
      id: 3,
      title: 'Pub Quiz',
      date: '2024-05-22',
      time: '7:00 PM',
      description: 'Test your knowledge and win great prizes!',
      image: '/images/pub-quiz.jpg',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px]">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Retro Pub Interior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to Retro Pub
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Where classic meets contemporary
            </p>
            <Link
              href="/booking"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              Book a Table
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="relative h-48">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-2">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {' at '}
                    {event.time}
                  </p>
                  <p className="text-gray-700 mb-4">{event.description}</p>
                  <Link
                    href={`/events#${event.id}`}
                    className="text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Learn More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/events"
              className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">About Retro Pub</h2>
              <p className="text-gray-700 mb-4">
                Step into a world where classic pub culture meets modern entertainment.
                Our carefully curated selection of drinks and regular events create
                the perfect atmosphere for any occasion.
              </p>
              <p className="text-gray-700 mb-4">
                Whether you're looking for a quiet drink, live music, or a night of
                laughter, Retro Pub has something for everyone.
              </p>
              <Link
                href="/about"
                className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                Learn More
              </Link>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/images/about-section.jpg"
                alt="Retro Pub Interior"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
