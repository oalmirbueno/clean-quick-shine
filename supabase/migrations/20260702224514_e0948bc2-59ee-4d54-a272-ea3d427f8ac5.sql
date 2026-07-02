DROP POLICY IF EXISTS "Pros can view available orders" ON public.orders;
CREATE POLICY "Pros can view available orders"
ON public.orders FOR SELECT TO authenticated
USING (
  pro_id IS NULL
  AND status IN ('scheduled','matching')
  AND public.has_role(auth.uid(), 'pro')
  AND EXISTS (
    SELECT 1 FROM public.pro_profiles pp
    WHERE pp.user_id = auth.uid() AND pp.verified = true
  )
);

DROP POLICY IF EXISTS "Pros can accept available orders" ON public.orders;
CREATE POLICY "Pros can accept available orders"
ON public.orders FOR UPDATE TO authenticated
USING (
  pro_id IS NULL
  AND status IN ('scheduled','matching')
  AND public.has_role(auth.uid(), 'pro')
  AND EXISTS (
    SELECT 1 FROM public.pro_profiles pp
    WHERE pp.user_id = auth.uid() AND pp.verified = true
  )
)
WITH CHECK (
  pro_id = auth.uid()
  AND status = 'confirmed'
);