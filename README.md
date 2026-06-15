<div align="center">

<img src="frontend/public/logo.png" alt="Arvis X Logo" width="280" />

### ✦ Next-Generation AI-Powered Travel & Booking Platform ✦

<br />

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

[![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br />

> **Arvis X** is a production-grade, ultra-premium AI-powered travel and ticket booking platform.  
> Book buses, trains, flights, hotels and events — all in one beautifully crafted experience.  
> Inspired by the design philosophy of **Airbnb**, **Stripe**, **Linear**, and **Apple**.

<br />

---

</div>

<br />

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
- [🏗️ Architecture](#%EF%B8%8F-architecture)
- [☁️ Cloud, Serverless & DevOps](#-cloud-serverless--devops)
- [🚀 Quick Start](#-quick-start)
- [📊 API Reference](#-api-reference)
- [🗄️ Seed Data](#%EF%B8%8F-seed-data)
- [🔑 Architectural Decisions](#-architectural-decisions)
- [📄 License](#-license)

<br />

## ✨ Features

<table>
<tr>
<td width="50%">

### 🚌 Core Booking Services

| Service | Highlights |
|---------|-----------|
| 🚌 **Bus** | Interactive seat maps · AC Sleeper · Volvo · Luxury |
| 🚄 **Train** | PNR tracking · Multi-class · Rajdhani · Shatabdi |
| ✈️ **Flight** | Airline comparison · Economy → First Class |
| 🏨 **Hotel** | Pool · Spa · Gym filters · Star rating |
| 🎫 **Event** | VIP / Premium / Standard · Concerts · Sports |

</td>
<td width="50%">

### 🧠 AI Capabilities

| Feature | Description |
|---------|------------|
| 💬 **AI Chat** | GPT-4 travel assistant with session memory |
| 🗺️ **Itinerary** | Personalized plans with budget optimization |
| 🎯 **Smart Recs** | ML-powered personalized suggestions |
| 🎙️ **Voice Search** | Natural language travel search |
| 🔎 **Semantic** | Context-aware autocomplete & fuzzy search |

</td>
</tr>
</table>

---

### 💳 Payments, Wallet & Refunds

```
┌─────────────────────────────────────────────────────────────────┐
│  CASHFREE GATEWAY          WALLET SYSTEM        COUPON ENGINE   │
│  ─────────────────         ─────────────        ─────────────   │
│  • 100+ pay methods   →    • Digital wallet →   • Admin codes   │
│  • UPI / Cards / NB        • Ledger audits      • % or fixed    │
│  • Auto webhook            • Auto top-up        • Min orders    │
│                            • Dev simulation     • Per-user cap  │
└─────────────────────────────────────────────────────────────────┘
        ↓ On Cancellation
┌──────────────────────────────────────────┐
│  UNIFIED REFUND + SEAT RELEASE ENGINE    │
│  ──────────────────────────────────────  │
│  1. Credit finalAmount → User Wallet     │
│  2. Log WalletTransaction (CREDIT)       │
│  3. Release only specific booked seats   │
│  4. Invalidate seat-map cache (Redis)    │
└──────────────────────────────────────────┘
```

---

### 🔒 Real-Time & Security

<table>
<tr>
<td width="50%">

**⚡ Real-Time Infrastructure**
- Redis seat locking with configurable TTL
- Socket.IO WebSocket broadcasts
- Live seat availability streaming
- In-app push & email notifications
- QR-coded E-Tickets with PDF export

</td>
<td width="50%">

**🛡️ Security & Auth**
- JWT access + refresh token rotation
- Google OAuth one-click login
- Passwordless OTP authentication
- Password strength meter (8+ requirements)
- Role-Based Access: User · Vendor · Admin · Super Admin
- Rate limiting: 5,000 req/min
- Fraud detection & alerting

</td>
</tr>
</table>

---

### 👤 Dashboards

```
  ┌─────────────────┐   ┌──────────────────┐   ┌────────────────────────────────────┐
  │   USER PANEL    │   │  VENDOR CONSOLE  │   │       ADMIN COMMAND CENTER         │
  │─────────────────│   │──────────────────│   │────────────────────────────────────│
  │ • Booking hist  │   │ • Service mgmt   │   │ • Live platform analytics           │
  │ • Wallet & txns │   │ • Revenue charts │   │ • User & vendor management          │
  │ • QR E-Tickets  │   │ • Payout tracker │   │ • Coupon/voucher control center     │
  │ • Cancel & rfnd │   │ • Booking view   │   │ • Fraud alert monitoring            │
  │ • Wishlist      │   │ • Vendor profile │   │ • Dynamic pricing rules             │
  └─────────────────┘   └──────────────────┘   │ • CMS page & banner manager        │
                                                └────────────────────────────────────┘
```

---

### 🎨 UI / UX Design System

| Feature | Detail |
|---------|--------|
| 🔮 **Glassmorphism** | Frosted cards · Blurred backdrops · Glowing orbs · Noise grain depth |
| 🌗 **Dark + Light Mode** | Seamless toggle with smooth CSS transitions |
| 🎞️ **Cinematic Animations** | Framer Motion · Scroll reveals · Parallax effects |
| 🌄 **Hero Slideshow** | Bullet trains · Airliners · Luxury pools · Volvo coaches |
| 📚 **12 Info Pages** | About · Careers · Press · Blog · Contact · Help · Safety · Cancellation · Refunds · Terms · Privacy · Cookies |
| ⚡ **Static Pre-compilation** | All support pages prerendered (`○`) for zero-latency navigation |
| 🔍 **Tabbed Search Console** | Dedicated search widgets for Bus · Train · Flight · Hotel · Event |
| ⌨️ **Cmd-K Search** | Global keyboard shortcut search across the entire platform |
| 🖨️ **Ultra-Premium Tickets** | Professional PDF receipts via jsPDF + html2canvas |
| 📱 **Mobile-First** | Fully responsive on all screen sizes |

<br />

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|:------|:-----------|
| **Frontend** | Next.js 15 (App Router) · TypeScript · TailwindCSS · shadcn/ui · Framer Motion · Zustand |
| **Backend** | Node.js · Express.js · TypeScript · ts-node-dev |
| **Database** | PostgreSQL 16 (Supabase) · Prisma ORM |
| **Cache** | Redis 7 / ioredis-mock · Rate Limiting · Pub/Sub · Seat Locking |
| **Real-Time** | Socket.IO (WebSocket broadcasts) |
| **Auth** | JWT (access + refresh tokens) · Google OAuth · Email OTP |
| **Payments** | Cashfree Payment Gateway (sandbox + production) |
| **AI / ML** | OpenAI GPT-4 · Anthropic Claude |
| **Charts** | Recharts (analytics dashboards) |
| **PDF Engine** | jsPDF · html2canvas (E-Ticket generation) |
| **Monorepo** | Turborepo · npm workspaces |

</div>

<br />

## 🏗️ Architecture

```
arvis-x/                              ◆ Turborepo Monorepo
│
├── frontend/                         ◆ Next.js 15 · App Router · 30+ routes
│   ├── app/
│   │   ├── (auth)/               ─ Login · Register · Verify OTP
│   │   ├── (dashboard)/
│   │   │   ├── admin/            ─ Ultra-Premium Admin Command Center
│   │   │   ├── user/             ─ User Profile · Wallet · Bookings
│   │   │   └── vendor/           ─ Vendor Service Controller
│   │   │
│   │   ├── ── BOOKING FLOWS ──────────────────────────────────────
│   │   ├── booking/              ─ Checkout · Seat Lock · Coupons
│   │   ├── bookings/             ─ History · Cancellation · Refunds
│   │   ├── payments/             ─ Cashfree Redirects · Verification
│   │   ├── tickets/              ─ QR E-Tickets · PDF Receipt
│   │   ├── wallet/               ─ Balance · Ledger · Top-up
│   │   │
│   │   ├── ── LISTING PAGES ──────────────────────────────────────
│   │   ├── buses/                ─ Bus Listings · Tabbed Search
│   │   ├── trains/               ─ Train Listings · Tabbed Search
│   │   ├── flights/              ─ Flight Listings · Tabbed Search
│   │   ├── hotels/               ─ Hotel Listings · Tabbed Search
│   │   ├── events/               ─ Event Listings · Tabbed Search
│   │   ├── services/             ─ Dynamic Details · Seat Mapping
│   │   ├── search/               ─ Advanced Search & Filters
│   │   ├── wishlist/             ─ Saved Services Collection
│   │   │
│   │   ├── ── INFORMATIONAL HUB ──────────────────────────────────
│   │   ├── about/                ─ Company Story · Vishal Soni
│   │   ├── careers/              ─ Open Positions Board
│   │   ├── press/                ─ News & Media Kit
│   │   ├── blog/                 ─ Travel Guides & AI Updates
│   │   ├── contact/              ─ Secure Form · Founder Card
│   │   ├── help/                 ─ FAQ Center & Support
│   │   ├── safety/               ─ Platform Safety & Trust
│   │   ├── cancellation/         ─ Cancellation Matrix
│   │   ├── refunds/              ─ Refund Policy & Timelines
│   │   ├── terms/                ─ Terms of Service
│   │   ├── privacy/              ─ GDPR Privacy Policy
│   │   ├── cookies/              ─ Cookie Settings
│   │   └── verify-ticket/        ─ QR Scan Verification Portal
│   │
│   ├── components/
│   │   ├── ui/                   ─ Custom UI primitives (Input · Textarea · Button)
│   │   ├── layout/               ─ Nav · Footer · Glassmorphic Headers
│   │   ├── shared/               ─ Tabbed Search · Cmd-K · ScrollToTop
│   │   ├── booking/              ─ Premium SeatMap · Lock Indicator
│   │   └── ai/                   ─ AI Travel Companion Chat
│   │
│   ├── lib/                      ─ API Client · Zustand Stores · Utilities
│   ├── providers/                ─ Theme Provider
│   └── styles/                   ─ Global CSS · Orbs · Noise · Animations
│
├── backend/                          ◆ Express.js · TypeScript · REST + WebSocket
│   ├── src/
│   │   ├── config/               ─ Rate Limiting · Env · Redis Config
│   │   ├── middleware/           ─ Auth · Validation · Error Handling
│   │   ├── routes/               ─ 13 Route Modules (Auth, Bookings, AI, Admin...)
│   │   ├── services/             ─ Business Logic · Seat Locking
│   │   ├── validators/           ─ Zod Request Schemas
│   │   └── utils/                ─ Email · Redis · Token Helpers
│   └── prisma/                   ─ Schema · Migrations · Seed (420 services)
│
│── docker/                           ◆ Docker & Nginx Production Configs
├── kubernetes/                       ◆ Production Kubernetes Manifests (Pods · Services · Ingress · TLS)
├── terraform/                        ◆ Infrastructure as Code (VPC · EKS · RDS · Lambda · IAM)
└── packages/                         ◆ Shared Packages (future)
```

<br />

## ☁️ Cloud, Serverless & DevOps

The platform features an enterprise-grade cloud-native infrastructure suite, showcasing integration with AWS, Jenkins pipelines, Terraform IaC, and Kubernetes orchestration.

### ⚡ Serverless API (AWS Lambda)
To enable elastic scalability and minimize hosting costs:
- **Express-to-Lambda Wrapper**: Built around `serverless-http` under `backend/src/lambda.ts` to seamlessly route HTTP requests from API Gateway to the Express application router.
- **Serverless Framework**: Configured via `backend/serverless.yml` for multi-stage deployments (`dev`, `prod`), resource boundaries, IAM permissions (e.g. S3 uploads), and automatic deployment pruning.

### 🏗️ Infrastructure as Code (Terraform)
Located in `/terraform`, these templates provision the complete AWS ecosystem:
- **Networking (`vpc.tf`)**: Secure multi-tier VPC featuring 2 Public Subnets (ELB exposure), 2 Private App Subnets (EKS Node Groups & Lambda functions), and 2 Private Database Subnets.
- **Compute (`lambda.tf` & `eks.tf`)**: Provisions AWS Lambda execution environments and an AWS EKS Cluster with managed node groups.
- **Database (`rds.tf`)**: provisions an AWS RDS PostgreSQL instance isolated within the database subnets, restricted via security groups to accept connections only from internal VPC resources.

### 🎡 Container Orchestration (Kubernetes)
Located in `/kubernetes`, the production-ready manifests configure:
- **Replication & Scaling**: Configures 3-replica deployments for both the Next.js frontend and Express backend, featuring rolling update strategies, CPU/memory limits, and liveness/readiness health probes.
- **Ingress Controller (`ingress.yaml`)**: Implements path-based routing via Nginx Ingress (`arvisx.com` -> Frontend and `api.arvisx.com` -> Backend) with TLS certificate auto-provisioning via cert-manager.

### 🛠️ Declarative Jenkins CI/CD Pipeline
The root `Jenkinsfile` defines a production-grade multi-stage pipeline:
1. **Quality Gate**: Runs linting and Jest test suites in parallel for both workspaces.
2. **Build & Package**: Triggers Prisma generation, compiles TypeScript, and builds the Next.js frontend app.
3. **Infrastructure updates**: Runs Terraform to automatically sync cloud resources.
4. **Registry Push**: Builds multi-stage production Docker images and pushes them to Amazon ECR.
5. **Rollout**: Deploys the backend API to AWS Lambda (Serverless) and rolling updates the Kubernetes workloads on AWS EKS.

<br />

## 🚀 Quick Start

### Prerequisites

```
  Node.js 20+          PostgreSQL 16+         Redis 7+ (optional)
  ──────────────       ────────────────        ──────────────────
  Required              or Supabase            ioredis-mock used
                        (cloud DB)             in development
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sonivishal66666/Arvi-X.git
cd arvis-x

# 2. Install all workspace dependencies
npm install

# 3. Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 4. Set up the database schema
npm run db:generate
npm run db:push

# 5. Seed 420 realistic services
npm run db:seed
#    ↳ 120 Buses · 120 Trains · 80 Flights · 60 Hotels · 40 Events

# 6. Launch the full-stack dev server
npm run dev
```

### 🌐 Local URLs

| Service | URL | Status |
|---------|-----|--------|
| 🖥️ **Frontend** | http://localhost:3000 | Next.js App |
| ⚙️ **REST API** | http://localhost:4000 | Express Server |
| 💚 **Health Check** | http://localhost:4000/api/health | API Status |
| 🔌 **WebSocket** | ws://localhost:4000 | Socket.IO |

### Production Mode (Zero Latency)

```bash
# Build & start optimized production bundle
npm run build && npm run start

# All pages serve as pre-compiled static assets
# → Zero click latency on first navigation
```

<br />

### 🔑 Test Accounts

<div align="center">

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 👑 **Super Admin** | admin@arvisx.com | `Admin@123` | Full platform control |
| 🏢 **Vendor** | vendor@arvisx.com | `User@123` | Service management |
| 👤 **User** | user@arvisx.com | `User@123` | Book & manage travel |

</div>

### 💳 Cashfree Test Payment

```
  Card Number  →  4111 1111 1111 1111
  Expiry       →  Any future date
  CVV          →  123
  OTP          →  123456
```

<br />

## 📊 API Reference

> **Base URL:** `http://localhost:4000`  
> **Auth:** Bearer JWT token in `Authorization` header (all protected routes)

---

<details>
<summary><b>🔐 Authentication</b> &nbsp;— 8 endpoints</summary>

<br />

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Login with email + password (rememberMe support) |
| `POST` | `/api/auth/google` | Google OAuth social login |
| `POST` | `/api/auth/login-otp` | Request passwordless OTP |
| `POST` | `/api/auth/verify-otp` | Verify OTP and receive tokens |
| `POST` | `/api/auth/refresh` | Refresh access token via refresh token |
| `POST` | `/api/auth/logout` | Invalidate session |
| `GET`  | `/api/auth/me` | Fetch current authenticated user |

</details>

---

<details>
<summary><b>🗂️ Services</b> &nbsp;— 6 endpoints</summary>

<br />

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/services` | Paginated list of all services |
| `GET` | `/api/services/featured` | Curated featured services |
| `GET` | `/api/services/:id` | Service detail with all schedules |
| `GET` | `/api/services/:id/schedules` | Available schedule timeslots |
| `GET` | `/api/services/:id/seats` | Seat availability map by schedule |
| `GET` | `/api/services/:id/reviews` | User reviews and ratings |

</details>

---

<details>
<summary><b>🔍 Search</b> &nbsp;— 3 endpoints</summary>

<br />

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/search` | Full-text search with category, sort, filter |
| `GET` | `/api/search/autocomplete` | Real-time autocomplete suggestions |
| `GET` | `/api/search/voice` | Voice search transcription |

</details>

---

<details>
<summary><b>📅 Bookings</b> &nbsp;— 6 endpoints</summary>

<br />

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST`  | `/api/bookings` | Create booking with seat lock & coupon |
| `GET`   | `/api/bookings` | User's booking history |
| `GET`   | `/api/bookings/:id` | Booking detail with QR code |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel → wallet refund + seat release |
| `GET`   | `/api/bookings/:id/ticket` | Confirmed ticket data |
| `GET`   | `/api/bookings/coupon/validate/:code` | Validate a coupon code |

</details>

---

<details>
<summary><b>💰 Payments</b> &nbsp;— 4 endpoints</summary>

<br />

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments/create-order` | Initialize Cashfree payment order |
| `POST` | `/api/payments/verify` | Verify payment completion |
| `POST` | `/api/payments/refund` | Trigger refund to wallet |
| `POST` | `/api/payments/webhook` | Cashfree webhook event receiver |

</details>

---

<details>
<summary><b>💼 Wallet</b> &nbsp;— 5 endpoints</summary>

<br />

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/wallet` | Balance + recent transactions |
| `POST` | `/api/wallet/add` | Create Cashfree top-up order |
| `POST` | `/api/wallet/verify-payment` | Confirm top-up and credit wallet |
| `GET`  | `/api/wallet/transactions` | Full paginated transaction ledger |
| `POST` | `/api/wallet/topup-dev` | Dev-only simulated wallet credit |

</details>

---

<details>
<summary><b>🔔 Notifications</b> &nbsp;— 4 endpoints</summary>

<br />

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/api/notifications` | Notifications + unread count |
| `PATCH`  | `/api/notifications/:id/read` | Mark single notification read |
| `PATCH`  | `/api/notifications/read-all` | Mark all as read |
| `DELETE` | `/api/notifications/:id` | Delete notification |

</details>

---

<details>
<summary><b>🎟️ Tickets</b> &nbsp;— 1 endpoint</summary>

<br />

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tickets/verify` | QR code verification (fallback chain) |

</details>

---

<details>
<summary><b>❤️ Wishlist</b> &nbsp;— 4 endpoints</summary>

<br />

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/api/wishlist` | All saved services |
| `POST`   | `/api/wishlist` | Add service to wishlist |
| `DELETE` | `/api/wishlist/:serviceId` | Remove from wishlist |
| `GET`    | `/api/wishlist/check/:serviceId` | Check if service is saved |

</details>

---

<details>
<summary><b>🤖 AI</b> &nbsp;— 6 endpoints</summary>

<br />

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST`   | `/api/ai/chat` | Chat with AI travel assistant |
| `POST`   | `/api/ai/itinerary` | Generate personalized itinerary |
| `POST`   | `/api/ai/recommendations` | Get smart service recommendations |
| `GET`    | `/api/ai/sessions` | All chat session history |
| `GET`    | `/api/ai/sessions/:id` | Messages from a specific session |
| `DELETE` | `/api/ai/sessions/:id` | Delete chat session |

</details>

---

<details>
<summary><b>👑 Admin</b> &nbsp;— 17 endpoints</summary>

<br />

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/api/admin/dashboard` | Live platform stats & metrics |
| `GET`    | `/api/admin/users` | Paginated user management |
| `PATCH`  | `/api/admin/users/:id/status` | Block / unblock user |
| `GET`    | `/api/admin/vendors` | All registered vendors |
| `PATCH`  | `/api/admin/vendors/:id/verify` | Verify vendor credentials |
| `GET`    | `/api/admin/bookings` | All platform bookings |
| `GET`    | `/api/admin/bookings/:id` | Single booking deep-dive |
| `PATCH`  | `/api/admin/bookings/:id/cancel` | Admin cancel → refund + release |
| `GET`    | `/api/admin/analytics` | Revenue & conversion analytics |
| `GET`    | `/api/admin/coupons` | All coupon/voucher listings |
| `POST`   | `/api/admin/coupons` | Create new discount campaign |
| `PATCH`  | `/api/admin/coupons/:id` | Activate / deactivate coupon |
| `GET`    | `/api/admin/pricing-rules` | Dynamic pricing rule list |
| `POST`   | `/api/admin/pricing-rules` | Create pricing rule |
| `DELETE` | `/api/admin/pricing-rules/:id` | Remove pricing rule |
| `GET`    | `/api/admin/cms` | CMS pages & banners |
| `GET`    | `/api/admin/fraud-alerts` | Fraud monitoring reports |

</details>

---

<details>
<summary><b>🏢 Vendor</b> &nbsp;— 7 endpoints</summary>

<br />

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/vendor/dashboard` | Vendor stats & analytics |
| `GET`  | `/api/vendor/services` | Vendor's active services |
| `POST` | `/api/vendor/services` | Publish new service |
| `PUT`  | `/api/vendor/services/:id` | Update existing service |
| `GET`  | `/api/vendor/bookings` | All bookings for vendor services |
| `GET`  | `/api/vendor/payouts` | Payout & settlement history |
| `GET`  | `/api/vendor/revenue` | Revenue breakdown & charts |

</details>

<br />

## 🗄️ Seed Data

<div align="center">

The database seeds **420 realistic services** across 5 travel categories:

| Category | Count | Services Included |
|:--------:|:-----:|:-----------------|
| 🚌 **Buses** | 120 | AC Sleeper · AC Seater · Volvo · Luxury (multiple operators) |
| 🚄 **Trains** | 120 | Shatabdi · Rajdhani · Duronto · Garib Rath · Express |
| ✈️ **Flights** | 80 | IndiGo · Air India · Vistara · SpiceJet · Akasa Air |
| 🏨 **Hotels** | 60 | Budget to 5-star with pools · spas · gyms · restaurants |
| 🎫 **Events** | 40 | Concerts · Sports · Theatre · Festivals · Comedy · Exhibitions |

All services include real **Unsplash images**, departure/arrival schedules, dynamic pricing, realistic discounts, and fully populated seat maps.

</div>

<br />

## 🔑 Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **⚡ Static Generation (`○`) for Info Hub** | 12 company/support pages prerendered at build time for zero-latency navigation in production |
| **🔄 Unified Refund + Seat Release Transaction** | Cancellations run as a single Prisma `$transaction` — atomically credits wallet, logs audit ledger, and releases only the booked passenger seats |
| **🧪 Dev Wallet Simulation (`/topup-dev`)** | Allows full wallet/booking/refund flow testing locally without connecting to live Cashfree APIs |
| **💾 Zustand `isAuthenticated` Persistence** | After Cashfree payment redirect (full page nav), auth state is restored from localStorage without re-login |
| **↩️ Cashfree `_self` Redirect** | Full-page navigation (no iframe/modal) prevents popup blockers and preserves auth redirect flow |
| **🚦 5000 req/min Rate Limit** | Prevents 429 errors during payment verification polling while maintaining platform security |
| **📞 `'9999999999'` Phone Fallback** | Cashfree sandbox requires non-empty phone; this placeholder satisfies validation in test mode |
| **🔗 QR Fallback Chain** | `qrCode → bookingRef → booking.id` — ensures E-Tickets always render even with partial data |
| **🔐 Redis Seat Locking** | Per-seat distributed locks with auto-release TTL; WebSocket broadcasts realtime map updates |

<br />

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License · Free to use · Free to modify · Free to distribute
```

<br />

<div align="center">

---

<table>
<tr>
<td align="center">
  <b>Crafted with precision & passion by</b><br /><br />
  <b>Vishal Soni</b><br />
  Founder & Director, Arvis X<br />
  <i>"Building the future of travel, one booking at a time."</i>
</td>
</tr>
</table>

<br />

**⭐ If you find this project impressive, give it a star!**

<br />

*Built with ❤️ for the modern traveler*

</div>
