
CREATE OR REPLACE FUNCTION public.notify_new_chat_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client uuid;
  v_pro uuid;
  v_recipient uuid;
  v_preview text;
BEGIN
  SELECT client_id, pro_id INTO v_client, v_pro
  FROM public.orders WHERE id = NEW.order_id;

  -- Decide recipient: opposite role
  IF NEW.sender_role = 'client' THEN
    v_recipient := v_pro;
  ELSIF NEW.sender_role = 'pro' THEN
    v_recipient := v_client;
  ELSE
    -- Fallback by sender_id
    IF NEW.sender_id = v_client THEN v_recipient := v_pro;
    ELSIF NEW.sender_id = v_pro THEN v_recipient := v_client;
    END IF;
  END IF;

  IF v_recipient IS NULL THEN RETURN NEW; END IF;

  v_preview := COALESCE(NULLIF(LEFT(NEW.content, 80), ''), '📎 Anexo');

  INSERT INTO public.notifications (user_id, title, message, type, data, read)
  VALUES (
    v_recipient,
    'Nova mensagem 💬',
    v_preview,
    'chat',
    jsonb_build_object('order_id', NEW.order_id, 'message_id', NEW.id),
    false
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_chat_message ON public.order_messages;
CREATE TRIGGER trg_notify_new_chat_message
AFTER INSERT ON public.order_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_new_chat_message();
