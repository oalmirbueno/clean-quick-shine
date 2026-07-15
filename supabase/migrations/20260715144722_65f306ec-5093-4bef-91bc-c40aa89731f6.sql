
-- =========================================================
-- 1. TABLES
-- =========================================================

CREATE TABLE public.verification_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  last_message_at TIMESTAMPTZ,
  unread_admin INTEGER NOT NULL DEFAULT 0,
  unread_pro INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.verification_threads TO authenticated;
GRANT ALL ON public.verification_threads TO service_role;

ALTER TABLE public.verification_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pro reads own thread"
  ON public.verification_threads FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Pro creates own thread"
  ON public.verification_threads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Admin updates any thread"
  ON public.verification_threads FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()) OR user_id = auth.uid())
  WITH CHECK (public.is_admin(auth.uid()) OR user_id = auth.uid());


CREATE TABLE public.verification_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.verification_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin','pro','system')),
  body TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_messages_thread ON public.verification_messages(thread_id, created_at DESC);

GRANT SELECT, INSERT ON public.verification_messages TO authenticated;
GRANT ALL ON public.verification_messages TO service_role;

ALTER TABLE public.verification_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read messages of accessible thread"
  ON public.verification_messages FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.verification_threads t
      WHERE t.id = thread_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Send message to accessible thread"
  ON public.verification_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.verification_threads t
        WHERE t.id = thread_id AND t.user_id = auth.uid()
      )
    )
  );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_threads;

-- =========================================================
-- 2. TRIGGER: on new message -> update thread counters + notify
-- =========================================================

CREATE OR REPLACE FUNCTION public.on_verification_message_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_preview TEXT;
BEGIN
  SELECT user_id INTO v_user_id FROM public.verification_threads WHERE id = NEW.thread_id;

  IF NEW.sender_role = 'pro' THEN
    UPDATE public.verification_threads
      SET last_message_at = NEW.created_at,
          unread_admin = unread_admin + 1,
          updated_at = now()
      WHERE id = NEW.thread_id;
  ELSIF NEW.sender_role IN ('admin','system') THEN
    UPDATE public.verification_threads
      SET last_message_at = NEW.created_at,
          unread_pro = unread_pro + 1,
          updated_at = now()
      WHERE id = NEW.thread_id;
  END IF;

  v_preview := COALESCE(NULLIF(LEFT(NEW.body, 100), ''), '📎 Anexo');

  IF NEW.sender_role IN ('admin','system') AND v_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, data, read)
    VALUES (
      v_user_id,
      'Mensagem sobre sua verificação',
      v_preview,
      'verification',
      jsonb_build_object('thread_id', NEW.thread_id),
      false
    );
  ELSIF NEW.sender_role = 'pro' THEN
    INSERT INTO public.notifications (user_id, title, message, type, data, read)
    SELECT ur.user_id,
           'Novo comentário de verificação',
           v_preview,
           'verification',
           jsonb_build_object('thread_id', NEW.thread_id, 'pro_user_id', v_user_id),
           false
    FROM public.user_roles ur
    WHERE ur.role = 'admin';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_verification_message_insert
  AFTER INSERT ON public.verification_messages
  FOR EACH ROW EXECUTE FUNCTION public.on_verification_message_insert();

CREATE TRIGGER update_verification_threads_updated_at
  BEFORE UPDATE ON public.verification_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 3. RPC: get or create thread
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_or_create_verification_thread(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT (public.is_admin(auth.uid()) OR auth.uid() = p_user_id) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT id INTO v_id FROM public.verification_threads WHERE user_id = p_user_id;

  IF v_id IS NULL THEN
    INSERT INTO public.verification_threads (user_id)
    VALUES (p_user_id)
    RETURNING id INTO v_id;
  END IF;

  RETURN v_id;
END;
$$;

-- =========================================================
-- 4. RPC: mark as read
-- =========================================================

CREATE OR REPLACE FUNCTION public.mark_verification_thread_read(p_thread_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
BEGIN
  SELECT user_id INTO v_owner FROM public.verification_threads WHERE id = p_thread_id;
  IF v_owner IS NULL THEN RETURN; END IF;

  IF public.is_admin(auth.uid()) THEN
    UPDATE public.verification_threads SET unread_admin = 0 WHERE id = p_thread_id;
  ELSIF auth.uid() = v_owner THEN
    UPDATE public.verification_threads SET unread_pro = 0 WHERE id = p_thread_id;
  END IF;
END;
$$;

-- =========================================================
-- 5. RPC: approve verification in bulk
-- =========================================================

CREATE OR REPLACE FUNCTION public.admin_approve_verification(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin UUID := auth.uid();
  v_thread UUID;
  v_approved_count INTEGER := 0;
BEGIN
  IF NOT public.is_admin(v_admin) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  WITH latest AS (
    SELECT DISTINCT ON (doc_type) id, doc_type, status
    FROM public.pro_documents
    WHERE user_id = p_user_id AND doc_type IN ('id_front','id_back','selfie')
    ORDER BY doc_type, created_at DESC
  ),
  upd AS (
    UPDATE public.pro_documents pd
      SET status = 'approved',
          reviewed_at = now(),
          reviewed_by = v_admin,
          rejection_reason = NULL
      FROM latest
      WHERE pd.id = latest.id AND latest.status <> 'approved'
      RETURNING pd.id
  )
  SELECT COUNT(*) INTO v_approved_count FROM upd;

  v_thread := public.get_or_create_verification_thread(p_user_id);

  INSERT INTO public.verification_messages (thread_id, sender_id, sender_role, body)
  VALUES (
    v_thread, v_admin, 'admin',
    CASE
      WHEN v_approved_count > 0 THEN 'Verificação aprovada ✅ Todos os documentos obrigatórios foram validados. Você já pode receber pedidos!'
      ELSE 'Verificação confirmada ✅ Seus documentos já estavam aprovados.'
    END
  );
END;
$$;

-- =========================================================
-- 6. RPC: reject verification in bulk
-- =========================================================

CREATE OR REPLACE FUNCTION public.admin_reject_verification(p_user_id UUID, p_reason TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin UUID := auth.uid();
  v_thread UUID;
BEGIN
  IF NOT public.is_admin(v_admin) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'reason required';
  END IF;

  WITH latest AS (
    SELECT DISTINCT ON (doc_type) id, doc_type, status
    FROM public.pro_documents
    WHERE user_id = p_user_id AND doc_type IN ('id_front','id_back','selfie')
    ORDER BY doc_type, created_at DESC
  )
  UPDATE public.pro_documents pd
    SET status = 'rejected',
        reviewed_at = now(),
        reviewed_by = v_admin,
        rejection_reason = p_reason
    FROM latest
    WHERE pd.id = latest.id AND latest.status = 'pending';

  v_thread := public.get_or_create_verification_thread(p_user_id);

  INSERT INTO public.verification_messages (thread_id, sender_id, sender_role, body)
  VALUES (
    v_thread, v_admin, 'admin',
    'Verificação recusada. Motivo: ' || p_reason || E'\n\nPor favor, reenvie os documentos corrigidos.'
  );
END;
$$;
