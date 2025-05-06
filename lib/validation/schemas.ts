import { z } from 'zod';

export const EventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  imageUrl: z.string().url('Invalid image URL'),
  price: z.number().min(0, 'Price must be positive'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  location: z.string().min(1, 'Location is required'),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
  isActive: z.boolean().default(true),
});

export const MenuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  isAvailable: z.boolean().default(true),
});

export const GalleryImageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  imageUrl: z.string().url('Invalid image URL'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
});

export const BookingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  partySize: z.number().int().min(1, 'Party size must be at least 1'),
  specialRequests: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).default('pending'),
  eventId: z.string().optional(),
}); 