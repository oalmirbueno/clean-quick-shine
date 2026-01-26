-- =============================================
-- LIMPAJÁ V3 - COMPLETE DATABASE SCHEMA
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'pro', 'company');
CREATE TYPE public.order_status AS ENUM ('draft', 'scheduled', 'matching', 'confirmed', 'en_route', 'in_progress', 'completed', 'rated', 'paid_out', 'cancelled', 'in_review');
CREATE TYPE public.pro_plan_type AS ENUM ('free', 'pro', 'elite');
CREATE TYPE public.client_plan_type AS ENUM ('basic', 'plus', 'premium');
CREATE TYPE public.risk_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.quality_level AS ENUM ('A', 'B', 'C', 'D');
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.referral_status AS ENUM ('pending', 'completed', 'expired', 'cancelled');
CREATE TYPE public.subscription_status AS ENUM ('active', 'paused', 'cancelled', 'expired');

-- =============================================
-- USER ROLES TABLE (Security)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  cpf TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- GEOGRAPHY: CITIES & ZONES
-- =============================================
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  center_lat DECIMAL(10, 8),
  center_lng DECIMAL(11, 8),
  radius_km DECIMAL(5, 2) DEFAULT 5.0,
  fee_extra DECIMAL(10, 2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.zone_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE NOT NULL UNIQUE,
  min_pros_online INTEGER DEFAULT 3,
  surge_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_rules ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SERVICES
-- =============================================
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  duration_hours DECIMAL(4, 2) NOT NULL,
  icon TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CLIENT ADDRESSES
-- =============================================
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  zone_id UUID REFERENCES public.zones(id),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PRO PLANS & SUBSCRIPTIONS
-- =============================================
CREATE TABLE public.pro_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type pro_plan_type NOT NULL UNIQUE,
  monthly_price DECIMAL(10, 2) NOT NULL,
  priority_boost INTEGER DEFAULT 0,
  access_categories JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.pro_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.pro_plans(id) NOT NULL,
  status subscription_status DEFAULT 'active',
  start_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  renew_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.pro_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PRO PROFILES & METRICS
-- =============================================
CREATE TABLE public.pro_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bio TEXT,
  rating DECIMAL(2, 1) DEFAULT 5.0,
  jobs_done INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  available_now BOOLEAN DEFAULT false,
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  radius_km DECIMAL(5, 2) DEFAULT 10.0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.pro_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, zone_id)
);

CREATE TABLE public.pro_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  on_time_rate DECIMAL(5, 2) DEFAULT 100.0,
  cancel_rate DECIMAL(5, 2) DEFAULT 0.0,
  acceptance_rate DECIMAL(5, 2) DEFAULT 100.0,
  response_time_avg INTEGER DEFAULT 0, -- in minutes
  last_30d_jobs INTEGER DEFAULT 0,
  last_7d_cancels INTEGER DEFAULT 0,
  quality_level quality_level DEFAULT 'A',
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.pro_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_metrics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CLIENT PLANS & SUBSCRIPTIONS
-- =============================================
CREATE TABLE public.client_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type client_plan_type NOT NULL UNIQUE,
  monthly_price DECIMAL(10, 2) NOT NULL,
  cleanings_per_month INTEGER NOT NULL,
  fee_discount_percent DECIMAL(5, 2) DEFAULT 0,
  priority_boost INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.client_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.client_plans(id) NOT NULL,
  status subscription_status DEFAULT 'active',
  start_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  renew_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.recurring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.client_subscriptions(id) ON DELETE CASCADE NOT NULL,
  weekday INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
  time TIME NOT NULL,
  address_id UUID REFERENCES public.addresses(id),
  service_id UUID REFERENCES public.services(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.subscription_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.client_subscriptions(id) ON DELETE CASCADE NOT NULL,
  month_ref TEXT NOT NULL, -- YYYY-MM
  credits_total INTEGER NOT NULL,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (subscription_id, month_ref)
);

ALTER TABLE public.client_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_credits ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) NOT NULL,
  pro_id UUID REFERENCES auth.users(id),
  service_id UUID REFERENCES public.services(id) NOT NULL,
  address_id UUID REFERENCES public.addresses(id) NOT NULL,
  status order_status DEFAULT 'draft',
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_hours DECIMAL(4, 2) NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  zone_fee DECIMAL(10, 2) DEFAULT 0,
  surge_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  client_rating INTEGER,
  client_review TEXT,
  pro_rating INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- =============================================
-- MATCHING SYSTEM
-- =============================================
CREATE TABLE public.matching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  candidates JSONB NOT NULL, -- Array of {pro_id, score, factors}
  chosen_pro_id UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.matching_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RISK & ANTI-FRAUD
-- =============================================
CREATE TABLE public.risk_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  type TEXT NOT NULL, -- e.g., 'many_cancellations', 'low_punctuality', 'chargeback'
  severity risk_severity DEFAULT 'low',
  notes TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.risk_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, -- e.g., 'priority_reduction', 'temporary_block', 'manual_review'
  reason TEXT,
  start_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  end_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_actions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SLA RULES
-- =============================================
CREATE TABLE public.sla_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_time_target_min INTEGER DEFAULT 15,
  on_time_target_percent DECIMAL(5, 2) DEFAULT 95.0,
  cancel_rate_max_percent DECIMAL(5, 2) DEFAULT 5.0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.sla_rules ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SUPPORT & TICKETS
-- =============================================
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.support_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'photo', 'document', 'receipt'
  url TEXT NOT NULL,
  filename TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  is_admin BOOLEAN DEFAULT false,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- COMPANIES (B2B)
-- =============================================
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  cnpj TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  details JSONB NOT NULL, -- {serviceType, frequency, addresses, estimatedHours, notes}
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, active
  estimated_value DECIMAL(10, 2),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- REFERRALS
-- =============================================
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role app_role NOT NULL,
  status referral_status DEFAULT 'pending',
  reward_value DECIMAL(10, 2) DEFAULT 0,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE TABLE public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_id UUID REFERENCES public.referrals(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'credit', 'bonus', 'discount'
  value DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, credited, expired
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- =============================================
-- COUPONS
-- =============================================
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL, -- 'percent', 'fixed'
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.coupon_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (coupon_id, user_id, order_id)
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PAYMENTS & WITHDRAWALS
-- =============================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  method TEXT NOT NULL, -- 'credit_card', 'pix', 'subscription_credit'
  status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  method TEXT NOT NULL, -- 'pix', 'bank_transfer'
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  pix_key TEXT,
  bank_info JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ANALYTICS EVENTS
-- =============================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TRIGGER: Update updated_at timestamps
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pro_profiles_updated_at BEFORE UPDATE ON public.pro_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- RLS POLICIES
-- =============================================

-- User Roles: Only admins can manage, users can see their own
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cities & Zones: Publicly readable, admin manageable
CREATE POLICY "Cities are publicly readable" ON public.cities
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage cities" ON public.cities
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Zones are publicly readable" ON public.zones
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage zones" ON public.zones
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Zone rules are publicly readable" ON public.zone_rules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage zone rules" ON public.zone_rules
  FOR ALL USING (public.is_admin(auth.uid()));

-- Services: Publicly readable
CREATE POLICY "Services are publicly readable" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (public.is_admin(auth.uid()));

-- Addresses: Users own their addresses
CREATE POLICY "Users can view their own addresses" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Pro Plans: Publicly readable
CREATE POLICY "Pro plans are publicly readable" ON public.pro_plans
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage pro plans" ON public.pro_plans
  FOR ALL USING (public.is_admin(auth.uid()));

-- Pro Subscriptions
CREATE POLICY "Users can view their own pro subscriptions" ON public.pro_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own pro subscriptions" ON public.pro_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all pro subscriptions" ON public.pro_subscriptions
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Pro Profiles: Publicly readable for matching
CREATE POLICY "Pro profiles are publicly readable" ON public.pro_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own pro profile" ON public.pro_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Pro Zones
CREATE POLICY "Users can view their own pro zones" ON public.pro_zones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own pro zones" ON public.pro_zones
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all pro zones" ON public.pro_zones
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Pro Metrics
CREATE POLICY "Users can view their own metrics" ON public.pro_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all metrics" ON public.pro_metrics
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage metrics" ON public.pro_metrics
  FOR ALL USING (public.is_admin(auth.uid()));

-- Client Plans: Publicly readable
CREATE POLICY "Client plans are publicly readable" ON public.client_plans
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage client plans" ON public.client_plans
  FOR ALL USING (public.is_admin(auth.uid()));

-- Client Subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.client_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscriptions" ON public.client_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Recurring Rules
CREATE POLICY "Users can view their own recurring rules" ON public.recurring_rules
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM public.client_subscriptions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own recurring rules" ON public.recurring_rules
  FOR ALL USING (
    subscription_id IN (
      SELECT id FROM public.client_subscriptions WHERE user_id = auth.uid()
    )
  );

-- Subscription Credits
CREATE POLICY "Users can view their own credits" ON public.subscription_credits
  FOR SELECT USING (
    subscription_id IN (
      SELECT id FROM public.client_subscriptions WHERE user_id = auth.uid()
    )
  );

-- Orders
CREATE POLICY "Clients can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Pros can view assigned orders" ON public.orders
  FOR SELECT USING (auth.uid() = pro_id);

CREATE POLICY "Clients can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Pros can update assigned orders" ON public.orders
  FOR UPDATE USING (auth.uid() = pro_id);

CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (public.is_admin(auth.uid()));

-- Matching Logs: Admin only
CREATE POLICY "Admins can view matching logs" ON public.matching_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage matching logs" ON public.matching_logs
  FOR ALL USING (public.is_admin(auth.uid()));

-- Risk Flags & Actions: Admin only
CREATE POLICY "Admins can manage risk flags" ON public.risk_flags
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage risk actions" ON public.risk_actions
  FOR ALL USING (public.is_admin(auth.uid()));

-- SLA Rules: Admin only
CREATE POLICY "Admins can manage SLA rules" ON public.sla_rules
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "SLA rules are publicly readable" ON public.sla_rules
  FOR SELECT USING (true);

-- Support Tickets
CREATE POLICY "Users can view their own tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" ON public.support_tickets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tickets" ON public.support_tickets
  FOR ALL USING (public.is_admin(auth.uid()));

-- Support Attachments
CREATE POLICY "Users can view attachments of their tickets" ON public.support_attachments
  FOR SELECT USING (
    ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can add attachments to their tickets" ON public.support_attachments
  FOR INSERT WITH CHECK (
    ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all attachments" ON public.support_attachments
  FOR ALL USING (public.is_admin(auth.uid()));

-- Support Messages
CREATE POLICY "Users can view messages of their tickets" ON public.support_messages
  FOR SELECT USING (
    ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can add messages to their tickets" ON public.support_messages
  FOR INSERT WITH CHECK (
    ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all messages" ON public.support_messages
  FOR ALL USING (public.is_admin(auth.uid()));

-- Companies
CREATE POLICY "Users can view their own company" ON public.companies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own company" ON public.companies
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all companies" ON public.companies
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Quotes
CREATE POLICY "Users can view their company quotes" ON public.quotes
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create quotes for their company" ON public.quotes
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all quotes" ON public.quotes
  FOR ALL USING (public.is_admin(auth.uid()));

-- Referrals
CREATE POLICY "Users can view their own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Admins can manage all referrals" ON public.referrals
  FOR ALL USING (public.is_admin(auth.uid()));

-- Referral Rewards
CREATE POLICY "Users can view their own rewards" ON public.referral_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all rewards" ON public.referral_rewards
  FOR ALL USING (public.is_admin(auth.uid()));

-- Coupons: Publicly readable active coupons
CREATE POLICY "Active coupons are publicly readable" ON public.coupons
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (public.is_admin(auth.uid()));

-- Coupon Uses
CREATE POLICY "Users can view their own coupon uses" ON public.coupon_uses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can use coupons" ON public.coupon_uses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all coupon uses" ON public.coupon_uses
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage payments" ON public.payments
  FOR ALL USING (public.is_admin(auth.uid()));

-- Withdrawals
CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage withdrawals" ON public.withdrawals
  FOR ALL USING (public.is_admin(auth.uid()));

-- Events: Users can create events, admins can view all
CREATE POLICY "Users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all events" ON public.events
  FOR SELECT USING (public.is_admin(auth.uid()));