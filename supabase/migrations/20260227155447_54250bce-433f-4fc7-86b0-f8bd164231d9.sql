-- Allow authenticated users to view verified & available pro profiles (needed for matching)
CREATE POLICY "Authenticated users can view available pros"
ON public.pro_profiles
FOR SELECT
TO authenticated
USING (verified = true AND available_now = true);

-- Allow authenticated users to view basic profile info (name, avatar) for matching
CREATE POLICY "Authenticated users can view profiles for matching"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);