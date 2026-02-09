
-- Fix encrypt function to use extensions schema for pgcrypto
CREATE OR REPLACE FUNCTION public.encrypt_field(plain_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE enc_key text;
BEGIN
  IF plain_text IS NULL THEN RETURN NULL; END IF;
  SELECT value INTO enc_key FROM public.app_config WHERE key = 'encryption_key';
  RETURN encode(pgp_sym_encrypt(plain_text, enc_key), 'base64');
END;
$$;

-- Fix decrypt function
CREATE OR REPLACE FUNCTION public.decrypt_field(encrypted_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE enc_key text;
BEGIN
  IF encrypted_text IS NULL THEN RETURN NULL; END IF;
  SELECT value INTO enc_key FROM public.app_config WHERE key = 'encryption_key';
  RETURN pgp_sym_decrypt(decode(encrypted_text, 'base64'), enc_key);
END;
$$;

-- Fix trigger function
CREATE OR REPLACE FUNCTION public.encrypt_withdrawal_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
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
