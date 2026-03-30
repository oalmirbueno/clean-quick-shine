
-- Atomic balance calculation function using advisory lock to prevent race conditions
CREATE OR REPLACE FUNCTION public.calculate_pro_available_balance(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rated_earnings numeric;
  paid_out_earnings numeric;
  active_withdrawals numeric;
  available numeric;
BEGIN
  -- Advisory lock on user_id to serialize concurrent withdrawal requests
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));

  -- Only 'rated' orders count as available (80% commission)
  SELECT COALESCE(SUM(total_price * 0.8), 0)
  INTO rated_earnings
  FROM public.orders
  WHERE pro_id = p_user_id AND status = 'rated';

  -- 'paid_out' already withdrawn via order lifecycle
  SELECT COALESCE(SUM(total_price * 0.8), 0)
  INTO paid_out_earnings
  FROM public.orders
  WHERE pro_id = p_user_id AND status = 'paid_out';

  -- Deduct pending + processing + completed withdrawals
  SELECT COALESCE(SUM(amount), 0)
  INTO active_withdrawals
  FROM public.withdrawals
  WHERE user_id = p_user_id AND status IN ('pending', 'processing', 'completed');

  available := GREATEST(0, rated_earnings + paid_out_earnings - active_withdrawals);
  RETURN available;
END;
$$;
