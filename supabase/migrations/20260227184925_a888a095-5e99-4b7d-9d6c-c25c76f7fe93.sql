
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS asaas_transfer_id TEXT;
CREATE INDEX IF NOT EXISTS idx_withdrawals_asaas_id ON public.withdrawals(asaas_transfer_id);
