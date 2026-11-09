-- Pacote de lançamento em Brusque. Só acrescenta ou substitui; nada é apagado.
-- 1) Saldo da diarista libera com a avaliação OU 48 h depois de concluído.
-- 2) Desconto de cupom é pago pela Já Limpo: diarista recebe 80% do preço antes do desconto.
-- 3) Registra quando o cliente procura e não há diarista.
-- 4) Guarda como a pessoa conheceu o Já Limpo.

CREATE OR REPLACE FUNCTION public.calculate_pro_available_balance(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  released_earnings numeric;
  consumed_withdrawals numeric;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));

  SELECT COALESCE(SUM((total_price + COALESCE(discount, 0)) * 0.8), 0)
  INTO released_earnings
  FROM public.orders
  WHERE pro_id = p_user_id
    AND (
      status = 'rated'
      OR (status = 'completed' AND completed_at <= now() - interval '48 hours')
    );

  SELECT COALESCE(SUM(amount), 0)
  INTO consumed_withdrawals
  FROM public.withdrawals
  WHERE user_id = p_user_id AND status IN ('pending', 'processing', 'completed');

  RETURN GREATEST(0, released_earnings - consumed_withdrawals);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_order_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
  target_user_id UUID;
  pro_earning NUMERIC;
BEGIN
  -- When a pro is assigned to an order
  IF TG_OP = 'UPDATE' AND NEW.pro_id IS NOT NULL AND OLD.pro_id IS NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, data)
    VALUES (
      NEW.pro_id,
      'Novo serviço atribuído',
      'Você foi selecionado para um novo serviço agendado para ' || TO_CHAR(NEW.scheduled_date::date, 'DD/MM/YYYY') || ' às ' || NEW.scheduled_time,
      'order',
      jsonb_build_object('order_id', NEW.id)
    );
  END IF;

  -- When order status changes
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    CASE NEW.status
      WHEN 'confirmed' THEN
        notification_title := 'Pedido confirmado';
        notification_message := 'Seu pedido foi confirmado pelo profissional.';
        notification_type := 'success';
        target_user_id := NEW.client_id;
      WHEN 'en_route' THEN
        notification_title := 'Profissional a caminho';
        notification_message := 'O profissional está a caminho do local.';
        notification_type := 'info';
        target_user_id := NEW.client_id;
      WHEN 'in_progress' THEN
        notification_title := 'Serviço iniciado';
        notification_message := 'O serviço foi iniciado.';
        notification_type := 'info';
        target_user_id := NEW.client_id;
      WHEN 'completed' THEN
        notification_title := 'Serviço concluído';
        notification_message := 'O serviço foi concluído. Avalie o profissional!';
        notification_type := 'success';
        target_user_id := NEW.client_id;
        IF NEW.pro_id IS NOT NULL THEN
          INSERT INTO public.notifications (user_id, title, message, type, data)
          VALUES (
            NEW.pro_id,
            'Serviço concluído',
            'Você concluiu o serviço. O saldo libera com a avaliação do cliente ou em até 48 horas.',
            'success',
            jsonb_build_object('order_id', NEW.id)
          );
        END IF;
      WHEN 'rated' THEN
        -- Notify the pro that the client rated and balance is available for withdrawal
        IF NEW.pro_id IS NOT NULL THEN
          pro_earning := ROUND((NEW.total_price + COALESCE(NEW.discount, 0)) * 0.8, 2);
          INSERT INTO public.notifications (user_id, title, message, type, data)
          VALUES (
            NEW.pro_id,
            'Saldo disponível para saque! 💰',
            'O cliente avaliou o serviço. R$ ' || REPLACE(pro_earning::TEXT, '.', ',') || ' já está disponível para saque.',
            'success',
            jsonb_build_object('order_id', NEW.id, 'amount', pro_earning)
          );
        END IF;
        -- Skip default notification
        RETURN NEW;
      WHEN 'cancelled' THEN
        notification_title := 'Pedido cancelado';
        notification_message := 'O pedido foi cancelado.';
        notification_type := 'warning';
        target_user_id := NEW.client_id;
        IF NEW.pro_id IS NOT NULL THEN
          INSERT INTO public.notifications (user_id, title, message, type, data)
          VALUES (
            NEW.pro_id,
            'Pedido cancelado',
            'Um pedido atribuído a você foi cancelado.',
            'warning',
            jsonb_build_object('order_id', NEW.id)
          );
        END IF;
      ELSE
        RETURN NEW;
    END CASE;

    IF target_user_id IS NOT NULL AND notification_title IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, data)
      VALUES (
        target_user_id,
        notification_title,
        notification_message,
        notification_type,
        jsonb_build_object('order_id', NEW.id)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Mural da diarista passa a enxergar o desconto (coluna nova sempre no final)
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
  z.center_lng AS zone_center_lng,
  o.discount
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

CREATE TABLE IF NOT EXISTS public.pedidos_sem_diarista (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address_id uuid REFERENCES public.addresses(id) ON DELETE SET NULL,
  city text,
  state text,
  motivo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pedidos_sem_diarista ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cliente registra busca sem diarista" ON public.pedidos_sem_diarista;
CREATE POLICY "cliente registra busca sem diarista" ON public.pedidos_sem_diarista
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin le buscas sem diarista" ON public.pedidos_sem_diarista;
CREATE POLICY "admin le buscas sem diarista" ON public.pedidos_sem_diarista
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS como_conheceu text;
