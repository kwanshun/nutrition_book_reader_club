-- Add food_name column to food_logs table if it doesn't exist
ALTER TABLE food_logs
ADD COLUMN IF NOT EXISTS food_name TEXT;
