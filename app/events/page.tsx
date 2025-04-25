'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const events = [
  {
    id: 1,
    title: 'Live Jazz Night',
    date: '2024-05-15',
    time: '8:00 PM',
    description: 'Join us for an evening of smooth jazz with the Retro Quartet. Experience the magic of live jazz in our intimate setting.',
    image: '/images/jazz-night.jpg',
    type: 'music',
    price: '£15',
  },
  {
    id: 2,
    title: 'Comedy Night',
    date: '2024-05-20',
    time: '7:30 PM',
    description: 'Laugh the night away with our lineup of top comedians. Featuring both established acts and rising stars.',
    image: '/images/comedy-night.jpg',
    type: 'comedy',
    price: '£12',
  },
  {
    id: 3,
    title: 'Pub Quiz',
    date: '2024-05-22',
    time: '7:00 PM',
    description: 'Test your knowledge and win great prizes! Teams of up to 6 people welcome.',
    image: '/images/pub-quiz.jpg',
    type: 'quiz',
    price: '£5 per person',
  },
  {
    id: 4,
    title: 'Acoustic Session',
    date: '2024-05-25',
    time: '7:00 PM',
    description: 'Local artists perform their original music in an intimate acoustic setting.',
    image: '/images/acoustic.jpg',
    type: 'music',
    price: 'Free entry',
  },
  {
    id: 5,
    title: 'Trivia Night',
    date: '2024-05-29',
    time: '7:00 PM',
    description: 'Special themed trivia night with prizes for the winning team.',
    image: '/images/trivia.jpg',
    type: 'quiz',
    price: '£5 per person',
  },
];

const eventTypes = [
  { id: 'all', name: 'All Events' },
  { id: 'music', name: 'Music' },
  { id: 'comedy', name: 'Comedy' },
  { id: 'quiz', name: 'Quiz' },
];

export default function Events() {
  const [selectedType, setSelectedType] = useState('all');

  const filteredEvents = selectedType === 'all'
    ? events
    : events.filter(event => event.type === selectedType);

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12">Events Calendar</h1>

        {/* Event Type Filter */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            {eventTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  selectedType === type.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
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
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{event.price}</span>
                  <Link
                    href={`/booking?event=${event.id}`}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Events Message */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No events found for the selected category. Please check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 