-- A1: proteger chaves PIX gravadas em texto puro na coluna encrypted_pix_key.
-- Não-destrutivo: guarda o valor atual em coluna de backup ANTES de re-cifrar,
-- e só re-cifra linhas cujo valor não decripta (ou seja, está em texto puro).

ALTER TABLE public.withdrawals
  ADD COLUMN IF NOT EXISTS encrypted_pix_key_backup text;

UPDATE public.withdrawals
  SET encrypted_pix_key_backup = encrypted_pix_key
  WHERE encrypted_pix_key IS NOT NULL
    AND encrypted_pix_key_backup IS NULL;

DO $$
DECLARE
  r record;
  v_test text;
BEGIN
  FOR r IN
    SELECT id, encrypted_pix_key
    FROM public.withdrawals
    WHERE encrypted_pix_key IS NOT NULL
  LOOP
    BEGIN
      -- Se já está cifrado, decripta sem erro e nada é feito.
      v_test := public.decrypt_field(r.encrypted_pix_key);
    EXCEPTION WHEN others THEN
      -- Falhou: era texto puro. Cifra agora.
      UPDATE public.withdrawals
        SET encrypted_pix_key = public.encrypt_field(r.encrypted_pix_key)
        WHERE id = r.id;
    END;
  END LOOP;
END $$;
