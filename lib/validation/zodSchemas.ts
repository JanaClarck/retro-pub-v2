import { z } from 'zod';

// Base schema for Firestore documents
export const firestoreDocumentSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Menu Item schema
export const menuItemSchema = firestoreDocumentSchema.extend({
  name: z.string().min(1, 'Name is required'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0)
});

export type MenuItem = z.infer<typeof menuItemSchema>;

// Gallery Item schema
export const galleryItemSchema = firestoreDocumentSchema.extend({
  title: z.string().optional(),
  imageUrl: z.string().url(),
  categoryId: z.string(),
  fileName: z.string(),
});

export type GalleryItem = z.infer<typeof galleryItemSchema>;

// Gallery Category schema
export const galleryCategorySchema = firestoreDocumentSchema.extend({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
});

export type GalleryCategory = z.infer<typeof galleryCategorySchema>;

// Section Description schema
export const sectionDescriptionSchema = firestoreDocumentSchema.extend({
  content: z.string().min(1, 'Description content is required'),
  title: z.string().optional(),
});

export type SectionDescription = z.infer<typeof sectionDescriptionSchema>;

// Helper function for safe parsing with logging
export function safeParse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> | null {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Validation error:', result.error.errors);
    }
    return null;
  }

  return result.data;
}

// Helper function for parsing arrays
export function safeParseArray<T extends z.ZodType>(
  schema: T,
  data: unknown[]
): z.infer<T>[] {
  return data
    .map(item => safeParse(schema, item))
    .filter((item): item is z.infer<T> => item !== null);
} 