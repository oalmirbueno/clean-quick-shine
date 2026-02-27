
-- Trigger 1: Auto-assign zona quando endereço é criado/atualizado
DROP TRIGGER IF EXISTS trg_auto_assign_zone ON public.addresses;
CREATE TRIGGER trg_auto_assign_zone
  BEFORE INSERT OR UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_zone();

-- Trigger 2: Notificar pros quando novo pedido entra
DROP TRIGGER IF EXISTS trg_notify_pros_new_order ON public.orders;
CREATE TRIGGER trg_notify_pros_new_order
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_pros_new_order();

-- Trigger 3: Auto-verificar pro quando docs são aprovados
DROP TRIGGER IF EXISTS trg_check_pro_verification ON public.pro_documents;
CREATE TRIGGER trg_check_pro_verification
  AFTER UPDATE ON public.pro_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.check_pro_verification();

-- Trigger 4: Criar notificação quando status do pedido muda
DROP TRIGGER IF EXISTS trg_create_order_notification ON public.orders;
CREATE TRIGGER trg_create_order_notification
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_order_notification();

-- Trigger 5: Atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trg_update_orders_updated_at ON public.orders;
CREATE TRIGGER trg_update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_pro_profiles_updated_at ON public.pro_profiles;
CREATE TRIGGER trg_update_pro_profiles_updated_at
  BEFORE UPDATE ON public.pro_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger 6: Encriptar dados de saque automaticamente
DROP TRIGGER IF EXISTS trg_encrypt_withdrawal ON public.withdrawals;
CREATE TRIGGER trg_encrypt_withdrawal
  BEFORE INSERT OR UPDATE ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_withdrawal_data();
