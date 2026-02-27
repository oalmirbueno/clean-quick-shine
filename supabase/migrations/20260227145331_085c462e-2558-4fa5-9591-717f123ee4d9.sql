
-- Adicionar coluna asaas_customer_id na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;

-- Adicionar colunas Asaas na tabela payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS asaas_payment_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS asaas_status TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS pix_qr_code TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS pix_copy_paste TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS boleto_url TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS invoice_url TEXT;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_asaas_id ON public.payments(asaas_payment_id);
CREATE INDEX IF NOT EXISTS idx_profiles_asaas_customer ON public.profiles(asaas_customer_id);
