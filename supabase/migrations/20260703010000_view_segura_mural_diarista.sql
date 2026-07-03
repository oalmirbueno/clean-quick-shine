-- View segura do mural da diarista.
-- Expõe SOMENTE dados não-sensíveis de pedidos disponíveis (pro_id nulo,
-- scheduled/matching), permitindo à diarista ver bairro/cidade/zona sem
-- acesso ao endereço completo (rua, número, complemento, CEP, geo) nem a
-- client_id/notes antes de aceitar.
--
-- Segurança: a view roda com privilégios do owner (não security_invoker),
-- então lê addresses ignorando a RLS que bloquearia a diarista — MAS só
-- retorna linhas se o chamador for uma diarista VERIFICADA (checagem no
-- próprio WHERE). security_barrier evita vazamento por pushdown de predicado.

CREATE OR REPLACE VIEW public.available_orders_safe
WITH (security_barrier = true) AS
SELECT
  o.id,
  o.service_id,
  o.scheduled_date,
  o.scheduled_time,
  o.duration_hours,
  o.total_price,
  o.status,
  o.created_at,
  o.zone_fee,
  o.surge_multiplier,
  a.city,
  a.neighborhood,
  a.state,
  a.zone_id
FROM public.orders o
LEFT JOIN public.addresses a ON a.id = o.address_id
WHERE o.pro_id IS NULL
  AND o.status IN ('scheduled', 'matching')
  AND public.has_role(auth.uid(), 'pro')
  AND EXISTS (
    SELECT 1 FROM public.pro_profiles pp
    WHERE pp.user_id = auth.uid() AND pp.verified = true
  );

REVOKE ALL ON public.available_orders_safe FROM anon;
GRANT SELECT ON public.available_orders_safe TO authenticated;
