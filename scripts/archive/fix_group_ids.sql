-- Fix text_shares group_id values
-- The issue is that text_shares have user_id as group_id instead of actual group_id

-- First, let's see the current state
SELECT 'Current text_shares with wrong group_id:' as info;
SELECT id, user_id, group_id, content, created_at 
FROM text_shares 
ORDER BY created_at DESC;

-- Get the actual group_id that users belong to
SELECT 'Users and their actual group:' as info;
SELECT 
    u.id as user_id,
    u.email,
    gm.group_id as actual_group_id
FROM auth.users u
JOIN group_members gm ON u.id = gm.user_id
WHERE u.email IN ('info@andywong.me', 'test55@andywong.me');

-- Fix the group_id for all text_shares
-- Update shares to use the correct group_id from group_members table
UPDATE text_shares 
SET group_id = gm.group_id
FROM group_members gm
WHERE text_shares.user_id = gm.user_id;

-- Verify the fix
SELECT 'After fix - text_shares with correct group_id:' as info;
SELECT id, user_id, group_id, content, created_at 
FROM text_shares 
ORDER BY created_at DESC;

-- Check if shares are now visible for the group
SELECT 'Shares visible for group 9c807498-a3c0-45f3-9421-dac642849aff:' as info;
SELECT COUNT(*) as share_count
FROM text_shares 
WHERE group_id = '9c807498-a3c0-45f3-9421-dac642849aff';
