-- Decisões da reunião de 14/11/2026 (Almir autorizou no chat).
-- Só atualiza; nada é apagado. Pode rodar de novo sem efeito colateral.

-- 1) Preços combinados: diária completa R$ 350, emergência R$ 250.
UPDATE public.services SET base_price = 350 WHERE name = 'Dia Todo' AND base_price <> 350;
UPDATE public.services SET base_price = 250 WHERE name = 'Limpeza de Emergência' AND base_price <> 250;

-- 2) Atendimento só em Brusque: desliga as praças de demonstração.
UPDATE public.zones z SET active = false
FROM public.cities c
WHERE c.id = z.city_id AND c.name IN ('Curitiba', 'São Paulo') AND z.active;

UPDATE public.cities SET active = false WHERE name IN ('Curitiba', 'São Paulo') AND active;

-- 3) Pedido de teste preso em "a caminho" desde 01/06/2026 (Curitiba, sem pagamento).
UPDATE public.orders o SET status = 'cancelled', updated_at = now()
WHERE o.status = 'en_route'
  AND o.created_at < '2026-07-01'
  AND NOT EXISTS (SELECT 1 FROM public.payments p WHERE p.order_id = o.id);

-- 4) Pós-Obra desligado por enquanto (Almir, 14/11/2026).
UPDATE public.services SET active = false WHERE name = 'Pós-Obra' AND active;

-- 5) Meio Período sobe de R$ 180 para R$ 200 (Almir, 14/11/2026).
UPDATE public.services SET base_price = 200 WHERE name = 'Meio Período' AND base_price <> 200;
