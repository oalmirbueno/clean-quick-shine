
ALTER VIEW public.available_orders_safe SET (security_invoker = on);
ALTER VIEW public.withdrawals_secure SET (security_invoker = on);

REVOKE EXECUTE ON FUNCTION public.force_pending_payment() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.validate_order_change() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
