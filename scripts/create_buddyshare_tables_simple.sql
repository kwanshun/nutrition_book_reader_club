-- ================================================
-- Create BuddyShare tables for comments and reactions (Simplified)
-- ================================================

-- Create share_comments table
CREATE TABLE IF NOT EXISTS share_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL,
  share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('text_share', 'food_log')),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create share_reactions table
CREATE TABLE IF NOT EXISTS share_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL,
  share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('text_share', 'food_log')),
  user_id UUID NOT NULL,
  reaction_type VARCHAR(20) NOT NULL DEFAULT 'like' CHECK (reaction_type = 'like'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(share_id, share_type, user_id, reaction_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_share_comments_share_id ON share_comments(share_id, share_type);
CREATE INDEX IF NOT EXISTS idx_share_comments_user_id ON share_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_share_comments_created_at ON share_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_share_reactions_share_id ON share_reactions(share_id, share_type);
CREATE INDEX IF NOT EXISTS idx_share_reactions_user_id ON share_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_share_reactions_created_at ON share_reactions(created_at);

-- Enable RLS
ALTER TABLE share_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for share_comments
CREATE POLICY "Users can view all comments" ON share_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own comments" ON share_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON share_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON share_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for share_reactions
CREATE POLICY "Users can view all reactions" ON share_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reactions" ON share_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" ON share_reactions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON share_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for share_comments
CREATE TRIGGER update_share_comments_updated_at
  BEFORE UPDATE ON share_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('share_comments', 'share_reactions')
ORDER BY table_name, ordinal_position;
