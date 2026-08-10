-- Mapa "estilo Uber" da diarista: adiciona o CENTRO DA ZONA (dado público,
-- já legível em zones) à view segura do mural. A diarista visualiza onde há
-- demanda no mapa sem nunca ver o endereço/geo real do cliente antes do
-- aceite. Colunas novas são apenas acrescentadas ao final (CREATE OR REPLACE
-- de view exige preservar as existentes).
CREATE OR REPLACE VIEW public.available_orders_safe
WITH (security_barrier = true) AS
SELECT
  o.id,
  o.service_id,
  o.scheduled_date,
  o.scheduled_time,
  o.duration_hours,
  o.total_price,
  o.status,
  o.created_at,
  o.zone_fee,
  o.surge_multiplier,
  a.city,
  a.neighborhood,
  a.state,
  a.zone_id,
  z.name AS zone_name,
  z.center_lat AS zone_center_lat,
  z.center_lng AS zone_center_lng
FROM public.orders o
LEFT JOIN public.addresses a ON a.id = o.address_id
LEFT JOIN public.zones z ON z.id = a.zone_id
WHERE o.pro_id IS NULL
  AND o.status IN ('scheduled', 'matching')
  AND public.has_role(auth.uid(), 'pro')
  AND EXISTS (
    SELECT 1 FROM public.pro_profiles pp
    WHERE pp.user_id = auth.uid() AND pp.verified = true
  );
