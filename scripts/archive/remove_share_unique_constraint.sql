-- ================================================
-- Remove unique constraint to allow share editing
-- ================================================
-- This script removes the unique constraint that prevents users from editing their shares

-- Drop the unique constraint that prevents editing
DROP INDEX IF EXISTS idx_one_share_per_user_per_day;

-- Keep the performance indexes for efficient queries
-- (These remain for performance optimization)
-- idx_text_shares_day_number - for day-based queries
-- idx_text_shares_user_day - for user-day queries

-- Verify the constraint was removed
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'text_shares' 
AND indexname = 'idx_one_share_per_user_per_day';

-- Show remaining indexes for text_shares table
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'text_shares'
ORDER BY indexname;
