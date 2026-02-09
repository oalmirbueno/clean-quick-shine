-- 1. Drop the view that references the plaintext columns
DROP VIEW IF EXISTS public.withdrawals_secure;

-- 2. Recreate the view without plaintext fallback
CREATE VIEW public.withdrawals_secure
WITH (security_invoker = on) AS
SELECT
  id,
  user_id,
  amount,
  method,
  status,
  created_at,
  processed_at,
  CASE
    WHEN encrypted_bank_info IS NOT NULL THEN (decrypt_field(encrypted_bank_info))::jsonb
    ELSE NULL
  END AS bank_info,
  CASE
    WHEN encrypted_pix_key IS NOT NULL THEN decrypt_field(encrypted_pix_key)
    ELSE NULL
  END AS pix_key
FROM withdrawals;

-- 3. Update the trigger function to no longer null out plaintext columns (they won't exist)
CREATE OR REPLACE FUNCTION public.encrypt_withdrawal_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  -- bank_info comes as a JSON text via application; encrypt it
  IF NEW.encrypted_bank_info IS NULL AND TG_ARGV IS NOT NULL THEN
    -- No-op: plaintext columns removed
    NULL;
  END IF;
  RETURN NEW;
END;
$function$;

-- 4. Drop the plaintext columns
ALTER TABLE public.withdrawals DROP COLUMN IF EXISTS bank_info;
ALTER TABLE public.withdrawals DROP COLUMN IF EXISTS pix_key;