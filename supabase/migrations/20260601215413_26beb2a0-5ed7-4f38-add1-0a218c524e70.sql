
DROP POLICY IF EXISTS "Users can add messages to their tickets" ON public.support_messages;

CREATE POLICY "Users can add messages to their tickets"
ON public.support_messages
FOR INSERT
TO authenticated
WITH CHECK (
  ticket_id IN (
    SELECT id FROM public.support_tickets WHERE user_id = auth.uid()
  )
  AND COALESCE(is_admin, false) = false
);
