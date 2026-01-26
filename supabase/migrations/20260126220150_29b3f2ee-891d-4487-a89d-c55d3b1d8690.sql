-- Function to create order notifications
CREATE OR REPLACE FUNCTION public.create_order_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
  target_user_id UUID;
BEGIN
  -- When a pro is assigned to an order
  IF TG_OP = 'UPDATE' AND NEW.pro_id IS NOT NULL AND OLD.pro_id IS NULL THEN
    -- Notify the pro
    INSERT INTO public.notifications (user_id, title, message, type, data)
    VALUES (
      NEW.pro_id,
      'Novo serviço atribuído',
      'Você foi selecionado para um novo serviço agendado para ' || TO_CHAR(NEW.scheduled_date, 'DD/MM/YYYY') || ' às ' || TO_CHAR(NEW.scheduled_time, 'HH24:MI'),
      'order',
      jsonb_build_object('order_id', NEW.id)
    );
  END IF;

  -- When order status changes (only for updates)
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    -- Determine notification based on status
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
        
        -- Also notify the pro
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
      WHEN 'cancelled' THEN
        notification_title := 'Pedido cancelado';
        notification_message := 'O pedido foi cancelado.';
        notification_type := 'warning';
        target_user_id := NEW.client_id;
        
        -- Also notify the pro if assigned
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
        -- No notification for other statuses
        RETURN NEW;
    END CASE;
    
    -- Insert notification for primary target
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
$$;

-- Create trigger for order notifications
DROP TRIGGER IF EXISTS on_order_change_notify ON public.orders;
CREATE TRIGGER on_order_change_notify
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_order_notification();