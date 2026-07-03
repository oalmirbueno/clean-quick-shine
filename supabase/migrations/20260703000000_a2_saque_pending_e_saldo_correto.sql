-- A2/D1 — Saque com aprovação admin + correção do saldo disponível.
-- Não-destrutivo: adiciona coluna, substitui função de saldo e cria RPCs
-- internas. Nenhuma linha é apagada.

-- 1) Persistir o tipo da chave PIX (antes era recebido e descartado; sem ele
--    a transferência na aprovação não sabe o pixAddressKeyType do Asaas).
ALTER TABLE public.withdrawals
  ADD COLUMN IF NOT EXISTS pix_key_type text;

-- 2) BUG DE SALDO (crítico): a versão atual desconta apenas saques
--    pending/processing. Quando o saque vira completed o desconto some e o
--    saldo REGENERA (pedidos rated continuam contando) — permitindo sacar o
--    mesmo valor de novo. Como nada no sistema marca pedidos como paid_out,
--    o correto é descontar também os saques completed.
CREATE OR REPLACE FUNCTION public.calculate_pro_available_balance(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rated_earnings numeric;
  consumed_withdrawals numeric;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));

  -- Somente pedidos 'rated' liberam saldo (80% de comissão)
  SELECT COALESCE(SUM(total_price * 0.8), 0)
  INTO rated_earnings
  FROM public.orders
  WHERE pro_id = p_user_id AND status = 'rated';

  -- Desconta saques ativos E já pagos (completed): pedidos rated nunca são
  -- rebaixados para paid_out, então o completed precisa continuar descontando.
  SELECT COALESCE(SUM(amount), 0)
  INTO consumed_withdrawals
  FROM public.withdrawals
  WHERE user_id = p_user_id AND status IN ('pending', 'processing', 'completed');

  RETURN GREATEST(0, rated_earnings - consumed_withdrawals);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.calculate_pro_available_balance(uuid) FROM PUBLIC, anon, authenticated;

-- 3) RPC interna: registra a solicitação de saque de forma atômica
--    (saldo + insert sob o mesmo advisory lock) e cifra a chave PIX.
--    A coluna pix_key foi removida e o trigger de cifra é no-op, então a
--    cifra acontece AQUI, explicitamente, via encrypt_field.
CREATE OR REPLACE FUNCTION public.store_withdrawal_request(
  p_user_id uuid,
  p_amount numeric,
  p_pix_key text,
  p_pix_key_type text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_available numeric;
  v_id uuid;
BEGIN
  IF p_amount IS NULL OR p_amount < 10 OR p_amount > 50000 THEN
    RAISE EXCEPTION 'Valor de saque inválido';
  END IF;
  IF p_pix_key IS NULL OR length(trim(p_pix_key)) = 0 THEN
    RAISE EXCEPTION 'Chave Pix é obrigatória';
  END IF;
  IF p_pix_key_type NOT IN ('cpf','email','phone','random') THEN
    RAISE EXCEPTION 'Tipo de chave Pix inválido';
  END IF;

  -- Mantém o advisory lock da função de saldo na MESMA transação do INSERT:
  -- impede corrida de dois saques simultâneos do mesmo usuário.
  v_available := public.calculate_pro_available_balance(p_user_id);
  IF p_amount > v_available THEN
    RAISE EXCEPTION 'Saldo insuficiente. Disponível: R$ %', to_char(v_available, 'FM999990.00');
  END IF;

  INSERT INTO public.withdrawals (user_id, amount, method, status, encrypted_pix_key, pix_key_type)
  VALUES (p_user_id, p_amount, 'pix', 'pending', public.encrypt_field(p_pix_key), p_pix_key_type)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.store_withdrawal_request(uuid, numeric, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.store_withdrawal_request(uuid, numeric, text, text) TO service_role;

-- 4) RPC interna: decifra a chave PIX de um saque para a aprovação admin
--    (chamada apenas pela edge function approve-withdrawal com service role).
CREATE OR REPLACE FUNCTION public.admin_get_withdrawal_pix_key(p_withdrawal_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_enc text;
BEGIN
  SELECT encrypted_pix_key INTO v_enc
  FROM public.withdrawals WHERE id = p_withdrawal_id;
  IF v_enc IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN public.decrypt_field(v_enc);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_get_withdrawal_pix_key(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_withdrawal_pix_key(uuid) TO service_role;

-- Garante que a RPC de saque consegue chamar o cálculo de saldo via service role
GRANT EXECUTE ON FUNCTION public.calculate_pro_available_balance(uuid) TO service_role;
