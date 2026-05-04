-- Função utilitária haversine (distância em km entre dois pontos)
CREATE OR REPLACE FUNCTION public.haversine_km(
  lat1 double precision,
  lng1 double precision,
  lat2 double precision,
  lng2 double precision
)
RETURNS double precision
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT 2 * 6371 * asin(
    sqrt(
      sin(radians((lat2 - lat1) / 2)) ^ 2 +
      cos(radians(lat1)) * cos(radians(lat2)) *
      sin(radians((lng2 - lng1) / 2)) ^ 2
    )
  );
$$;

-- Matching híbrido: mesma zona OU dentro de 15km
CREATE OR REPLACE FUNCTION public.find_matching_pros(
  p_lat double precision,
  p_lng double precision,
  p_zone_id uuid,
  p_max_km double precision DEFAULT 15.0,
  p_limit integer DEFAULT 10,
  p_exclude_client uuid DEFAULT NULL
)
RETURNS TABLE (
  user_id uuid,
  rating numeric,
  jobs_done integer,
  verified boolean,
  available_now boolean,
  distance_km double precision,
  same_zone boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH pro_origins AS (
    SELECT
      pp.user_id,
      pp.rating,
      pp.jobs_done,
      pp.verified,
      pp.available_now,
      pp.radius_km,
      COALESCE(pp.current_lat, z.center_lat) AS origin_lat,
      COALESCE(pp.current_lng, z.center_lng) AS origin_lng,
      EXISTS (
        SELECT 1 FROM public.pro_zones pz
        WHERE pz.user_id = pp.user_id AND pz.zone_id = p_zone_id
      ) AS same_zone
    FROM public.pro_profiles pp
    LEFT JOIN LATERAL (
      SELECT z.center_lat, z.center_lng
      FROM public.pro_zones pz
      JOIN public.zones z ON z.id = pz.zone_id
      WHERE pz.user_id = pp.user_id AND z.active = true
      LIMIT 1
    ) z ON true
    WHERE pp.verified = true
      AND pp.available_now = true
      AND (p_exclude_client IS NULL OR pp.user_id <> p_exclude_client)
  )
  SELECT
    po.user_id,
    po.rating,
    po.jobs_done,
    po.verified,
    po.available_now,
    CASE
      WHEN po.origin_lat IS NULL OR po.origin_lng IS NULL THEN NULL
      ELSE public.haversine_km(p_lat, p_lng, po.origin_lat, po.origin_lng)
    END AS distance_km,
    po.same_zone
  FROM pro_origins po
  WHERE
    po.same_zone = true
    OR (
      po.origin_lat IS NOT NULL
      AND po.origin_lng IS NOT NULL
      AND public.haversine_km(p_lat, p_lng, po.origin_lat, po.origin_lng) <= LEAST(p_max_km, COALESCE(po.radius_km, p_max_km))
    )
  ORDER BY
    po.same_zone DESC,
    distance_km ASC NULLS LAST,
    po.rating DESC NULLS LAST,
    po.jobs_done DESC NULLS LAST
  LIMIT p_limit;
$$;

-- Permitir que clientes autenticados invoquem a função
GRANT EXECUTE ON FUNCTION public.find_matching_pros(double precision, double precision, uuid, double precision, integer, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.haversine_km(double precision, double precision, double precision, double precision) TO authenticated;