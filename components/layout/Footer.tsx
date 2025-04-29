import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2">
              <p>123 Pub Street</p>
              <p>City, State 12345</p>
              <p>Phone: (555) 123-4567</p>
              <p>Email: info@retropub.com</p>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Opening Hours</h3>
            <div className="space-y-2">
              <p>Monday - Thursday: 4pm - 11pm</p>
              <p>Friday - Saturday: 4pm - 2am</p>
              <p>Sunday: 4pm - 10pm</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <p><Link href="/menu" className="hover:text-amber-500">Menu</Link></p>
              <p><Link href="/events" className="hover:text-amber-500">Events</Link></p>
              <p><Link href="/booking" className="hover:text-amber-500">Book a Table</Link></p>
              <p><Link href="/about" className="hover:text-amber-500">About Us</Link></p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Retro Pub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 