
-- Fix: Restrict notification_dispatch_logs INSERT to service_role only
DROP POLICY IF EXISTS "Service role can insert dispatch logs" ON public.notification_dispatch_logs;
CREATE POLICY "Service role can insert dispatch logs"
ON public.notification_dispatch_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Fix: Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated/PUBLIC
-- Trigger-only and internal helpers: revoke from everyone (triggers run as table owner)
REVOKE EXECUTE ON FUNCTION public.auto_assign_zone() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.encrypt_withdrawal_data() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_pros_new_order() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_order_notification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_pro_verification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_chat_message() FROM PUBLIC, anon, authenticated;

-- Internal encryption helpers: never callable from clients
REVOKE EXECUTE ON FUNCTION public.encrypt_field(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrypt_field(text) FROM PUBLIC, anon, authenticated;

-- Internal zone helper (used by trigger only)
REVOKE EXECUTE ON FUNCTION public.find_nearest_zone(double precision, double precision) FROM PUBLIC, anon, authenticated;

-- Geometry helper (immutable, no security risk but not needed by clients)
REVOKE EXECUTE ON FUNCTION public.haversine_km(double precision, double precision, double precision, double precision) FROM PUBLIC, anon, authenticated;

-- RLS helpers: executed inside policies under definer privileges; no need for client EXECUTE
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;

-- Balance calc: only called from edge functions with service role
REVOKE EXECUTE ON FUNCTION public.calculate_pro_available_balance(uuid) FROM PUBLIC, anon, authenticated;

-- Client-callable RPCs: restrict to authenticated only (remove anon)
REVOKE EXECUTE ON FUNCTION public.get_users_emails(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_users_emails(uuid[]) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.find_matching_pros(double precision, double precision, uuid, double precision, integer, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_matching_pros(double precision, double precision, uuid, double precision, integer, uuid) TO authenticated;
