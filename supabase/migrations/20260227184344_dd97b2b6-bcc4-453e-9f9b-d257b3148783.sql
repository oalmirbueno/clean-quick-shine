
-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id);

-- Trigger to notify pros of new orders
CREATE OR REPLACE FUNCTION public.notify_pros_new_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('matching', 'scheduled', 'confirmed') AND
     (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    INSERT INTO public.notifications (user_id, title, message, type, read)
    SELECT
      pp.user_id,
      'Novo pedido disponível! 🧹',
      'Há um novo pedido de limpeza na sua região. Abra o app para ver.',
      'new_order',
      false
    FROM public.pro_profiles pp
    WHERE pp.available_now = true AND pp.verified = true
    AND pp.user_id != COALESCE(NEW.pro_id, '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

DROP TRIGGER IF EXISTS trg_notify_pros_new_order ON public.orders;
CREATE TRIGGER trg_notify_pros_new_order
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_pros_new_order();
