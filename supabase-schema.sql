-- ================================================================
-- Arvis X — Supabase PostgreSQL Schema
-- Run this entire script in Supabase SQL Editor
-- ================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- USERS
-- ================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image TEXT,
  google_id TEXT UNIQUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ================================================================
-- PROFILES
-- ================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth TIMESTAMPTZ,
  gender TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  preferences TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- VENDORS
-- ================================================================
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_email TEXT,
  business_phone TEXT,
  business_address TEXT,
  gst_number TEXT,
  pan_number TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  commission_rate REAL NOT NULL DEFAULT 5.0,
  total_revenue REAL NOT NULL DEFAULT 0,
  total_payout REAL NOT NULL DEFAULT 0,
  onboarding_step INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SERVICES
-- ================================================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT DEFAULT '[]',
  amenities TEXT DEFAULT '[]',
  policies TEXT DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  rating REAL NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  base_price REAL NOT NULL,
  discount_percent REAL NOT NULL DEFAULT 0,
  tax_percent REAL NOT NULL DEFAULT 18,
  cancellation_policy TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_active ON services(is_active);
CREATE INDEX idx_services_vendor_id ON services(vendor_id);

-- ================================================================
-- BUS SERVICES
-- ================================================================
CREATE TABLE bus_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID UNIQUE NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  bus_number TEXT NOT NULL,
  bus_type TEXT NOT NULL,
  total_seats INTEGER NOT NULL,
  deck_count INTEGER NOT NULL DEFAULT 1,
  amenities TEXT DEFAULT '[]',
  boarding_points TEXT DEFAULT '[]',
  dropping_points TEXT DEFAULT '[]'
);

-- ================================================================
-- TRAIN SERVICES
-- ================================================================
CREATE TABLE train_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID UNIQUE NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  train_number TEXT NOT NULL,
  train_type TEXT NOT NULL,
  total_seats INTEGER NOT NULL,
  classes TEXT DEFAULT '[]',
  pantry_available BOOLEAN NOT NULL DEFAULT false,
  wifi_available BOOLEAN NOT NULL DEFAULT false
);

-- ================================================================
-- FLIGHT SERVICES
-- ================================================================
CREATE TABLE flight_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID UNIQUE NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  flight_number TEXT NOT NULL,
  airline TEXT NOT NULL,
  aircraft_type TEXT NOT NULL,
  total_seats INTEGER NOT NULL,
  classes TEXT DEFAULT '[]',
  baggage_allowance TEXT,
  meal_options TEXT DEFAULT '[]'
);

-- ================================================================
-- HOTEL SERVICES
-- ================================================================
CREATE TABLE hotel_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID UNIQUE NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  hotel_chain TEXT,
  star_rating INTEGER NOT NULL DEFAULT 3,
  property_type TEXT NOT NULL,
  check_in_time TEXT NOT NULL DEFAULT '14:00',
  check_out_time TEXT NOT NULL DEFAULT '11:00',
  latitude REAL,
  longitude REAL,
  total_rooms INTEGER NOT NULL,
  room_types TEXT DEFAULT '[]'
);

-- ================================================================
-- EVENT SERVICES
-- ================================================================
CREATE TABLE event_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID UNIQUE NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  venue TEXT NOT NULL,
  venue_address TEXT,
  latitude REAL,
  longitude REAL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_tickets INTEGER NOT NULL,
  ticket_types TEXT DEFAULT '[]',
  organizer TEXT,
  age_restriction INTEGER
);

-- ================================================================
-- ROUTES
-- ================================================================
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance REAL,
  duration INTEGER,
  stops TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_routes_origin_destination ON routes(origin, destination);

-- ================================================================
-- SCHEDULES
-- ================================================================
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id),
  route_id UUID REFERENCES routes(id),
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  dynamic_price REAL,
  base_price REAL NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  recurring TEXT,
  recurring_days TEXT DEFAULT '[]',
  blackout_dates TEXT DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_schedules_service_departure ON schedules(service_id, departure_time);
CREATE INDEX idx_schedules_departure ON schedules(departure_time);

-- ================================================================
-- SEATS
-- ================================================================
CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  deck INTEGER NOT NULL DEFAULT 1,
  "row" INTEGER,
  "column" TEXT,
  "class" TEXT,
  tier TEXT,
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  price REAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(schedule_id, seat_number)
);
CREATE INDEX idx_seats_schedule_status ON seats(schedule_id, status);

-- ================================================================
-- SEAT LOCKS
-- ================================================================
CREATE TABLE seat_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  session_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_seat_locks_seat_expires ON seat_locks(seat_id, expires_at);
CREATE INDEX idx_seat_locks_session ON seat_locks(session_id);

-- ================================================================
-- BOOKINGS
-- ================================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  service_id UUID NOT NULL REFERENCES services(id),
  schedule_id UUID REFERENCES schedules(id),
  status TEXT NOT NULL DEFAULT 'PENDING',
  total_amount REAL NOT NULL,
  discount_amount REAL NOT NULL DEFAULT 0,
  tax_amount REAL NOT NULL DEFAULT 0,
  final_amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  passengers TEXT DEFAULT '[]',
  contact_email TEXT,
  contact_phone TEXT,
  special_requests TEXT,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  rooms TEXT,
  qr_code TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_bookings_ref ON bookings(booking_ref);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created ON bookings(created_at);

-- ================================================================
-- PAYMENTS
-- ================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  user_id UUID NOT NULL REFERENCES users(id),
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'PENDING',
  method TEXT NOT NULL DEFAULT 'CASHFREE',
  cashfree_order_id TEXT UNIQUE,
  cashfree_payment_id TEXT UNIQUE,
  cashfree_signature TEXT,
  gateway_response TEXT,
  refund_amount REAL NOT NULL DEFAULT 0,
  refund_id TEXT,
  refund_reason TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_order ON payments(cashfree_order_id);
CREATE INDEX idx_payments_user ON payments(user_id);

-- ================================================================
-- WALLETS
-- ================================================================
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance REAL NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- WALLET TRANSACTIONS
-- ================================================================
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  amount REAL NOT NULL,
  balance_before REAL NOT NULL,
  balance_after REAL NOT NULL,
  description TEXT NOT NULL,
  reference_id TEXT,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_wallet_tx_wallet ON wallet_transactions(wallet_id);

-- ================================================================
-- COUPONS
-- ================================================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL,
  discount_value REAL NOT NULL,
  min_order_amount REAL NOT NULL DEFAULT 0,
  max_discount REAL,
  max_uses INTEGER NOT NULL DEFAULT 100,
  used_count INTEGER NOT NULL DEFAULT 0,
  per_user_limit INTEGER NOT NULL DEFAULT 1,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_coupons_code ON coupons(code);

-- ================================================================
-- COUPON SERVICES (junction)
-- ================================================================
CREATE TABLE coupon_services (
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (coupon_id, service_id)
);

-- ================================================================
-- REVIEWS
-- ================================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  service_id UUID NOT NULL REFERENCES services(id),
  booking_id UUID REFERENCES bookings(id),
  rating INTEGER NOT NULL,
  title TEXT,
  comment TEXT,
  images TEXT DEFAULT '[]',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, service_id)
);

-- ================================================================
-- NOTIFICATIONS
-- ================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'IN_APP',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- ================================================================
-- AI ASSISTANT SESSIONS
-- ================================================================
CREATE TABLE ai_assistant_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  model TEXT NOT NULL DEFAULT 'GPT_4',
  context TEXT DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_ai_sessions_user ON ai_assistant_sessions(user_id);

-- ================================================================
-- CHAT MESSAGES
-- ================================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_assistant_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);

-- ================================================================
-- VENDOR PAYOUTS
-- ================================================================
CREATE TABLE vendor_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  amount REAL NOT NULL,
  commission REAL NOT NULL,
  net_amount REAL NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT,
  transaction_ref TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vendor_payouts_vendor_status ON vendor_payouts(vendor_id, status);

-- ================================================================
-- ANALYTICS EVENTS
-- ================================================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  category TEXT,
  label TEXT,
  value REAL,
  user_id TEXT,
  session_id TEXT,
  metadata TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_analytics_event_created ON analytics_events(event, created_at);
CREATE INDEX idx_analytics_category ON analytics_events(category);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);

-- ================================================================
-- API LOGS
-- ================================================================
CREATE TABLE api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  user_id TEXT,
  ip TEXT,
  user_agent TEXT,
  duration INTEGER,
  body TEXT,
  response TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_api_logs_path_created ON api_logs(path, created_at);
CREATE INDEX idx_api_logs_status ON api_logs(status_code);

-- ================================================================
-- SESSIONS
-- ================================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE,
  session_id TEXT NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_activity TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);

-- ================================================================
-- UPDATED AT TRIGGERS
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_seats_updated_at BEFORE UPDATE ON seats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_ai_sessions_updated_at BEFORE UPDATE ON ai_assistant_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_vendor_payouts_updated_at BEFORE UPDATE ON vendor_payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
