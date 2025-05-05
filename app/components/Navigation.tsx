import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/menu', label: 'Menu' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 text-white">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Retro Pub
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`hover:text-amber-500 transition-colors ${
                  pathname === href ? 'text-amber-500' : ''
                }`}
              >
                {label}
              </Link>
            ))}
            
            <Link
              href="/booking"
              className="bg-amber-600 px-6 py-2 rounded-lg hover:bg-amber-700 
                       transition-colors font-semibold"
            >
              Book a Table
            </Link>
          </div>

          <button className="md:hidden">
            <span className="sr-only">Open menu</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
} 