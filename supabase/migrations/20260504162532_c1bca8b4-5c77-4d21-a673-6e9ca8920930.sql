ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tutorial_client_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tutorial_pro_completed_at TIMESTAMPTZ;