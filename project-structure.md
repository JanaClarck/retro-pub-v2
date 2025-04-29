retro-pub/
├── app/                              # App Router pages
│   ├── (auth)/                       # Auth-related routes group
│   │   ├── admin/                    # Admin routes
│   │   │   ├── dashboard/           
│   │   │   ├── events/              
│   │   │   ├── gallery/             
│   │   │   ├── menu/                
│   │   │   └── login/               
│   │   └── layout.tsx               # Auth layout with protection
│   ├── (public)/                    # Public routes group
│   │   ├── about/                   
│   │   ├── booking/                 
│   │   ├── contact/                 
│   │   ├── events/                  
│   │   ├── gallery/                 
│   │   └── menu/                    
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home page
├── components/                       # Reusable components
│   ├── admin/                       # Admin-specific components
│   │   ├── dashboard/              
│   │   │   ├── StatsCard.tsx
│   │   │   └── ActivityFeed.tsx
│   │   ├── events/
│   │   │   ├── EventForm.tsx
│   │   │   └── EventList.tsx
│   │   ├── gallery/
│   │   │   ├── ImageUploader.tsx
│   │   │   └── GalleryManager.tsx
│   │   └── menu/
│   │       ├── MenuItemForm.tsx
│   │       └── MenuList.tsx
│   ├── layout/                      # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── AdminHeader.tsx
│   │   └── Sidebar.tsx
│   └── ui/                          # Shared UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── Modal.tsx
├── firebase/                        # Firebase configuration
│   ├── admin.ts                     # Admin SDK config
│   ├── client.ts                    # Client SDK config
│   └── config.ts                    # Firebase config object
├── lib/                            # Core functionality
│   ├── auth/                       # Authentication logic
│   │   ├── useAuth.ts             # Auth hook
│   │   └── useAdminAuth.ts        # Admin auth hook
│   └── firebase/                   # Firebase services
│       ├── storage.ts             # Storage operations
│       ├── firestore.ts           # Firestore operations
│       └── auth.ts               # Auth operations
├── services/                       # Business logic services
│   ├── events.ts                  # Events CRUD
│   ├── gallery.ts                 # Gallery CRUD
│   ├── menu.ts                    # Menu CRUD
│   └── booking.ts                 # Booking operations
├── types/                         # TypeScript types
│   ├── auth.ts                    # Auth-related types
│   ├── events.ts                  # Event types
│   ├── gallery.ts                 # Gallery types
│   └── menu.ts                    # Menu types
├── utils/                         # Utility functions
│   ├── dates.ts                   # Date formatting
│   ├── validation.ts              # Form validation
│   └── formatting.ts              # Text formatting
├── public/                        # Static assets
│   ├── images/                    # Local images
│   └── icons/                     # Icons
└── scripts/                       # Utility scripts
    └── upload-images.ts           # Image upload script

Key Files Explanation:

1. App Router Structure:
   - (auth) group: Protected admin routes
   - (public) group: Public-facing pages
   - layout.tsx: Root layout with common elements

2. Components Organization:
   - admin/: Admin-specific components organized by feature
   - layout/: Common layout components
   - ui/: Reusable UI components

3. Firebase Setup:
   - admin.ts: Admin SDK for server operations
   - client.ts: Client SDK for browser
   - config.ts: Firebase configuration

4. Services Layer:
   - Separates business logic from components
   - One file per feature (events, gallery, etc.)
   - Handles all Firebase operations

5. Types:
   - Separate type definitions by feature
   - Ensures type safety across the application

6. Utils:
   - Common utility functions
   - Shared helpers for formatting, validation, etc.

Best Practices:
1. Use feature-based organization within admin components
2. Keep Firebase operations in services layer
3. Maintain clear separation between admin and public components
4. Use TypeScript for better type safety
5. Keep components small and focused
6. Use shared UI components for consistency 