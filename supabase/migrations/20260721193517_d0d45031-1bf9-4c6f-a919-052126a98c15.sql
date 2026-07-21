CREATE TABLE IF NOT EXISTS public.pwa_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text NOT NULL UNIQUE,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT ALL ON public.pwa_devices TO service_role;
ALTER TABLE public.pwa_devices ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS pwa_devices_last_seen_idx ON public.pwa_devices(last_seen_at DESC);