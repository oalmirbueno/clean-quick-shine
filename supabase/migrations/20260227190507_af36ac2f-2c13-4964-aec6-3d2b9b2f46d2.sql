
-- Trigger function to auto-verify pro when all required docs are approved
CREATE OR REPLACE FUNCTION public.check_pro_verification()
RETURNS TRIGGER AS $$
DECLARE
  required_count INTEGER;
  approved_count INTEGER;
BEGIN
  IF NEW.status = 'approved' THEN
    -- Count required document types
    SELECT COUNT(*) INTO required_count
    FROM (VALUES ('cpf'), ('rg'), ('selfie')) AS required(doc_type);

    -- Count how many required docs are approved for this user
    SELECT COUNT(DISTINCT doc_type) INTO approved_count
    FROM public.pro_documents
    WHERE user_id = NEW.user_id
    AND doc_type IN ('cpf', 'rg', 'selfie')
    AND status = 'approved';

    -- If all required docs approved, mark pro as verified
    IF approved_count >= required_count THEN
      UPDATE public.pro_profiles SET verified = true, updated_at = now()
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_check_pro_verification ON public.pro_documents;
CREATE TRIGGER trg_check_pro_verification
  AFTER UPDATE ON public.pro_documents
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.check_pro_verification();

-- Also fire on INSERT (when a new approved doc is inserted directly)
DROP TRIGGER IF EXISTS trg_check_pro_verification_insert ON public.pro_documents;
CREATE TRIGGER trg_check_pro_verification_insert
  AFTER INSERT ON public.pro_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.check_pro_verification();

-- Add storage policy for admin access if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all pro docs' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Admins can view all pro docs" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'pro-documents' AND
      public.is_admin(auth.uid())
    );
  END IF;
END $$;
