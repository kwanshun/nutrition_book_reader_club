-- ================================================
-- Add foreign key relationship between share_comments and profiles
-- ================================================

-- Drop existing foreign key constraints if they exist (to avoid errors)
ALTER TABLE share_comments 
DROP CONSTRAINT IF EXISTS fk_share_comments_user_id;

ALTER TABLE share_reactions 
DROP CONSTRAINT IF EXISTS fk_share_reactions_user_id;

-- Add foreign key constraint between share_comments.user_id and profiles.user_id
ALTER TABLE share_comments 
ADD CONSTRAINT fk_share_comments_user_id 
FOREIGN KEY (user_id) 
REFERENCES profiles(user_id) 
ON DELETE CASCADE;

-- Add foreign key constraint between share_reactions.user_id and profiles.user_id
ALTER TABLE share_reactions 
ADD CONSTRAINT fk_share_reactions_user_id 
FOREIGN KEY (user_id) 
REFERENCES profiles(user_id) 
ON DELETE CASCADE;

-- Verify the foreign keys were added
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid IN ('public.share_comments'::regclass, 'public.share_reactions'::regclass)
AND contype = 'f'
ORDER BY table_name, constraint_name;
