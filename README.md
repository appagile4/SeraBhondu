# SeraBhondu - Frontend Web Application

Modern, responsive web frontend for **SeraBhondu** (Bangladesh's premier classifieds marketplace).

## Features
- **Official Branding**: Custom branding based on the official KhojoBangla logo (National Martyrs' Memorial, Bangladesh Flag Green `#014923`, and Crimson Red `#E30613`).
- **Bangladesh Localization**: Currency in Bangladeshi Taka (`৳` / BDT), country code `+880`, 8 Divisions (Dhaka, Chattogram, Rajshahi, Khulna, Barishal, Sylhet, Rangpur, Mymensingh) and major cities/districts.
- **Unified Authentication**: Bottom-sheet auth modal supporting Google OAuth 2.0, Email OTP, and Phone SMS OTP with zero passwords needed for phone users.
- **Interactive Geolocation**: Leaflet map picker centered on Bangladesh with reverse geocoding fallback for major divisions and districts.
- **Marketplace Browsing**: Instant search with suggestions, advanced filters (price range, condition, category, division/city), and sorting.
- **Real-Time Chat**: WhatsApp Web-styled split-view messaging with Socket.IO, image/file attachments, reply threads, and active presence.
- **Superadmin Portal**: Comprehensive moderation suite (`/admin`) for reviewing pending ads, managing users, viewing deal lifecycles, and configuring dynamic banners.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19, Tailwind CSS v4, Lucide React, Framer Motion
- **State Management**: Redux Toolkit & React Context
- **Real-Time**: Socket.IO Client
- **Maps**: Leaflet

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=579629075726-d0jh0p7ovcc6pc17bmlnk3i1ho805fli.apps.googleusercontent.com
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```
