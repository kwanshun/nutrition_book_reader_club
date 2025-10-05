-- ================================================
-- Add Foreign Key Constraints for User Profiles
-- ================================================
-- These constraints are necessary for Supabase's PostgREST to automatically
-- join 'text_shares' and 'food_logs' with 'user_profiles' (aliased as 'profiles')
-- when using the `select('profiles(display_name)')` syntax.

-- Add foreign key to text_shares table
ALTER TABLE text_shares
ADD CONSTRAINT fk_text_shares_user_id
FOREIGN KEY (user_id)
REFERENCES user_profiles(user_id)
ON DELETE CASCADE;

-- Add foreign key to food_logs table
ALTER TABLE food_logs
ADD CONSTRAINT fk_food_logs_user_id
FOREIGN KEY (user_id)
REFERENCES user_profiles(user_id)
ON DELETE CASCADE;

-- Verify the foreign keys were added
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.text_shares'::regclass
   OR conrelid = 'public.food_logs'::regclass
ORDER BY table_name, constraint_name;
