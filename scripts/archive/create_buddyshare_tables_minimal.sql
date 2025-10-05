-- Create share_comments table
CREATE TABLE share_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id UUID NOT NULL,
    share_type VARCHAR(20) NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create share_reactions table
CREATE TABLE share_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id UUID NOT NULL,
    share_type VARCHAR(20) NOT NULL,
    user_id UUID NOT NULL,
    reaction_type VARCHAR(20) NOT NULL DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints
ALTER TABLE share_comments ADD CONSTRAINT check_share_type_comments 
    CHECK (share_type IN ('text_share', 'food_log'));

ALTER TABLE share_reactions ADD CONSTRAINT check_share_type_reactions 
    CHECK (share_type IN ('text_share', 'food_log'));

ALTER TABLE share_reactions ADD CONSTRAINT check_reaction_type 
    CHECK (reaction_type = 'like');

-- Add unique constraint for reactions
ALTER TABLE share_reactions ADD CONSTRAINT unique_user_reaction 
    UNIQUE (share_id, share_type, user_id, reaction_type);

-- Enable RLS
ALTER TABLE share_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "view_comments" ON share_comments FOR SELECT USING (true);
CREATE POLICY "insert_comments" ON share_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_comments" ON share_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_comments" ON share_comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "view_reactions" ON share_reactions FOR SELECT USING (true);
CREATE POLICY "insert_reactions" ON share_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_reactions" ON share_reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_reactions" ON share_reactions FOR DELETE USING (auth.uid() = user_id);
