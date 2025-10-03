-- ================================================
-- Nutrition Book Reader Club - Database Schema
-- ================================================
-- Run this in Supabase SQL Editor before running the Python scripts
-- Go to: Supabase Dashboard > SQL Editor > New Query
-- Paste this entire file and click "Run"

-- Groups
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  invite_code VARCHAR(10) UNIQUE,
  leader_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Group Members
CREATE TABLE IF NOT EXISTS group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Daily Content (21 days)
CREATE TABLE IF NOT EXISTS daily_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INTEGER UNIQUE CHECK (day_number BETWEEN 1 AND 21),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quizzes (pre-generated)
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INTEGER UNIQUE CHECK (day_number BETWEEN 1 AND 21),
  questions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz Responses
CREATE TABLE IF NOT EXISTS quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_index INTEGER,
  answer TEXT,
  is_correct BOOLEAN,
  answered_at TIMESTAMP DEFAULT NOW()
);

-- Text Shares (once daily)
CREATE TABLE IF NOT EXISTS text_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enforce once-daily sharing
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_share_per_day 
ON text_shares(user_id, group_id, DATE(created_at));

-- Food Logs
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  image_url TEXT,
  detected_foods JSONB,
  user_input TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see data from groups they belong to
-- Note: Drop existing policies first to avoid conflicts

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their groups" ON groups;
DROP POLICY IF EXISTS "Group members can read messages" ON chat_messages;
DROP POLICY IF EXISTS "Group members can insert messages" ON chat_messages;
DROP POLICY IF EXISTS "Group members can read shares" ON text_shares;
DROP POLICY IF EXISTS "Users can insert their shares" ON text_shares;
DROP POLICY IF EXISTS "Group members can read food logs" ON food_logs;
DROP POLICY IF EXISTS "Users can insert their food logs" ON food_logs;
DROP POLICY IF EXISTS "Users can read their quiz responses" ON quiz_responses;
DROP POLICY IF EXISTS "Users can insert their quiz responses" ON quiz_responses;

-- Create new policies

-- Groups: Users can view their own groups
CREATE POLICY "Users can view their groups" ON groups
  FOR SELECT USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Chat: Group members can read messages
CREATE POLICY "Group members can read messages" ON chat_messages
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Chat: Group members can insert messages
CREATE POLICY "Group members can insert messages" ON chat_messages
  FOR INSERT WITH CHECK (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Text Shares: Group members can read
CREATE POLICY "Group members can read shares" ON text_shares
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Text Shares: Users can insert their own
CREATE POLICY "Users can insert their shares" ON text_shares
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Food Logs: Group members can read
CREATE POLICY "Group members can read food logs" ON food_logs
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Food Logs: Users can insert their own
CREATE POLICY "Users can insert their food logs" ON food_logs
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Quiz Responses: Users can read their own
CREATE POLICY "Users can read their quiz responses" ON quiz_responses
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Quiz Responses: Users can insert their own
CREATE POLICY "Users can insert their quiz responses" ON quiz_responses
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- ================================================
-- SUCCESS! Tables created.
-- Next steps:
-- 1. Run: python scripts/import_book_content.py
-- 2. Run: python scripts/generate_all_quizzes.py
-- 3. Run: python scripts/verify_data.py
-- ================================================

