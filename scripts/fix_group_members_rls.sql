-- ================================================
-- Fix RLS Policies for group_members Table
-- ================================================
-- The group_members table had RLS enabled but NO policies,
-- which means users couldn't query their own memberships!

-- Drop existing policies if they exist (just in case)
DROP POLICY IF EXISTS "Users can view their group memberships" ON group_members;
DROP POLICY IF EXISTS "Users can insert their group memberships" ON group_members;

-- Create policies for group_members
-- Users can view their own group memberships
CREATE POLICY "Users can view their group memberships" ON group_members
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Users can insert their own group memberships (for join functionality)
CREATE POLICY "Users can insert their group memberships" ON group_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'group_members';

