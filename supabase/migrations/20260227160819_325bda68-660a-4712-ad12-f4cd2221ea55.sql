-- Allow authenticated users to insert payments for their own orders
CREATE POLICY "Users can insert payments for their orders" ON public.payments
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND order_id IN (SELECT id FROM orders WHERE client_id = auth.uid())
);

-- Allow webhook (service_role) to update payment status
CREATE POLICY "Users can update their own payments" ON public.payments
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);