
CREATE OR REPLACE FUNCTION public.check_pro_verification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  required_count INTEGER;
  approved_count INTEGER;
BEGIN
  IF NEW.status = 'approved' THEN
    -- Count required document types (updated: id_front, id_back, selfie)
    SELECT COUNT(*) INTO required_count
    FROM (VALUES ('id_front'), ('id_back'), ('selfie')) AS required(doc_type);

    -- Count how many required docs are approved for this user
    SELECT COUNT(DISTINCT doc_type) INTO approved_count
    FROM public.pro_documents
    WHERE user_id = NEW.user_id
    AND doc_type IN ('id_front', 'id_back', 'selfie')
    AND status = 'approved';

    -- If all required docs approved, mark pro as verified
    IF approved_count >= required_count THEN
      UPDATE public.pro_profiles SET verified = true, status = 'active', updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  -- If rejected, un-verify the pro
  IF NEW.status = 'rejected' THEN
    UPDATE public.pro_profiles SET verified = false, updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$function$;
