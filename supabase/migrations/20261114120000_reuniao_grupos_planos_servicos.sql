-- Reunião de 14/11/2026. Só acrescenta ou substitui; nenhum dado é apagado.
-- 1) Grupos de WhatsApp (links no admin, tela obrigatória, registro de quem clicou/confirmou).
-- 2) Mensalidade no cartão pelo Asaas (estrutura; preços ficam com o admin).
-- 3) Serviços novos (passadoria e marido de aluguel) criados DESLIGADOS e sem preço.
-- 4) Planos com preço de exemplo ficam desligados até a tabela real ser definida.

-- ───────────────────────── 1) Grupos de WhatsApp ─────────────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audience text NOT NULL CHECK (audience IN ('client', 'pro')),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  invite_url text NOT NULL CHECK (invite_url ~* '^https://chat\.whatsapp\.com/[A-Za-z0-9_-]+'),
  active boolean NOT NULL DEFAULT true,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Só um grupo "atual" por público.
CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_groups_um_atual
  ON public.whatsapp_groups (audience) WHERE is_current;

CREATE TABLE IF NOT EXISTS public.whatsapp_group_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id uuid REFERENCES public.whatsapp_groups(id) ON DELETE SET NULL,
  audience text NOT NULL CHECK (audience IN ('client', 'pro')),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('clique', 'confirmou')),
  origem text NOT NULL DEFAULT 'app' CHECK (origem IN ('app', 'site')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS whatsapp_group_events_user ON public.whatsapp_group_events (user_id, audience, tipo);
CREATE INDEX IF NOT EXISTS whatsapp_group_events_group ON public.whatsapp_group_events (group_id, tipo);

ALTER TABLE public.whatsapp_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_group_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins gerenciam grupos" ON public.whatsapp_groups;
CREATE POLICY "Admins gerenciam grupos" ON public.whatsapp_groups
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins leem eventos de grupo" ON public.whatsapp_group_events;
CREATE POLICY "Admins leem eventos de grupo" ON public.whatsapp_group_events
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Grupo desligado nunca fica como atual.
CREATE OR REPLACE FUNCTION public.whatsapp_groups_antes_de_salvar()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NOT NEW.active THEN NEW.is_current := false; END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_whatsapp_groups_antes_de_salvar ON public.whatsapp_groups;
CREATE TRIGGER trg_whatsapp_groups_antes_de_salvar
  BEFORE INSERT OR UPDATE ON public.whatsapp_groups
  FOR EACH ROW EXECUTE FUNCTION public.whatsapp_groups_antes_de_salvar();

-- Admin marca qual é o grupo atual do público (troca em uma tacada só).
CREATE OR REPLACE FUNCTION public.grupo_definir_atual(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_aud text;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  SELECT audience INTO v_aud FROM public.whatsapp_groups WHERE id = p_id AND active;
  IF v_aud IS NULL THEN RAISE EXCEPTION 'Grupo não encontrado ou desligado'; END IF;
  UPDATE public.whatsapp_groups SET is_current = false WHERE audience = v_aud AND is_current AND id <> p_id;
  UPDATE public.whatsapp_groups SET is_current = true WHERE id = p_id;
END;
$$;

-- O app pergunta: esta pessoa ainda precisa passar pela tela do grupo?
CREATE OR REPLACE FUNCTION public.grupo_do_usuario()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_aud text;
  v_id uuid; v_name text; v_url text;
  v_ligado boolean;
  v_confirmou boolean;
BEGIN
  IF v_uid IS NULL OR public.is_admin(v_uid) THEN
    RETURN jsonb_build_object('obrigatorio', false, 'confirmado', false, 'grupo', NULL);
  END IF;
  v_aud := CASE WHEN public.has_role(v_uid, 'pro') THEN 'pro' ELSE 'client' END;
  SELECT id, name, invite_url INTO v_id, v_name, v_url
    FROM public.whatsapp_groups WHERE audience = v_aud AND is_current AND active LIMIT 1;
  v_ligado := COALESCE((SELECT value FROM public.app_config WHERE key = 'grupo_obrigatorio'), 'on') <> 'off';
  v_confirmou := EXISTS (
    SELECT 1 FROM public.whatsapp_group_events
    WHERE user_id = v_uid AND audience = v_aud AND tipo = 'confirmou'
  );
  RETURN jsonb_build_object(
    'audience', v_aud,
    'confirmado', v_confirmou,
    'obrigatorio', v_ligado AND v_id IS NOT NULL AND NOT v_confirmou,
    'grupo', CASE WHEN v_id IS NULL THEN NULL
             ELSE jsonb_build_object('id', v_id, 'name', v_name, 'invite_url', v_url) END
  );
END;
$$;

-- Registra o clique/confirmação e devolve o link do grupo atual.
-- Logado: o público vem do perfil. Sem login (site): só registra clique.
CREATE OR REPLACE FUNCTION public.grupo_registrar(p_tipo text, p_audience text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_aud text; v_tipo text; v_origem text;
  v_id uuid; v_url text;
BEGIN
  IF v_uid IS NULL THEN
    v_aud := p_audience; v_tipo := 'clique'; v_origem := 'site';
  ELSE
    v_aud := CASE WHEN public.is_admin(v_uid) AND p_audience IN ('client', 'pro') THEN p_audience
                  WHEN public.has_role(v_uid, 'pro') THEN 'pro' ELSE 'client' END;
    v_tipo := p_tipo; v_origem := 'app';
  END IF;
  IF v_aud NOT IN ('client', 'pro') OR v_tipo NOT IN ('clique', 'confirmou') THEN
    RAISE EXCEPTION 'Pedido inválido';
  END IF;
  SELECT id, invite_url INTO v_id, v_url
    FROM public.whatsapp_groups WHERE audience = v_aud AND is_current AND active LIMIT 1;
  IF v_id IS NULL THEN RETURN NULL; END IF;
  INSERT INTO public.whatsapp_group_events (group_id, audience, user_id, tipo, origem)
  VALUES (v_id, v_aud, v_uid, v_tipo, v_origem);
  RETURN v_url;
END;
$$;

REVOKE ALL ON FUNCTION public.grupo_definir_atual(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.grupo_do_usuario() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.grupo_registrar(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grupo_definir_atual(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grupo_do_usuario() TO authenticated;
GRANT EXECUTE ON FUNCTION public.grupo_registrar(text, text) TO anon, authenticated;

-- Automação: boas-vindas com o convite do grupo assim que a conta nasce.
-- Desliga pelo admin (app_config.auto_boas_vindas_grupo = 'off').
CREATE OR REPLACE FUNCTION public.boas_vindas_com_grupo()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_aud text; v_tem boolean;
BEGIN
  IF NEW.role NOT IN ('client', 'pro') THEN RETURN NEW; END IF;
  IF COALESCE((SELECT value FROM public.app_config WHERE key = 'auto_boas_vindas_grupo'), 'on') = 'off' THEN
    RETURN NEW;
  END IF;
  v_aud := NEW.role::text;
  v_tem := EXISTS (SELECT 1 FROM public.whatsapp_groups WHERE audience = v_aud AND is_current AND active);
  IF NOT v_tem THEN RETURN NEW; END IF;
  BEGIN
    INSERT INTO public.notifications (user_id, title, message, type, read, data)
    VALUES (
      NEW.user_id,
      'Boas-vindas ao Já Limpo',
      CASE WHEN v_aud = 'pro'
        THEN 'Entre no grupo das diaristas no WhatsApp para receber avisos de serviço e novidades.'
        ELSE 'Entre no grupo de clientes no WhatsApp para receber avisos e ofertas.'
      END,
      'grupo', false, jsonb_build_object('url', '/grupo')
    );
  EXCEPTION WHEN OTHERS THEN
    -- aviso nunca pode impedir o cadastro
    NULL;
  END;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_boas_vindas_com_grupo ON public.user_roles;
CREATE TRIGGER trg_boas_vindas_com_grupo
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.boas_vindas_com_grupo();

-- Painel: quantas pessoas clicaram e confirmaram em cada grupo.
CREATE OR REPLACE FUNCTION public.grupos_resumo()
RETURNS TABLE (group_id uuid, cliques bigint, confirmados bigint, cliques_site bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT e.group_id,
         count(DISTINCT e.user_id) FILTER (WHERE e.tipo = 'clique' AND e.user_id IS NOT NULL),
         count(DISTINCT e.user_id) FILTER (WHERE e.tipo = 'confirmou'),
         count(*) FILTER (WHERE e.origem = 'site')
  FROM public.whatsapp_group_events e
  WHERE public.is_admin(auth.uid()) AND e.group_id IS NOT NULL
  GROUP BY e.group_id;
$$;
REVOKE ALL ON FUNCTION public.grupos_resumo() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grupos_resumo() TO authenticated;

-- ───────────────────────── 2) Mensalidade no cartão ─────────────────────────
ALTER TABLE public.client_subscriptions
  ADD COLUMN IF NOT EXISTS asaas_subscription_id text,
  ADD COLUMN IF NOT EXISTS last_payment_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE public.pro_subscriptions
  ADD COLUMN IF NOT EXISTS asaas_subscription_id text,
  ADD COLUMN IF NOT EXISTS last_payment_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

-- Pedido de assinatura aguardando o primeiro pagamento no cartão.
CREATE TABLE IF NOT EXISTS public.plan_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('client', 'pro')),
  plan_id uuid NOT NULL,
  amount numeric NOT NULL,
  asaas_checkout_id text,
  asaas_subscription_id text,
  invoice_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS plan_checkouts_user ON public.plan_checkouts (user_id, kind, status);
CREATE INDEX IF NOT EXISTS plan_checkouts_asaas ON public.plan_checkouts (asaas_checkout_id);
ALTER TABLE public.plan_checkouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Dono ou admin leem pedido de plano" ON public.plan_checkouts;
CREATE POLICY "Dono ou admin leem pedido de plano" ON public.plan_checkouts
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Assinatura só nasce pelo pagamento confirmado (servidor). Antes, qualquer
-- usuário conseguia gravar a própria assinatura "ativa" sem pagar.
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.client_subscriptions;
DROP POLICY IF EXISTS "Users can manage their own pro subscriptions" ON public.pro_subscriptions;
DROP POLICY IF EXISTS "Admins can view all client subscriptions" ON public.client_subscriptions;
CREATE POLICY "Admins can view all client subscriptions" ON public.client_subscriptions
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Planos com preço de exemplo saem da vitrine até a tabela real ser definida
-- (liga de volta em Admin → Planos). O plano gratuito da diarista continua.
UPDATE public.client_plans SET active = false WHERE active;
UPDATE public.pro_plans SET active = false WHERE active AND monthly_price > 0;

-- ───────────────────────── 3) Serviços novos (desligados) ─────────────────────────
INSERT INTO public.services (name, description, base_price, duration_hours, icon, active, requires_pro_plan, category)
SELECT 'Passadoria', 'Roupas passadas e organizadas por uma profissional.', 0, 3, 'Shirt', false, false, 'passadoria'
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Passadoria');

INSERT INTO public.services (name, description, base_price, duration_hours, icon, active, requires_pro_plan, category)
SELECT 'Marido de Aluguel', 'Pequenos reparos e instalações em casa.', 0, 2, 'Wrench', false, false, 'reparos'
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Marido de Aluguel');
