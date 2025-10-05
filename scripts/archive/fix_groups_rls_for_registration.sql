-- ================================================
-- Fix RLS Policies for Groups Table
-- ================================================
-- Allow users to search for groups by invite code during registration
-- This is needed for the auto-join feature to work

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their groups" ON groups;

-- Create new policies:
-- 1. Users can view their own groups (existing functionality)
-- 2. Anyone can search groups by invite_code (for registration)

CREATE POLICY "Users can view their groups" ON groups
  FOR SELECT USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can search groups by invite code" ON groups
  FOR SELECT USING (
    -- Allow searching for groups by invite_code when user is authenticated
    auth.uid() IS NOT NULL
  );

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'groups';

