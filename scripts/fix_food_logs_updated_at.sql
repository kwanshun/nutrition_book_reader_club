-- ================================================
-- Add missing updated_at column to food_logs table
-- ================================================

-- Add updated_at column to food_logs table
ALTER TABLE food_logs 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'food_logs' 
AND column_name = 'updated_at';
