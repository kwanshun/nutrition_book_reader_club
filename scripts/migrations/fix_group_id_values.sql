-- Migration: Fix group_id values in text_shares and food_logs
-- Issue: group_id contains user_id values or NULL instead of actual group_id
-- Solution: Update group_id based on user's group membership

-- ==================================================
-- 1. ANALYZE CURRENT STATE
-- ==================================================

-- Check text_shares with incorrect group_id
SELECT 'TEXT_SHARES - Current State:' as info;
SELECT 
  id,
  user_id,
  group_id,
  CASE 
    WHEN group_id IS NULL THEN 'NULL'
    WHEN group_id = user_id THEN 'WRONG (= user_id)'
    ELSE 'OK?'
  END as status,
  created_at
FROM text_shares
ORDER BY created_at DESC
LIMIT 10;

-- Check food_logs with incorrect group_id
SELECT 'FOOD_LOGS - Current State:' as info;
SELECT 
  id,
  user_id,
  group_id,
  CASE 
    WHEN group_id IS NULL THEN 'NULL'
    WHEN group_id = user_id THEN 'WRONG (= user_id)'
    ELSE 'OK?'
  END as status,
  created_at
FROM food_logs
ORDER BY created_at DESC
LIMIT 10;

-- ==================================================
-- 2. FIX TEXT_SHARES GROUP_ID
-- ==================================================

-- Update text_shares: set group_id to user's actual group_id from group_members
UPDATE text_shares
SET group_id = gm.group_id
FROM group_members gm
WHERE text_shares.user_id = gm.user_id
  AND (text_shares.group_id IS NULL OR text_shares.group_id = text_shares.user_id);

-- ==================================================
-- 3. FIX FOOD_LOGS GROUP_ID
-- ==================================================

-- Update food_logs: set group_id to user's actual group_id from group_members
UPDATE food_logs
SET group_id = gm.group_id
FROM group_members gm
WHERE food_logs.user_id = gm.user_id
  AND (food_logs.group_id IS NULL OR food_logs.group_id = food_logs.user_id);

-- ==================================================
-- 4. VERIFY FIXES
-- ==================================================

-- Verify text_shares after fix
SELECT 'TEXT_SHARES - After Fix:' as info;
SELECT 
  ts.id,
  ts.user_id,
  ts.group_id,
  g.name as group_name,
  CASE 
    WHEN ts.group_id IS NULL THEN 'STILL NULL'
    WHEN ts.group_id = ts.user_id THEN 'STILL WRONG'
    WHEN ts.group_id = gm.group_id THEN 'FIXED ✓'
    ELSE 'UNKNOWN'
  END as status
FROM text_shares ts
LEFT JOIN group_members gm ON ts.user_id = gm.user_id
LEFT JOIN groups g ON ts.group_id = g.id
ORDER BY ts.created_at DESC
LIMIT 10;

-- Verify food_logs after fix
SELECT 'FOOD_LOGS - After Fix:' as info;
SELECT 
  fl.id,
  fl.user_id,
  fl.group_id,
  g.name as group_name,
  CASE 
    WHEN fl.group_id IS NULL THEN 'STILL NULL'
    WHEN fl.group_id = fl.user_id THEN 'STILL WRONG'
    WHEN fl.group_id = gm.group_id THEN 'FIXED ✓'
    ELSE 'UNKNOWN'
  END as status
FROM food_logs fl
LEFT JOIN group_members gm ON fl.user_id = gm.user_id
LEFT JOIN groups g ON fl.group_id = g.id
ORDER BY fl.created_at DESC
LIMIT 10;

-- ==================================================
-- 5. CHECK FOR ORPHANED RECORDS
-- ==================================================

-- Find text_shares where user is not in any group
SELECT 'TEXT_SHARES - Orphaned (user not in group):' as info;
SELECT ts.*
FROM text_shares ts
LEFT JOIN group_members gm ON ts.user_id = gm.user_id
WHERE gm.user_id IS NULL;

-- Find food_logs where user is not in any group
SELECT 'FOOD_LOGS - Orphaned (user not in group):' as info;
SELECT fl.*
FROM food_logs fl
LEFT JOIN group_members gm ON fl.user_id = gm.user_id
WHERE gm.user_id IS NULL;

-- ==================================================
-- 6. SUMMARY
-- ==================================================

SELECT 'SUMMARY:' as info;
SELECT 
  'text_shares' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN group_id IS NOT NULL THEN 1 END) as with_group_id,
  COUNT(CASE WHEN group_id IS NULL THEN 1 END) as null_group_id
FROM text_shares

UNION ALL

SELECT 
  'food_logs' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN group_id IS NOT NULL THEN 1 END) as with_group_id,
  COUNT(CASE WHEN group_id IS NULL THEN 1 END) as null_group_id
FROM food_logs;

