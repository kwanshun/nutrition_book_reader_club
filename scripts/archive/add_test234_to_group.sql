-- Add test234@andywong.me to the test group
-- First, find the user ID for test234@andywong.me
-- Then add them to the test group

-- Step 1: Find the user ID
SELECT id, email FROM auth.users WHERE email = 'test234@andywong.me';

-- Step 2: Add user to the test group (replace with the actual user_id from Step 1)
-- Copy the id from Step 1 result and use it below

-- Option A: If you know the user_id, use this:
-- INSERT INTO group_members (group_id, user_id, role, joined_at)
-- SELECT 
--   g.id as group_id,
--   'PASTE_USER_ID_HERE' as user_id,
--   'member' as role,
--   NOW() as joined_at
-- FROM 
--   groups g
-- WHERE 
--   g.name = '測試群組'
-- ON CONFLICT (group_id, user_id) DO NOTHING
-- RETURNING *;

-- Option B: Add directly by email (easier!)
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
  AND u.email = 'test234@andywong.me'
ON CONFLICT (group_id, user_id) DO NOTHING
RETURNING *;

-- Step 3: Verify the user was added
SELECT 
  gm.user_id,
  gm.group_id,
  g.name as group_name,
  u.email,
  gm.role,
  gm.joined_at
FROM 
  group_members gm
  JOIN groups g ON g.id = gm.group_id
  JOIN auth.users u ON u.id = gm.user_id
WHERE 
  u.email = 'test234@andywong.me';

