-- Tightening (Checkpoint 3, ETAPA FINAL): remove a exposição da linha inteira
-- de orders (inclui notes e client_id) a diaristas verificadas antes do aceite.
--
-- ORDEM OBRIGATÓRIA (aplicar via MCP):
--   1. criar a view available_orders_safe (migration 20260703010000);
--   2. dar deploy do frontend que consome a view (mural);
--   3. SÓ ENTÃO rodar este DROP.
-- Rodar antes do passo 2 deixa o mural (que ainda lê orders direto) vazio.
--
-- O aceite continua funcionando: após o UPDATE, pro_id = a própria diarista,
-- e a policy "Pros can view assigned orders" cobre o RETURNING do .select().

DROP POLICY IF EXISTS "Pros can view available orders" ON public.orders;
