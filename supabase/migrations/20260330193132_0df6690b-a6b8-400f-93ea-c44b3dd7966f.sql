
CREATE OR REPLACE FUNCTION public.calculate_pro_available_balance(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rated_earnings numeric;
  active_withdrawals numeric;
  available numeric;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));

  -- ONLY 'rated' orders = available for withdrawal (80% commission)
  SELECT COALESCE(SUM(total_price * 0.8), 0)
  INTO rated_earnings
  FROM public.orders
  WHERE pro_id = p_user_id AND status = 'rated';

  -- Deduct pending + processing withdrawals (completed withdrawals already consumed the balance)
  SELECT COALESCE(SUM(amount), 0)
  INTO active_withdrawals
  FROM public.withdrawals
  WHERE user_id = p_user_id AND status IN ('pending', 'processing');

  available := GREATEST(0, rated_earnings - active_withdrawals);
  RETURN available;
END;
$$;
