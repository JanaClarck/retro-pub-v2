import type { HomepageContent } from '@/types/firestore';

interface FooterProps {
  content: Pick<HomepageContent, 'workingHours' | 'address' | 'phone' | 'email' | 'socialLinks'>;
}

export default function Footer({ content }: FooterProps) {
  const { workingHours, address, phone, email, socialLinks } = content;

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">Retro Pub</h3>
            <p className="text-gray-400">{address}</p>
            <p className="text-gray-400 mt-2">{phone}</p>
            <p className="text-gray-400">{email}</p>
          </div>

          {/* Working Hours */}
          <div>
            <h3 className="text-xl font-bold mb-4">Opening Hours</h3>
            {Object.entries(workingHours).map(([day, hours]) => (
              <div key={day} className="flex justify-between text-gray-400">
                <span className="capitalize">{day}</span>
                <span>{hours}</span>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/menu" className="text-gray-400 hover:text-amber-500">Menu</a></li>
              <li><a href="/events" className="text-gray-400 hover:text-amber-500">Events</a></li>
              <li><a href="/gallery" className="text-gray-400 hover:text-amber-500">Gallery</a></li>
              <li><a href="/booking" className="text-gray-400 hover:text-amber-500">Book a Table</a></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" 
                   className="text-gray-400 hover:text-amber-500">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/>
                  </svg>
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                   className="text-gray-400 hover:text-amber-500">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2.2c3.2,0,3.6,0,4.9.1,3.3.1,4.8,1.7,4.9,4.9.1,1.3.1,1.6.1,4.8,0,3.2,0,3.6-.1,4.8-.1,3.2-1.7,4.8-4.9,4.9-1.3.1-1.6.1-4.9.1-3.2,0-3.6,0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.8,0-3.2,0-3.6.1-4.8C2.4,4,4,2.4,7.2,2.3,8.5,2.2,8.8,2.2,12,2.2ZM12,0C8.7,0,8.3,0,7.1.1,2.7.3.3,2.7.1,7.1,0,8.3,0,8.7,0,12s0,3.7.1,4.9c.2,4.4,2.6,6.8,7,7,1.2.1,1.6.1,4.9.1s3.7,0,4.9-.1c4.4-.2,6.8-2.6,7-7,.1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7,0,15.3,0,12,0Zm0,5.8A6.2,6.2,0,1,0,18.2,12,6.2,6.2,0,0,0,12,5.8ZM12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16ZM18.4,4.2a1.4,1.4,0,1,0,1.4,1.4A1.4,1.4,0,0,0,18.4,4.2Z"/>
                  </svg>
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                   className="text-gray-400 hover:text-amber-500">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Retro Pub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 