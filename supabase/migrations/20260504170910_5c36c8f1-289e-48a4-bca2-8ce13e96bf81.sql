CREATE TABLE public.notification_dispatch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  channel TEXT NOT NULL CHECK (channel IN ('in_app','push')),
  title TEXT,
  message TEXT,
  type TEXT,
  status TEXT NOT NULL CHECK (status IN ('success','failed','partial','skipped')),
  endpoint TEXT,
  error TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  caller_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ndl_created_at ON public.notification_dispatch_logs(created_at DESC);
CREATE INDEX idx_ndl_user_id ON public.notification_dispatch_logs(user_id);
CREATE INDEX idx_ndl_status ON public.notification_dispatch_logs(status);

ALTER TABLE public.notification_dispatch_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view dispatch logs"
ON public.notification_dispatch_logs FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role can insert dispatch logs"
ON public.notification_dispatch_logs FOR INSERT
WITH CHECK (true);
