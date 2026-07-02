-- ============ C1: pricing server-side + máquina de estados com allowlist ============
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
    IF NEW.pro_id IS NULL THEN
      NEW.status := 'draft';
    ELSE
      NEW.status := 'confirmed';
    END IF;
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

DROP TRIGGER IF EXISTS trg_validate_order_change ON public.orders;
CREATE TRIGGER trg_validate_order_change
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.validate_order_change();

-- ============ Integridade de pagamentos ============
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;

CREATE OR REPLACE FUNCTION public.force_pending_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
    NEW.status := 'pending';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_force_pending_payment ON public.payments;
CREATE TRIGGER trg_force_pending_payment
  BEFORE INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.force_pending_payment();