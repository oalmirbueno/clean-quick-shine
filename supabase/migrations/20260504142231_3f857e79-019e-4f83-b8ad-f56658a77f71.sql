-- 1) Fix linter: haversine_km doesn't need SECURITY DEFINER (it's a pure math function)
CREATE OR REPLACE FUNCTION public.haversine_km(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT 2 * 6371 * asin(
    sqrt(
      sin(radians((lat2 - lat1) / 2)) ^ 2 +
      cos(radians(lat1)) * cos(radians(lat2)) *
      sin(radians((lng2 - lng1) / 2)) ^ 2
    )
  );
$function$;

-- 2) Lock down find_matching_pros: only authenticated users can call it
REVOKE ALL ON FUNCTION public.find_matching_pros(double precision, double precision, uuid, double precision, integer, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_matching_pros(double precision, double precision, uuid, double precision, integer, uuid) TO authenticated;

-- 3) Wave 2: Real-time GPS tracking table
CREATE TABLE IF NOT EXISTS public.pro_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id uuid,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  accuracy double precision,
  heading double precision,
  speed double precision,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pro_locations_user_recorded ON public.pro_locations (user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_pro_locations_order_recorded ON public.pro_locations (order_id, recorded_at DESC);

ALTER TABLE public.pro_locations ENABLE ROW LEVEL SECURITY;

-- Pro can insert own locations
CREATE POLICY "Pros can insert their own locations"
ON public.pro_locations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Pro can view own locations
CREATE POLICY "Pros can view their own locations"
ON public.pro_locations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Client can view pro location only for their active orders
CREATE POLICY "Clients can view pro location for active orders"
ON public.pro_locations
FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders
    WHERE client_id = auth.uid()
      AND status IN ('confirmed','en_route','in_progress')
  )
);

-- Admins full access
CREATE POLICY "Admins can manage pro locations"
ON public.pro_locations
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Enable realtime
ALTER TABLE public.pro_locations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pro_locations;