# SeraBhondu - Backend API

RESTful API and Real-Time WebSocket backend for the **SeraBhondu** classifieds marketplace.

## Tech Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB Atlas via Mongoose (`serabondhu`)
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies, Google OAuth 2.0, Phone SMS OTP, and Email OTP
- **Email Service**: Nodemailer (Gmail SMTP) for 60-second expiring OTP verification
- **Media Storage**: Cloudinary CDN for user profile avatars and listing images
- **Real-Time Communication**: Socket.IO for instant chat, typing status, and presence indicators
- **Security**: CORS, bcryptjs password hashing, role-based access control (RBAC), protected routes

## Endpoints

### Auth (`/api/auth`)
- `POST /api/auth/google` - Google OAuth ID token verification & authentication
- `POST /api/auth/send-email-otp` - Send 6-digit email OTP
- `POST /api/auth/verify-email-otp` - Verify email OTP
- `POST /api/auth/set-email-password` - Set password for new email user
- `POST /api/auth/send-phone-otp` - Send SMS OTP to Bangladeshi phone (+880)
- `POST /api/auth/verify-phone-otp` - Verify phone OTP & auto-register / login
- `POST /api/auth/signup` - Register new user & send OTP
- `POST /api/auth/verify-otp` - Verify OTP, activate account & return JWT
- `POST /api/auth/resend-otp` - Resend fresh OTP
- `POST /api/auth/login` - Authenticate user & issue JWT
- `POST /api/auth/logout` - Clear auth session cookie
- `GET /api/auth/me` - Get current authenticated user profile
- `PUT /api/auth/profile` - Update profile details
- `POST /api/auth/avatar` - Upload profile picture to Cloudinary

### Advertisements (`/api/advertisements`)
- `GET /api/advertisements` - Get approved advertisements with division/city & category filters
- `GET /api/advertisements/featured` - Get featured advertisements
- `GET /api/advertisements/search` - Full-text marketplace search
- `GET /api/advertisements/slug/:slug` - Get advertisement by SEO slug
- `GET /api/advertisements/my` - Get current user's advertisements
- `POST /api/advertisements` - Post a new advertisement
- `PUT /api/advertisements/:id` - Update existing advertisement
- `DELETE /api/advertisements/:id` - Delete advertisement

### Admin (`/api/admin`)
- `POST /api/admin/login` - Superadmin login
- `GET /api/admin/stats` - Marketplace dashboard analytics
- `GET /api/admin/advertisements` - All advertisements (pending, approved, rejected)
- `PUT /api/admin/advertisements/:id/approve` - Approve advertisement
- `PUT /api/admin/advertisements/:id/reject` - Reject advertisement with reason
- `PUT /api/admin/advertisements/:id/feature` - Toggle featured status
- `GET /api/admin/users` - Registered user directory
- `PUT /api/admin/users/:id/status` - Suspend / activate user
- `GET /api/admin/audit-logs` - Moderation and activity audit trail
- `GET /api/admin/deals` - Completed transactions & sold items audit
- `GET /api/admin/product-history/:id` - Price and lifecycle history for listing
- `GET /api/admin/chat-transcript/:convId` - Buyer-seller message audit transcript

### Chat (`/api/chat`)
- `GET /api/chat/conversations` - User conversation list
- `GET /api/chat/messages/:id` - Get conversation messages
- `POST /api/chat/messages` - Send message with attachments
- `POST /api/chat/upload-attachment` - Upload chat image/document attachment

### Banners (`/api/banners`)
- `GET /api/banners` - Get active homepage banners
- `GET /api/banners/admin` - Admin banner list
- `POST /api/banners` - Create banner
- `PUT /api/banners/:id` - Update banner
- `DELETE /api/banners/:id` - Delete banner
- `PUT /api/banners/reorder` - Reorder banners

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env` (refer to `.env.example`).

3. Start development server:
   ```bash
   npm run dev
   ```
