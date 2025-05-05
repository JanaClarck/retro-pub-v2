export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  createdAt: string;
}

export interface HeroContent {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage?: string;
}

export interface HomepageContent {
  hero: HeroContent;
  workingHours: {
    [key: string]: string; // e.g., "monday": "11:00 AM - 11:00 PM"
  };
  address: string;
  phone: string;
  email: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
} 