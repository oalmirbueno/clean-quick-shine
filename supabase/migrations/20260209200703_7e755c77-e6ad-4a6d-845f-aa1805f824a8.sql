
-- 1. Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create a secure config table for the encryption key (admin-only)
CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Only admins can access config
CREATE POLICY "Admins can manage config"
  ON public.app_config FOR ALL
  USING (public.is_admin(auth.uid()));

-- Store a generated encryption key
INSERT INTO public.app_config (key, value)
VALUES ('encryption_key', encode(gen_random_bytes(32), 'hex'));

-- 3. Create encrypt helper (SECURITY DEFINER to access config)
CREATE OR REPLACE FUNCTION public.encrypt_field(plain_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE enc_key text;
BEGIN
  IF plain_text IS NULL THEN RETURN NULL; END IF;
  SELECT value INTO enc_key FROM public.app_config WHERE key = 'encryption_key';
  RETURN encode(pgp_sym_encrypt(plain_text, enc_key), 'base64');
END;
$$;

-- 4. Create decrypt helper
CREATE OR REPLACE FUNCTION public.decrypt_field(encrypted_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE enc_key text;
BEGIN
  IF encrypted_text IS NULL THEN RETURN NULL; END IF;
  SELECT value INTO enc_key FROM public.app_config WHERE key = 'encryption_key';
  RETURN pgp_sym_decrypt(decode(encrypted_text, 'base64'), enc_key);
END;
$$;

-- 5. Add encrypted columns
ALTER TABLE public.withdrawals 
  ADD COLUMN encrypted_bank_info text,
  ADD COLUMN encrypted_pix_key text;

-- 6. Create trigger to auto-encrypt on INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.encrypt_withdrawal_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.bank_info IS NOT NULL THEN
    NEW.encrypted_bank_info := public.encrypt_field(NEW.bank_info::text);
    NEW.bank_info := NULL;
  END IF;
  IF NEW.pix_key IS NOT NULL THEN
    NEW.encrypted_pix_key := public.encrypt_field(NEW.pix_key);
    NEW.pix_key := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER encrypt_withdrawal_trigger
  BEFORE INSERT OR UPDATE ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_withdrawal_data();

-- 7. Create secure view for reading decrypted data (RLS via security_invoker)
CREATE VIEW public.withdrawals_secure
WITH (security_invoker = on)
AS
SELECT 
  id, user_id, amount, method, status, created_at, processed_at,
  CASE WHEN encrypted_bank_info IS NOT NULL 
    THEN public.decrypt_field(encrypted_bank_info)::jsonb 
    ELSE bank_info 
  END as bank_info,
  CASE WHEN encrypted_pix_key IS NOT NULL 
    THEN public.decrypt_field(encrypted_pix_key) 
    ELSE pix_key 
  END as pix_key
FROM public.withdrawals;
