
CREATE OR REPLACE FUNCTION public.create_order_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
  target_user_id UUID;
  pro_earning NUMERIC;
BEGIN
  -- When a pro is assigned to an order
  IF TG_OP = 'UPDATE' AND NEW.pro_id IS NOT NULL AND OLD.pro_id IS NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, data)
    VALUES (
      NEW.pro_id,
      'Novo serviço atribuído',
      'Você foi selecionado para um novo serviço agendado para ' || TO_CHAR(NEW.scheduled_date::date, 'DD/MM/YYYY') || ' às ' || NEW.scheduled_time,
      'order',
      jsonb_build_object('order_id', NEW.id)
    );
  END IF;

  -- When order status changes
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    CASE NEW.status
      WHEN 'confirmed' THEN
        notification_title := 'Pedido confirmado';
        notification_message := 'Seu pedido foi confirmado pelo profissional.';
        notification_type := 'success';
        target_user_id := NEW.client_id;
      WHEN 'en_route' THEN
        notification_title := 'Profissional a caminho';
        notification_message := 'O profissional está a caminho do local.';
        notification_type := 'info';
        target_user_id := NEW.client_id;
      WHEN 'in_progress' THEN
        notification_title := 'Serviço iniciado';
        notification_message := 'O serviço foi iniciado.';
        notification_type := 'info';
        target_user_id := NEW.client_id;
      WHEN 'completed' THEN
        notification_title := 'Serviço concluído';
        notification_message := 'O serviço foi concluído. Avalie o profissional!';
        notification_type := 'success';
        target_user_id := NEW.client_id;
        IF NEW.pro_id IS NOT NULL THEN
          INSERT INTO public.notifications (user_id, title, message, type, data)
          VALUES (
            NEW.pro_id,
            'Serviço concluído',
            'Você concluiu o serviço. Aguarde a avaliação do cliente.',
            'success',
            jsonb_build_object('order_id', NEW.id)
          );
        END IF;
      WHEN 'rated' THEN
        -- Notify the pro that the client rated and balance is available for withdrawal
        IF NEW.pro_id IS NOT NULL THEN
          pro_earning := ROUND(NEW.total_price * 0.8, 2);
          INSERT INTO public.notifications (user_id, title, message, type, data)
          VALUES (
            NEW.pro_id,
            'Saldo disponível para saque! 💰',
            'O cliente avaliou o serviço. R$ ' || REPLACE(pro_earning::TEXT, '.', ',') || ' já está disponível para saque.',
            'success',
            jsonb_build_object('order_id', NEW.id, 'amount', pro_earning)
          );
        END IF;
        -- Skip default notification
        RETURN NEW;
      WHEN 'cancelled' THEN
        notification_title := 'Pedido cancelado';
        notification_message := 'O pedido foi cancelado.';
        notification_type := 'warning';
        target_user_id := NEW.client_id;
        IF NEW.pro_id IS NOT NULL THEN
          INSERT INTO public.notifications (user_id, title, message, type, data)
          VALUES (
            NEW.pro_id,
            'Pedido cancelado',
            'Um pedido atribuído a você foi cancelado.',
            'warning',
            jsonb_build_object('order_id', NEW.id)
          );
        END IF;
      ELSE
        RETURN NEW;
    END CASE;
    
    IF target_user_id IS NOT NULL AND notification_title IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, data)
      VALUES (
        target_user_id,
        notification_title,
        notification_message,
        notification_type,
        jsonb_build_object('order_id', NEW.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;
