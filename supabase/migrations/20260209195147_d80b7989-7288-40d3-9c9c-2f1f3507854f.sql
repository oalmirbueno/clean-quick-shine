
-- 1. Fix pro_profiles: remove public SELECT, restrict to authenticated users with legitimate need
DROP POLICY IF EXISTS "Pro profiles are publicly readable" ON public.pro_profiles;

-- Users can view their own pro profile
CREATE POLICY "Users can view their own pro profile"
  ON public.pro_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Clients can view pro profiles for their orders (when a pro is assigned)
CREATE POLICY "Clients can view pro profiles for their orders"
  ON public.pro_profiles FOR SELECT
  USING (
    user_id IN (
      SELECT pro_id FROM public.orders
      WHERE client_id = auth.uid() AND pro_id IS NOT NULL
    )
  );

-- Admins can view all pro profiles
CREATE POLICY "Admins can view all pro profiles"
  ON public.pro_profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- 2. Fix profiles: restrict pro->client visibility to active/completed statuses only
DROP POLICY IF EXISTS "Pros can view profiles for assigned orders" ON public.profiles;

CREATE POLICY "Pros can view client profiles for active orders"
  ON public.profiles FOR SELECT
  USING (
    user_id IN (
      SELECT client_id FROM public.orders
      WHERE pro_id = auth.uid()
        AND status IN ('in_progress', 'completed', 'rated')
    )
  );
