-- ================================================
-- Fix RLS policies for share_comments and share_reactions
-- ================================================

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view all comments" ON share_comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON share_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON share_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON share_comments;

DROP POLICY IF EXISTS "Users can view all reactions" ON share_reactions;
DROP POLICY IF EXISTS "Users can insert their own reactions" ON share_reactions;
DROP POLICY IF EXISTS "Users can update their own reactions" ON share_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON share_reactions;

-- Recreate RLS policies for share_comments
CREATE POLICY "Users can view all comments" ON share_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" ON share_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON share_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON share_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Recreate RLS policies for share_reactions
CREATE POLICY "Users can view all reactions" ON share_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reactions" ON share_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" ON share_reactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON share_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('share_comments', 'share_reactions')
ORDER BY tablename, policyname;
