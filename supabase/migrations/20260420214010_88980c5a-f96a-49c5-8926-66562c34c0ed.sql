-- Restrict coupon visibility to authenticated users only
DROP POLICY IF EXISTS "Active coupons are publicly readable" ON public.coupons;

CREATE POLICY "Authenticated users can view active coupons"
ON public.coupons
FOR SELECT
TO authenticated
USING (active = true);