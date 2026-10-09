-- Push nativo (FCM no Android, APNs no iPhone).
--
-- Antes: send-push-notification só registrava "queued" e nada chegava ao
-- aparelho; diaristas só viam pedido novo com o app aberto.
-- Agora: o app grava o token do aparelho em device_tokens e cada linha nova em
-- notifications chama a função push-dispatch (pg_net), que entrega pelo canal
-- certo. Sem as chaves do Firebase/Apple configuradas na função, nada é
-- enviado e nada quebra.

-- 1. tokens dos aparelhos -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  platform text NOT NULL CHECK (platform IN ('android', 'ios')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS device_tokens_user_idx ON public.device_tokens (user_id);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dono gerencia seus tokens" ON public.device_tokens;
CREATE POLICY "dono gerencia seus tokens" ON public.device_tokens
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- O mesmo aparelho trocando de conta: o upsert por token precisa poder
-- "assumir" a linha do usuário anterior. Esta função faz isso com segurança
-- (só reatribui o token informado para quem está logado).
CREATE OR REPLACE FUNCTION public.reivindicar_device_token(p_token text, p_platform text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'não autenticado';
  END IF;
  INSERT INTO public.device_tokens (user_id, token, platform)
  VALUES (auth.uid(), p_token, p_platform)
  ON CONFLICT (token) DO UPDATE
    SET user_id = auth.uid(), platform = EXCLUDED.platform, updated_at = now();
END;
$$;
REVOKE ALL ON FUNCTION public.reivindicar_device_token(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reivindicar_device_token(text, text) TO authenticated;

-- 2. marca de envio (evita push repetido) --------------------------------------
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS pushed_at timestamptz;

-- 3. disparo automático --------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.disparar_push_notificacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := 'https://grqwwpxpmcwailkxbbbj.supabase.co/functions/v1/push-dispatch',
      body := jsonb_build_object('notification_id', NEW.id),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    -- push nunca pode impedir a notificação no app
    RAISE WARNING 'push-dispatch não disparado: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.disparar_push_notificacao() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_disparar_push ON public.notifications;
CREATE TRIGGER trg_disparar_push
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.disparar_push_notificacao();
