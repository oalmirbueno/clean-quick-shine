-- A2a: saque só pode ser criado pela edge function (service role), nunca por
-- INSERT direto do cliente. A edge function usa service role e não é afetada
-- por esta remoção. Fecha a possibilidade de injeção de saque fake.

DROP POLICY IF EXISTS "Users can create withdrawals" ON public.withdrawals;
