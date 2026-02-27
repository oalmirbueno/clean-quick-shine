
-- Função para encontrar a zona mais próxima de um ponto
CREATE OR REPLACE FUNCTION public.find_nearest_zone(p_lat DOUBLE PRECISION, p_lng DOUBLE PRECISION)
RETURNS UUID AS $$
  SELECT id FROM public.zones
  WHERE active = true
  ORDER BY
    (center_lat - p_lat) * (center_lat - p_lat) +
    (center_lng - p_lng) * (center_lng - p_lng)
  LIMIT 1;
$$ LANGUAGE sql STABLE SET search_path = 'public';

-- Trigger function para auto-vincular zona quando endereço é criado/atualizado
CREATE OR REPLACE FUNCTION public.auto_assign_zone()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.zone_id := public.find_nearest_zone(NEW.lat::DOUBLE PRECISION, NEW.lng::DOUBLE PRECISION);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';

DROP TRIGGER IF EXISTS trg_auto_assign_zone ON public.addresses;
CREATE TRIGGER trg_auto_assign_zone
  BEFORE INSERT OR UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_zone();
