-- Dashboard admin em tempo real: publica payments e withdrawals no canal
-- realtime (orders já está publicado desde 20260126160952).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'payments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'withdrawals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawals;
  END IF;
END $$;
