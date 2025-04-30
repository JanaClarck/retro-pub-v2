export const COLLECTIONS = {
  EVENTS: 'events',
  MENU: 'menuItems',
  GALLERY: 'gallery',
  SECTIONS: 'sections',
  BOOKINGS: 'bookings',
} as const;

// Type for collection names
export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

// Helper function to create section document IDs
export const SECTION_IDS = {
  MENU_DESCRIPTION: `${COLLECTIONS.SECTIONS}/menu.description`,
  GALLERY_DESCRIPTION: `${COLLECTIONS.SECTIONS}/gallery.description`,
} as const; 