-- Brusque/SC como primeira praça do Já Limpo.
-- Idempotente: pode rodar de novo sem duplicar nada.
-- Zona única, sem taxa: o matching por raio (15 km) já cobre a cidade.
DO $$
DECLARE
  v_city uuid;
  v_zone uuid;
BEGIN
  SELECT id INTO v_city FROM public.cities WHERE lower(trim(name)) = 'brusque' LIMIT 1;
  IF v_city IS NULL THEN
    INSERT INTO public.cities (name, state, active)
    VALUES ('Brusque', 'SC', true)
    RETURNING id INTO v_city;
  END IF;

  SELECT id INTO v_zone FROM public.zones WHERE city_id = v_city AND name = 'Brusque' LIMIT 1;
  IF v_zone IS NULL THEN
    INSERT INTO public.zones (city_id, name, center_lat, center_lng, radius_km, fee_extra, active)
    VALUES (v_city, 'Brusque', -27.0977, -48.9107, 15, 0, true)
    RETURNING id INTO v_zone;
  END IF;

  INSERT INTO public.zone_rules (zone_id, min_pros_online, surge_multiplier, active)
  VALUES (v_zone, 1, 1.0, true)
  ON CONFLICT (zone_id) DO NOTHING;

  -- Diaristas com última posição a até 30 km do centro de Brusque
  INSERT INTO public.pro_zones (user_id, zone_id)
  SELECT p.user_id, v_zone
  FROM public.pro_profiles p
  WHERE p.current_lat IS NOT NULL
    AND 111.32 * sqrt(
          power(p.current_lat::float8 + 27.0977, 2)
          + power((p.current_lng::float8 + 48.9107) * cos(radians(-27.0977)), 2)
        ) <= 30
  ON CONFLICT (user_id, zone_id) DO NOTHING;

  -- Endereços de Brusque que caíram na zona de Curitiba
  UPDATE public.addresses
  SET zone_id = v_zone
  WHERE lower(trim(city)) = 'brusque'
    AND lat IS NOT NULL
    AND zone_id IS DISTINCT FROM v_zone;
END;
$$;
