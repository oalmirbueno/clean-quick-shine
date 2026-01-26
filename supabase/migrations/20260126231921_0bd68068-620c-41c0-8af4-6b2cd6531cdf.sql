-- Fix: profiles table public data exposure
-- Drop the overly permissive policy that exposes all user data
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Pros can view client profiles for their assigned orders (needed for order display)
CREATE POLICY "Pros can view profiles for assigned orders"
  ON public.profiles FOR SELECT
  USING (
    user_id IN (
      SELECT client_id FROM public.orders 
      WHERE pro_id = auth.uid()
      AND status IN ('confirmed', 'en_route', 'in_progress', 'completed', 'rated')
    )
  );

-- Clients can view pro profiles for their orders (needed to see who's assigned)
CREATE POLICY "Clients can view pro profiles for their orders"
  ON public.profiles FOR SELECT
  USING (
    user_id IN (
      SELECT pro_id FROM public.orders 
      WHERE client_id = auth.uid()
      AND pro_id IS NOT NULL
    )
  );

-- Admins can view all profiles (for admin dashboard)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));