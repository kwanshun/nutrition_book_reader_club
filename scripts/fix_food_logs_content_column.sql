-- ================================================
-- Add missing content column to food_logs table
-- ================================================

-- Add content column to food_logs table
ALTER TABLE food_logs 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Update existing records with a default content if needed
UPDATE food_logs 
SET content = COALESCE(food_name, '食物記錄')
WHERE content IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'food_logs' 
AND column_name = 'content';
