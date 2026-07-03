-- A6: garantir a role do usuário no servidor, no momento do cadastro.
-- Blindagem para quando "Confirm email" for ativado (sem sessão imediata, o
-- INSERT client-side de role falharia por RLS e o usuário ficaria sem role).
-- Lê raw_user_meta_data->>'signup_role' (passado pelo frontend); aceita apenas
-- 'client' ou 'pro' (nunca admin). Não altera usuários existentes.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  safe_name TEXT;
  v_role public.app_role;
BEGIN
  safe_name := TRIM(SUBSTRING(
    regexp_replace(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), '[^\x20-\x7EÀ-ÿ]', '', 'g'),
    1, 100
  ));

  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NULLIF(safe_name, ''));

  v_role := CASE
    WHEN NEW.raw_user_meta_data->>'signup_role' = 'pro' THEN 'pro'::public.app_role
    ELSE 'client'::public.app_role
  END;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;
