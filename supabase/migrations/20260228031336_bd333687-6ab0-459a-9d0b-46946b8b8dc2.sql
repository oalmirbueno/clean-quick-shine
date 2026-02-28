-- Allow pros to view addresses of orders assigned to them
CREATE POLICY "Pros can view addresses of assigned orders"
ON public.addresses
FOR SELECT
USING (
  id IN (
    SELECT address_id FROM public.orders
    WHERE pro_id = auth.uid()
    AND status IN ('confirmed', 'en_route', 'in_progress', 'completed', 'rated')
  )
);

-- Allow admins to view all addresses
CREATE POLICY "Admins can view all addresses"
ON public.addresses
FOR SELECT
USING (is_admin(auth.uid()));