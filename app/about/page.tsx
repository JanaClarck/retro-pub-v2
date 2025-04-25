'use client';

import { useState } from 'react';
import Image from 'next/image';

const openingHours = [
  { day: 'Monday - Thursday', hours: '4:00 PM - 11:00 PM' },
  { day: 'Friday - Saturday', hours: '4:00 PM - 1:00 AM' },
  { day: 'Sunday', hours: '2:00 PM - 10:00 PM' },
];

export default function About() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Contact form submitted:', formData);
  };

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12">About Us</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* About Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Our Story</h2>
            <p className="text-gray-700 mb-4">
              Retro Pub was established in 2010 with a vision to create a unique space
              that combines the charm of traditional British pubs with modern entertainment.
              Our passion for quality drinks, delicious food, and memorable experiences
              has made us a beloved destination in the heart of London.
            </p>
            <p className="text-gray-700 mb-4">
              We take pride in our carefully curated selection of craft beers, classic
              cocktails, and fine wines. Our kitchen serves up delicious pub fare made
              with locally sourced ingredients, and our regular events bring the
              community together for unforgettable nights of entertainment.
            </p>
            <div className="relative h-64 mt-8 rounded-lg overflow-hidden">
              <Image
                src="/images/about-interior.jpg"
                alt="Retro Pub Interior"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Address</h3>
                  <p className="text-gray-700">123 Retro Street</p>
                  <p className="text-gray-700">London, UK</p>
                </div>
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-gray-700">+44 123 456 7890</p>
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-gray-700">info@retropub.com</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">Opening Hours</h3>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <ul className="space-y-2">
                {openingHours.map((item) => (
                  <li key={item.day} className="flex justify-between">
                    <span className="font-medium">{item.day}</span>
                    <span className="text-gray-700">{item.hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            <h3 className="text-xl font-bold mb-4">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Find Us</h2>
          <div className="relative h-96 rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.9999999999995!2d-0.1277584!3d51.5073509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDMwJzI2LjUiTiAwwrAwNyczOS45Ilc!5e0!3m2!1sen!2suk!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 