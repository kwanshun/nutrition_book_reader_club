-- ================================================
-- Create Test Group for Chat Testing
-- ================================================
-- Run this in Supabase SQL Editor to create a test group
-- Replace YOUR_USER_ID with your actual user ID from auth.users

-- First, find your user ID by running:
-- SELECT id, email FROM auth.users;

-- Then run this script with your user ID:

-- Create a test group
INSERT INTO groups (id, name, description, invite_code)
VALUES (
  gen_random_uuid(),
  '測試群組',
  '這是一個用於測試聊天功能的群組',
  'TEST001'
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Add yourself to the group (replace YOUR_USER_ID)
-- Example:
-- INSERT INTO group_members (group_id, user_id, role)
-- SELECT id, 'YOUR_USER_ID', 'leader'
-- FROM groups
-- WHERE name = '測試群組'
-- ON CONFLICT DO NOTHING;

-- Quick way to add all existing users to test group:
INSERT INTO group_members (group_id, user_id, role)
SELECT 
  (SELECT id FROM groups WHERE name = '測試群組' LIMIT 1),
  id,
  'member'
FROM auth.users
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 
  g.name as group_name,
  u.email as user_email,
  gm.role
FROM group_members gm
JOIN groups g ON g.id = gm.group_id
JOIN auth.users u ON u.id = gm.user_id
WHERE g.name = '測試群組';

-- ================================================
-- SUCCESS! Test group created and users added.
-- Now you can test the chat feature at /chat
-- ================================================

