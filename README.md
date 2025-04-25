# Retro Pub Website

A modern, responsive website for Retro Pub built with Next.js and Tailwind CSS.

## Features

- Responsive design for all devices
- Modern UI with Tailwind CSS
- SEO optimized
- Interactive booking system
- Event calendar
- Photo gallery
- Contact form
- Google Maps integration

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- React
- Google Maps API

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/retro-pub.git
cd retro-pub
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Deployment

The easiest way to deploy this website is to use [Vercel](https://vercel.com):

1. Push your code to a GitHub repository.

2. Import your project into Vercel:
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add your environment variables
   - Click "Deploy"

3. Your site will be deployed at `https://your-project-name.vercel.app`

## Project Structure

```
retro-pub/
├── app/
│   ├── components/         # Reusable components
│   ├── about/             # About/Contact page
│   ├── booking/           # Booking page
│   ├── events/            # Events page
│   ├── gallery/           # Gallery page
│   ├── menu/              # Menu page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── public/
│   └── images/            # Static images
├── types/                 # TypeScript types
└── lib/                   # Utility functions
```

## Image Requirements

Place all images in the `public/images/` directory with the following structure:

```
public/images/
├── gallery/
│   ├── interior-1.jpg
│   ├── jazz-night-1.jpg
│   └── ...
├── hero-bg.jpg
├── about-interior.jpg
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or suggestions, please contact us at info@retropub.com
