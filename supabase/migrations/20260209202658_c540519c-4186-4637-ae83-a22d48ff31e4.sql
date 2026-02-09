-- Update trigger to encrypt data passed via encrypted_pix_key/encrypted_bank_info columns
-- The app will pass plaintext values and the trigger will encrypt them
CREATE OR REPLACE FUNCTION public.encrypt_withdrawal_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  -- Encrypt pix_key if provided as plaintext in encrypted_pix_key
  IF NEW.encrypted_pix_key IS NOT NULL AND LEFT(NEW.encrypted_pix_key, 4) != 'jA0E' THEN
    NEW.encrypted_pix_key := public.encrypt_field(NEW.encrypted_pix_key);
  END IF;
  -- Encrypt bank_info if provided as plaintext in encrypted_bank_info
  IF NEW.encrypted_bank_info IS NOT NULL AND LEFT(NEW.encrypted_bank_info, 4) != 'jA0E' THEN
    NEW.encrypted_bank_info := public.encrypt_field(NEW.encrypted_bank_info);
  END IF;
  RETURN NEW;
END;
$function$;