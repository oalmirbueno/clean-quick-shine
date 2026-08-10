-- FIX CRÍTICO: salvar/editar endereço com coordenadas falhava com
-- "permission denied for function find_nearest_zone".
--
-- Causa: a migração 20260601214936 revogou EXECUTE de find_nearest_zone do
-- papel authenticated assumindo que "triggers rodam como table owner" — mas
-- trigger function SEM SECURITY DEFINER executa com as permissões do usuário
-- da sessão. auto_assign_zone (trigger de addresses) chamava find_nearest_zone
-- como authenticated e todo INSERT/UPDATE de endereço com lat/lng quebrava,
-- derrubando o fluxo principal do app (endereço no mapa → matching).
--
-- Correção: tornar auto_assign_zone SECURITY DEFINER (roda como owner, que
-- tem acesso a find_nearest_zone). O hardening é preservado: clientes seguem
-- sem poder chamar find_nearest_zone diretamente.
CREATE OR REPLACE FUNCTION public.auto_assign_zone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.zone_id := public.find_nearest_zone(NEW.lat::DOUBLE PRECISION, NEW.lng::DOUBLE PRECISION);
  END IF;
  RETURN NEW;
END;
$$;
