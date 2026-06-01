-- Chat messages
CREATE TABLE public.order_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT,
  attachment_url TEXT,
  attachment_type TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_messages_order ON public.order_messages(order_id, created_at);

GRANT SELECT, INSERT, UPDATE ON public.order_messages TO authenticated;
GRANT ALL ON public.order_messages TO service_role;

ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messages"
ON public.order_messages FOR SELECT TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders
    WHERE client_id = auth.uid() OR pro_id = auth.uid()
  ) OR public.is_admin(auth.uid())
);

CREATE POLICY "Participants can send messages"
ON public.order_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  order_id IN (
    SELECT id FROM public.orders
    WHERE client_id = auth.uid() OR pro_id = auth.uid()
  )
);

CREATE POLICY "Participants can mark as read"
ON public.order_messages FOR UPDATE TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders
    WHERE client_id = auth.uid() OR pro_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage messages"
ON public.order_messages FOR ALL TO authenticated
USING (public.is_admin(auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.order_messages;
ALTER TABLE public.order_messages REPLICA IDENTITY FULL;

-- Storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Participants can upload chat attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.orders
    WHERE client_id = auth.uid() OR pro_id = auth.uid()
  )
);

CREATE POLICY "Participants can read chat attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'chat-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.orders
    WHERE client_id = auth.uid() OR pro_id = auth.uid()
  )
);

CREATE POLICY "Admins manage chat attachments"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'chat-attachments' AND public.is_admin(auth.uid()));