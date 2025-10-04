-- ================================================
-- Add day_number column to text_shares table
-- ================================================
-- This script adds the day_number column to support day-specific sharing

-- Add day_number column
ALTER TABLE text_shares 
ADD COLUMN IF NOT EXISTS day_number INTEGER CHECK (day_number BETWEEN 1 AND 21);

-- Drop the old unique constraint
DROP INDEX IF EXISTS idx_one_share_per_day;

-- Create new unique constraint for one share per user per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_share_per_user_per_day 
ON text_shares(user_id, day_number);

-- Add index for efficient day-based queries
CREATE INDEX IF NOT EXISTS idx_text_shares_day_number 
ON text_shares(day_number);

-- Add index for efficient user-day queries
CREATE INDEX IF NOT EXISTS idx_text_shares_user_day 
ON text_shares(user_id, day_number);

-- Update existing records to have a default day_number (for backward compatibility)
-- You can modify this based on your needs
UPDATE text_shares 
SET day_number = 1 
WHERE day_number IS NULL;

-- Make day_number NOT NULL after setting defaults
ALTER TABLE text_shares 
ALTER COLUMN day_number SET NOT NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'text_shares' 
ORDER BY ordinal_position;
