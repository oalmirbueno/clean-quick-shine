-- 1. Remove overly broad profiles SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view profiles for matching" ON public.profiles;

-- 2. Restrict role self-assignment: users may only insert the 'client' role for themselves
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;

CREATE POLICY "Users can insert their own client role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'client'::public.app_role
);

-- Allow pros and companies to register themselves at signup as well, but never admin
CREATE POLICY "Users can self-assign non-admin roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role IN ('client'::public.app_role, 'pro'::public.app_role, 'company'::public.app_role)
);

-- Drop the duplicate narrower policy now that the broader non-admin one exists
DROP POLICY IF EXISTS "Users can insert their own client role" ON public.user_roles;