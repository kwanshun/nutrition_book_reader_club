-- ================================================
-- Add INSERT Policy for group_members
-- ================================================
-- Allow service_role (admin) to insert new group members
-- This is needed for the auto-join during registration

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Service role can insert group members" ON group_members;

-- Create insert policy for service role
-- Note: This uses authenticated() check but the service_role bypasses RLS anyway
-- We need this for the regular user flow as well
CREATE POLICY "Service role can insert group members" ON group_members
  FOR INSERT WITH CHECK (
    -- Allow if the user is inserting their own membership
    user_id = auth.uid()
  );

-- Verify policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'group_members'
ORDER BY cmd, policyname;

