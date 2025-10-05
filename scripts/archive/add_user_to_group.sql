-- ================================================
-- Add Current User to Test Group
-- ================================================
-- This script adds your user (info@andywong.me) to the test group

-- Step 1: Find your user ID
-- Run this first to confirm your user ID
SELECT id, email FROM auth.users WHERE email = 'info@andywong.me';

-- Step 2: Add you to the test group (測試群組)
-- Run this to join the group
INSERT INTO group_members (group_id, user_id, role, joined_at)
SELECT 
  g.id as group_id,
  u.id as user_id,
  'member' as role,
  NOW() as joined_at
FROM 
  groups g,
  auth.users u
WHERE 
  g.name = '測試群組'
  AND u.email = 'info@andywong.me'
ON CONFLICT (group_id, user_id) DO NOTHING
RETURNING *;

-- Step 3: Verify membership
-- Run this to confirm you've been added
SELECT 
  gm.user_id,
  u.email,
  gm.group_id,
  g.name as group_name,
  gm.role,
  gm.joined_at
FROM 
  group_members gm
  JOIN groups g ON g.id = gm.group_id
  JOIN auth.users u ON u.id = gm.user_id
WHERE 
  u.email = 'info@andywong.me';

