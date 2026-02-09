
-- 1. Fix notifications INSERT policy (too permissive)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Users and admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    public.is_admin(auth.uid()) OR auth.uid() = user_id
  );

-- 2. Sanitize handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE safe_name TEXT;
BEGIN
  safe_name := TRIM(SUBSTRING(
    regexp_replace(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), '[^\x20-\x7EÀ-ÿ]', '', 'g'),
    1, 100
  ));
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NULLIF(safe_name, ''));
  RETURN NEW;
END;
$$;

-- 3. Create pro_declined_orders table
CREATE TABLE IF NOT EXISTS public.pro_declined_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, order_id)
);

ALTER TABLE public.pro_declined_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own declines"
  ON public.pro_declined_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own declines"
  ON public.pro_declined_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all declines"
  ON public.pro_declined_orders FOR ALL
  USING (public.is_admin(auth.uid()));
