-- FIX CRÍTICO: pedido com diarista atribuída nascia 'confirmed' antes do
-- pagamento. Consequências:
--   1. create-payment recusava ("apenas pedidos em draft são pagáveis") —
--      o fluxo principal (matching → aceitar oferta → pagar) nunca conseguia
--      concluir o pagamento;
--   2. a diarista via o serviço como confirmado antes do cliente pagar.
--
-- Correção: todo INSERT de cliente nasce 'draft' (mesmo com pro_id). A
-- promoção pós-pagamento é feita pelas edge functions com service role
-- (create-payment / asaas-webhook): draft -> 'confirmed' (com diarista) ou
-- 'scheduled' (mural). O restante da máquina de estados fica idêntico.
CREATE OR REPLACE FUNCTION public.validate_order_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_base numeric;
  v_dur numeric;
  v_fee numeric := 0;
  v_surge numeric := 1.0;
  v_changed text[];
BEGIN
  IF v_uid IS NULL OR public.is_admin(v_uid) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    SELECT base_price, duration_hours INTO v_base, v_dur
      FROM public.services WHERE id = NEW.service_id;
    IF v_base IS NULL THEN
      RAISE EXCEPTION 'Serviço inválido';
    END IF;
    IF NEW.address_id IS NOT NULL THEN
      SELECT COALESCE(z.fee_extra, 0), COALESCE(zr.surge_multiplier, 1.0)
        INTO v_fee, v_surge
        FROM public.addresses a
        LEFT JOIN public.zones z ON z.id = a.zone_id
        LEFT JOIN public.zone_rules zr ON zr.zone_id = a.zone_id AND zr.active = true
        WHERE a.id = NEW.address_id;
      v_fee := COALESCE(v_fee, 0);
      v_surge := COALESCE(v_surge, 1.0);
    END IF;
    NEW.base_price := v_base;
    NEW.duration_hours := v_dur;
    NEW.zone_fee := v_fee;
    NEW.surge_multiplier := v_surge;
    NEW.discount := 0;
    NEW.total_price := GREATEST(0, (v_base + v_fee) * v_surge);
    NEW.client_rating := NULL;
    NEW.client_review := NULL;
    NEW.pro_rating := NULL;
    NEW.completed_at := NULL;
    -- Sempre nasce sem pagamento; pro_id (se houver) fica reservado e a
    -- promoção para confirmed/scheduled acontece após o pagamento.
    NEW.status := 'draft';
    RETURN NEW;
  END IF;

  SELECT COALESCE(array_agg(n.key), '{}') INTO v_changed
  FROM jsonb_each(to_jsonb(NEW)) n
  WHERE n.value IS DISTINCT FROM (to_jsonb(OLD) -> n.key)
    AND n.key <> 'updated_at';

  IF COALESCE(array_length(v_changed, 1), 0) = 0 THEN
    RETURN NEW;
  END IF;

  IF v_uid = OLD.client_id
     AND NEW.status = 'cancelled'
     AND OLD.status IN ('draft','scheduled','matching','confirmed','en_route','in_progress')
     AND v_changed <@ ARRAY['status']::text[] THEN
    RETURN NEW;
  END IF;

  IF v_uid = OLD.client_id
     AND OLD.status = 'completed' AND NEW.status = 'rated'
     AND v_changed <@ ARRAY['status','client_rating','client_review']::text[]
     AND NEW.client_rating IS NOT NULL
     AND NEW.client_rating BETWEEN 1 AND 5 THEN
    RETURN NEW;
  END IF;

  IF OLD.pro_id IS NULL
     AND NEW.pro_id = v_uid
     AND public.has_role(v_uid, 'pro')
     AND OLD.status IN ('scheduled','matching') AND NEW.status = 'confirmed'
     AND v_changed <@ ARRAY['pro_id','status']::text[] THEN
    RETURN NEW;
  END IF;

  IF v_uid = OLD.pro_id THEN
    IF (OLD.status = 'confirmed'   AND NEW.status = 'en_route'
        AND v_changed <@ ARRAY['status']::text[])
    OR (OLD.status = 'en_route'    AND NEW.status = 'in_progress'
        AND v_changed <@ ARRAY['status']::text[])
    OR (OLD.status = 'in_progress' AND NEW.status = 'completed'
        AND v_changed <@ ARRAY['status','completed_at']::text[]) THEN
      IF NEW.status = 'completed' THEN
        NEW.completed_at := now();
      END IF;
      RETURN NEW;
    END IF;
  END IF;

  RAISE EXCEPTION 'Alteração de pedido não autorizada (colunas: %)', array_to_string(v_changed, ', ');
END;
$$;
