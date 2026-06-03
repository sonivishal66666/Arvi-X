# Arvis X — Premium AI-Powered Travel & Ticket Booking Platform

> **Arvis X** is a production-grade, ultra-premium AI-powered travel and ticket booking platform built with Next.js 15, TypeScript, TailwindCSS, and Node.js. Supports bus, train, flight, hotel, and event booking with a luxury UI inspired by Airbnb, Stripe, Linear, and Apple.

---

## ✨ Features

### 🚌 Core Booking Services
- **Bus Booking** — Interactive seat maps with real-time availability, AC Sleeper/Seater/Volvo/Luxury types, boarding point selection
- **Train Booking** — Multi-class selection (Sleeper, AC 3/2/1 Tier, Chair Car, General), PNR tracking
- **Flight Booking** — Airline comparison, cabin class selection (Economy—First Class), baggage info
- **Hotel Booking** — Room type selection, amenity filtering (Pool, Spa, Gym, etc.), star rating
- **Event Booking** — Ticket tiers (VIP/Premium/Standard), venue info, event type filtering (Concert, Sports, Theatre, Festival, Comedy, etc.)

### 🧠 AI Capabilities
- **Arvis AI Chat** — GPT-4-powered travel assistant with session history
- **AI Itinerary Generator** — Personalized travel plans with budget, duration, and interest optimization
- **Smart Recommendations** — ML-based personalized service suggestions
- **Voice Search** — Natural language voice-based search
- **Semantic Search** — Context-aware autocomplete and fuzzy search

### 💳 Payment & Wallet
- **Cashfree Integration** — Secure payment gateway with 100+ payment methods (cards, UPI, net banking, wallets)
- **Wallet System** — Prepaid digital wallet with top-ups, transaction ledger auditing, and simulated dev funding
- **Unified Refunds & Seat Release** — Seamless cancellation system that credits booking funds directly to the user's wallet, creates an audit-ready ledger transaction (tracking `balanceBefore` and `balanceAfter`), and releases specific seat coordinates (marking them `AVAILABLE`) rather than wiping out schedule matrices
- **Coupon/Voucher Engine** — Dynamic promo campaigns with admin control panel to create, activate, deactivate, limit usages, require order minimums, and define category scopes

### 🔒 Real-Time Features
- **Live Seat Locking** — Redis-based seat locking with configurable auto-release timer
- **WebSocket Updates** — Real-time seat availability and booking status via Socket.IO
- **Push Notifications** — Cross-platform notification support
- **Email Notifications** — Booking confirmation, cancellation, and payment receipts
- **QR Ticket Generation** — Dynamic QR code tickets with PDF download and print support

### 🔐 Security & Auth
- **JWT Authentication** — Short-lived access tokens with refresh token rotation
- **Google OAuth** — Social login with automatic profile creation
- **OTP Login** — Passwordless authentication via email OTP
- **Password Strength Indicator** — Real-time strength meter with requirement checklist (8+ chars, uppercase, lowercase, number, special)
- **Role-Based Access Control** — User, Vendor, Admin, Super Admin roles with granular permissions
- **Rate Limiting** — 5000 requests/minute with configurable limits
- **Fraud Detection** — Suspicious activity monitoring and alerting

### 👤 Dashboards & Management
- **User Dashboard** — Booking history, wallet balance, transaction ledger, profile management, cancellation options
- **Vendor Dashboard** — Service management, revenue analytics, payout tracking, booking overview
- **Admin Dashboard** — Redesigned ultra-premium dark-mode themed layout with live platform statistics, user management, vendor verification tables, transaction logs, fraud alerts, and coupon control centers
- **Wishlist** — Save and manage favorite services across all categories

### 🔍 Search & Discovery
- **Tabbed Search Widget Console** — Dedicated query components for buses, trains, flights, hotels, and events listing pages with customized filters
- **Quick Route Suggestions** — Popular routes for each category
- **Advanced Filtering** — Price range sliding filters, category-specific filters (bus type, airline, amenities, etc.)
- **Sort Options** — Price (asc/desc), rating, departure time
- **Global Cmd-K Search** — Keyboard shortcut (⌘K/Ctrl+K) for instant search anywhere

### 🎨 UI/UX
- **Glassmorphism Design** — Frosted glass cards, blurred backdrops, subtle borders, glowing orbs, and noise grain depth effects
- **Dark + Light Mode** — Global CSS theme support with premium transition toggles
- **Relatable Slideshow Imagery** — High-end curated homepage hero slideshow (high-speed bullet trains, sleek airliners, luxury resort pools, Volvo coaches)
- **12 Glassmorphic Informational & Support Pages** — Static pre-compiled pages for About (Founder Vishal Soni profile), Careers, Press, Blog, Contact (Founder Vishal Soni direct card), Help & FAQ accordion dropdowns, Safety, Cancellation terms, Refunds, Terms of Service, Privacy policy, and Cookie settings
- **Static Pre-Compilation** — Static generation (`○`) for support pages in production mode, guaranteeing instant navigation and zero page-transition latency
- **Cinematic Animations** — Framer Motion page transitions, scroll-triggered reveals, parallax effects
- **Animated Background Orbs** — Floating gradient orbs with pulse animations
- **Noise Grain Texture** — Subtle grain overlay for premium depth
- **ScrollToTop Button** — Floating action button for smooth navigation
- **Animated Stat Counters** — Number animations on homepage stats
- **Premium Typography** — Outfit & Inter fonts, optimized tracking and leading
- **Mobile-First Responsive** — Adaptive layouts for all screen sizes

### 📄 Ticket System
- **E-Ticket Generation** — Premium professional ticket page with QR code, passenger details, journey information, and invoice metadata
- **Ultra-Premium PDF Download** — Professional layout download via jsPDF + html2canvas
- **Print Support** — Print-optimized ticket layout
- **Ticket Verification** — Dedicated verification portal using the fallback chain QR validator

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui, Framer Motion, Zustand |
| **Backend** | Node.js, Express, TypeScript, ts-node-dev |
| **Database** | PostgreSQL 16 (Supabase), Prisma ORM |
| **Cache** | Redis 7 / ioredis-mock (caching, rate limiting, pub/sub, seat locking) |
| **Real-Time** | Socket.IO (WebSocket for live updates) |
| **Auth** | JWT (access + refresh tokens), Google OAuth, Email OTP |
| **Payments** | Cashfree Payment Gateway (test/sandbox mode) |
| **AI** | OpenAI GPT-4, Anthropic Claude |
| **Charts** | Recharts (analytics dashboards) |
| **PDF** | jsPDF, html2canvas (ticket generation) |

---

## 🏗️ Architecture

```
arvis-x/
├── apps/
│   ├── web/                          # Next.js 15 Frontend
│   │   ├── app/                      # App Router (30+ routes)
│   │   │   ├── (auth)/               # Login, Register, Verify OTP
│   │   │   ├── (dashboard)/          # Role-based dashboards
│   │   │   │   ├── admin/            # Redesigned Luxury Admin Console
│   │   │   │   ├── user/             # User Profile & Wallet Details
│   │   │   │   └── vendor/           # Vendor Service Controller
│   │   │   ├── about/                # Founder Profile (Vishal Soni)
│   │   │   ├── blog/                 # Travel Blogs & AI Pathfinding Info
│   │   │   ├── booking/              # Checkout with Coupon Engine
│   │   │   ├── bookings/             # Booking History & Refund Panel
│   │   │   ├── buses/                # Bus Listings & Tabbed Search
│   │   │   ├── cancellation/         # Cancellation Matrix & Schedules
│   │   │   ├── careers/              # Career Openings Board
│   │   │   ├── contact/              # Secure Contact Form (Vishal Soni Card)
│   │   │   ├── cookies/              # Cookie Policy Info
│   │   │   ├── events/               # Event Listings & Tabbed Search
│   │   │   ├── flights/              # Flight Listings & Tabbed Search
│   │   │   ├── help/                 # FAQ accordion & Help Center
│   │   │   ├── hotels/               # Hotel Listings & Tabbed Search
│   │   │   ├── payments/             # Order Redirects & Processing
│   │   │   ├── press/                # News & Press Announcements
│   │   │   ├── privacy/              # GDPR Privacy Guidelines
│   │   │   ├── refunds/              # Refund Policy Details
│   │   │   ├── safety/               # Platform Safety & Trust
│   │   │   ├── search/               # Advanced Search Filters
│   │   │   ├── services/             # Dynamic Details & Seat Mapping
│   │   │   ├── terms/                # Terms of Service
│   │   │   ├── tickets/              # QR E-Tickets & Receipt Render
│   │   │   ├── trains/               # Train Listings & Tabbed Search
│   │   │   ├── verify-ticket/        # QR Scanning Verification Page
│   │   │   ├── wallet/               # Wallet Balance & Ledger Credits
│   │   │   └── wishlist/             # Saved Services
│   │   ├── components/
│   │   │   ├── ui/                   # Custom UI controls (Input, Textarea, Button)
│   │   │   ├── layout/               # Nav, Footer, Glassmorphic Headers
│   │   │   ├── shared/               # Universal widgets & Tabbed Search
│   │   │   ├── booking/              # Premium SeatMap & Lock Indicator
│   │   │   └── ai/                   # AI Travel Companion chat
│   │   ├── lib/                      # API client, Zustand stores, utilities
│   │   ├── providers/                # Theme provider
│   │   └── styles/                   # Global CSS (noise-bg, orbs, animations)
│   └── api/                          # Express.js Backend
│       ├── src/
│       │   ├── config/               # Rate limiting, env config, Redis
│       │   ├── middleware/           # Auth, validation, error handling
│       │   ├── routes/               # Auth, services, bookings, payments, AI, wishlist, admin, vendor, tickets, notifications
│       │   ├── services/             # Business logic, seat locking, notifications
│       │   ├── validators/           # Zod request schemas
│       │   └── utils/                # Email, Redis, helpers
│       └── prisma/                   # Schema, migrations, seeds
├── docker/                           # Docker & Nginx configs
└── packages/                         # Shared packages (future)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ (or Supabase account)
- Redis 7+ (optional — uses ioredis-mock in dev)

### Installation

```bash
# Clone
git clone https://github.com/yourusername/arvis-x.git
cd arvis-x

# Install dependencies
npm install

# Environment setup
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local apps/web/.env.local

# Database setup
npm run db:generate
npm run db:push

# Seed 420 services (120 buses, 120 trains, 80 flights, 60 hotels, 40 events)
npm run db:seed

# Start development
npm run dev
```

### URLs
| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **API** | http://localhost:4000 |
| **API Health** | http://localhost:4000/api/health |
| **WebSocket** | ws://localhost:4000 |

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@arvisx.com | Admin@123 |
| **Vendor** | vendor@arvisx.com | User@123 |
| **User** | user@arvisx.com | User@123 |

### Cashfree Test Card
```
Card:  4111 1111 1111 1111
Expiry: Any future date
CVV:   123
OTP:   123456
```

---

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (supports rememberMe) |
| POST | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/login-otp` | Request OTP |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List services (paginated) |
| GET | `/api/services/featured` | Featured services |
| GET | `/api/services/:id` | Service details with schedules |
| GET | `/api/services/:id/schedules` | Available schedules |
| GET | `/api/services/:id/seats` | Seat map by schedule |
| GET | `/api/services/:id/reviews` | User reviews |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search` | Full-text search with category/sort/filter |
| GET | `/api/search/autocomplete` | Autocomplete suggestions |
| GET | `/api/search/voice` | Voice search transcription |

### Booking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking (with seat lock) |
| GET | `/api/bookings` | User's bookings |
| GET | `/api/bookings/:id` | Booking details with QR |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking and request refund |
| GET | `/api/bookings/:id/ticket` | Ticket data |
| GET | `/api/bookings/coupon/validate/:code` | Validate booking coupon and check applicability |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create Cashfree order |
| POST | `/api/payments/verify` | Verify payment status |
| POST | `/api/payments/refund` | Process refund |
| POST | `/api/payments/webhook` | Cashfree webhook handler |

### Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wishlist` | List saved services |
| POST | `/api/wishlist` | Add to wishlist |
| DELETE | `/api/wishlist/:serviceId` | Remove from wishlist |
| GET | `/api/wishlist/check/:serviceId` | Check if saved |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet` | Get wallet balance and transaction lists |
| POST | `/api/wallet/add` | Add funds via Cashfree |
| POST | `/api/wallet/verify-payment` | Verify wallet top-up |
| GET | `/api/wallet/transactions` | Transaction history (paginated) |
| POST | `/api/wallet/topup-dev` | Simulated dev wallet credit (Offline mode) |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get unread counts and notifications |
| PATCH | `/api/notifications/:id/read` | Mark individual notification as read |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read |
| DELETE | `/api/notifications/:id` | Delete notification |

### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tickets/verify` | Scan and verify QR ticket code |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI assistant |
| POST | `/api/ai/itinerary` | Generate travel itinerary |
| POST | `/api/ai/recommendations` | Get recommendations |
| GET | `/api/ai/sessions` | List chat sessions |
| GET | `/api/ai/sessions/:id` | Get session history |
| DELETE | `/api/ai/sessions/:id` | Delete session |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Platform analytics & metrics |
| GET | `/api/admin/users` | User management list |
| PATCH | `/api/admin/users/:id/status` | Toggle user status (block/unblock) |
| GET | `/api/admin/vendors` | Vendor list |
| PATCH | `/api/admin/vendors/:id/verify` | Verify vendor credentials |
| GET | `/api/admin/bookings` | All bookings |
| PATCH | `/api/admin/bookings/:id/cancel` | Cancel booking and release seats |
| GET | `/api/admin/analytics` | Revenue monthly metrics |
| GET | `/api/admin/coupons` | Coupon management list |
| POST | `/api/admin/coupons` | Create a new discount coupon |
| PATCH | `/api/admin/coupons/:id` | Update coupon status (activate/deactivate) |
| GET | `/api/admin/pricing-rules` | Dynamic pricing policies list |
| POST | `/api/admin/pricing-rules` | Create dynamic pricing rule |
| DELETE | `/api/admin/pricing-rules/:id` | Delete pricing rule |
| GET | `/api/admin/cms` | CMS page structures and banners |
| POST | `/api/admin/cms/pages` | Create custom CMS page |
| PATCH | `/api/admin/cms/pages/:id` | Update CMS page |
| GET | `/api/admin/fraud-alerts` | Fraud monitoring reports |

### Vendor
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vendor/dashboard` | Vendor analytics |
| GET | `/api/vendor/services` | Vendor's services |
| POST | `/api/vendor/services` | Create service |
| PUT | `/api/vendor/services/:id` | Update service |
| GET | `/api/vendor/bookings` | Vendor bookings |
| GET | `/api/vendor/payouts` | Payout history |
| GET | `/api/vendor/revenue` | Revenue analytics |

---

## 🧪 Seed Data

The database includes **420 services** across 5 categories:

| Category | Count | Details |
|----------|-------|---------|
| 🚌 Buses | 120 | AC Sleeper, AC Seater, Volvo, Luxury with multiple operators |
| 🚄 Trains | 120 | Shatabdi, Rajdhani, Duronto, Garib Rath, Express with class variants |
| ✈️ Flights | 80 | IndiGo, Air India, Vistara, SpiceJet, Go First, Akasa Air |
| 🏨 Hotels | 60 | Budget to 5-star luxury with pools, spas, gyms, restaurants |
| 🎫 Events | 40 | Concerts, Sports, Theatre, Festivals, Comedy, Exhibitions |

All services include real Unsplash images, schedules with departure/arrival times, dynamic pricing, and realistic discounts.

---

## 🔑 Key Architectural Decisions

- **Static Generation (`○`) for Info Hub** — The 12 company and support routes are statically generated by Next.js during compilation, allowing instant load states and zero click-latency when navigating.
- **Unified Seat Releasing & Auto-Refund Ledger** — Cancellation processes (client-facing and admin-facing) are executed in a single transaction that increments the user's wallet, appends a ledger log with before/after records, and releases only the seat indices matching passenger choices.
- **Dev Sandbox Wallet Top-ups** — The wallet features simulated `/topup-dev` endpoints to facilitate testing wallet-based checkouts locally without connecting to live payment providers.
- **Zustand Persist with `isAuthenticated`** — Critical fix: After Cashfree payment redirect (full page navigation), auth state is restored from localStorage. Previously only `user` was persisted, causing false `isAuthenticated` after redirect.
- **Cashfree redirect (`_self`)** — Full-page navigation instead of modal to avoid popup blockers; preserves auth redirect flow.
- **Rate Limiting at 5000 req/min** — Prevents 429 errors during payment verification polling while maintaining security.
- **`'9999999999'` Phone Fallback** — Cashfree test gateway requires non-empty phone; placeholder works in sandbox mode.
- **QR Code Fallback Chain** — `qrCode` → `bookingRef` → `booking.id` ensures ticket always renders.
- **Seat Locking via Redis** — Auto-releases locks after configurable timeout; WebSocket broadcasts availability changes.

---

## 📄 License

MIT License — see LICENSE file for details.

---

<p align="center">Built with ❤️ for the modern traveler</p>
