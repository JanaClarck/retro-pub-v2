export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Location & Contact</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              <strong className="block">Address:</strong>
              123 Pub Street<br />
              London, SW1A 1AA<br />
              United Kingdom
            </p>
            <p className="text-gray-700">
              <strong className="block">Phone:</strong>
              <a href="tel:+442012345678" className="hover:text-amber-600">+44 20 1234 5678</a>
            </p>
            <p className="text-gray-700">
              <strong className="block">Email:</strong>
              <a href="mailto:info@retropub.com" className="hover:text-amber-600">
                info@retropub.com
              </a>
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Opening Hours</h2>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="font-medium">Monday - Thursday</span>
              <span className="text-gray-600">12:00 - 23:00</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Friday - Saturday</span>
              <span className="text-gray-600">12:00 - 01:00</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Sunday</span>
              <span className="text-gray-600">12:00 - 22:30</span>
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Kitchen Hours</h3>
            <p className="text-gray-700">
              Food is served daily from 12:00 to 21:00
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 