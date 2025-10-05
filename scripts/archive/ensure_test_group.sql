-- ================================================
-- Ensure Test Group Exists with Invite Code
-- ================================================
-- This script ensures the test group exists for auto-registration

-- Check if the test group exists
SELECT * FROM groups WHERE invite_code = 'TEST001';

-- Create the test group if it doesn't exist
INSERT INTO groups (id, name, description, invite_code)
VALUES (
  gen_random_uuid(),
  '測試群組',
  '這是一個用於測試聊天功能的群組',
  'TEST001'
)
ON CONFLICT (invite_code) DO NOTHING
RETURNING *;

-- Verify the group was created
SELECT id, name, invite_code, created_at FROM groups WHERE invite_code = 'TEST001';

