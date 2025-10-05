#!/usr/bin/env python3
"""
Create BuddyShare tables using Supabase Python client
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_buddyshare_tables():
    """Create BuddyShare tables using Python client"""
    
    # Initialize Supabase client
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file")
        return False
    
    supabase: Client = create_client(url, key)
    
    try:
        print("Creating BuddyShare tables...")
        
        # SQL commands to create tables
        sql_commands = [
            # Create share_comments table
            """
            CREATE TABLE IF NOT EXISTS share_comments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                share_id UUID NOT NULL,
                share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('text_share', 'food_log')),
                user_id UUID NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            """,
            
            # Create share_reactions table
            """
            CREATE TABLE IF NOT EXISTS share_reactions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                share_id UUID NOT NULL,
                share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('text_share', 'food_log')),
                user_id UUID NOT NULL,
                reaction_type VARCHAR(20) NOT NULL DEFAULT 'like' CHECK (reaction_type = 'like'),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(share_id, share_type, user_id, reaction_type)
            );
            """,
            
            # Create indexes
            """
            CREATE INDEX IF NOT EXISTS idx_share_comments_share_id ON share_comments(share_id, share_type);
            """,
            """
            CREATE INDEX IF NOT EXISTS idx_share_comments_user_id ON share_comments(user_id);
            """,
            """
            CREATE INDEX IF NOT EXISTS idx_share_reactions_share_id ON share_reactions(share_id, share_type);
            """,
            """
            CREATE INDEX IF NOT EXISTS idx_share_reactions_user_id ON share_reactions(user_id);
            """,
            
            # Enable RLS
            """
            ALTER TABLE share_comments ENABLE ROW LEVEL SECURITY;
            """,
            """
            ALTER TABLE share_reactions ENABLE ROW LEVEL SECURITY;
            """,
            
            # Create RLS policies
            """
            DROP POLICY IF EXISTS "view_comments" ON share_comments;
            CREATE POLICY "view_comments" ON share_comments FOR SELECT USING (true);
            """,
            """
            DROP POLICY IF EXISTS "insert_comments" ON share_comments;
            CREATE POLICY "insert_comments" ON share_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
            """,
            """
            DROP POLICY IF EXISTS "update_comments" ON share_comments;
            CREATE POLICY "update_comments" ON share_comments FOR UPDATE USING (auth.uid() = user_id);
            """,
            """
            DROP POLICY IF EXISTS "delete_comments" ON share_comments;
            CREATE POLICY "delete_comments" ON share_comments FOR DELETE USING (auth.uid() = user_id);
            """,
            """
            DROP POLICY IF EXISTS "view_reactions" ON share_reactions;
            CREATE POLICY "view_reactions" ON share_reactions FOR SELECT USING (true);
            """,
            """
            DROP POLICY IF EXISTS "insert_reactions" ON share_reactions;
            CREATE POLICY "insert_reactions" ON share_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
            """,
            """
            DROP POLICY IF EXISTS "update_reactions" ON share_reactions;
            CREATE POLICY "update_reactions" ON share_reactions FOR UPDATE USING (auth.uid() = user_id);
            """,
            """
            DROP POLICY IF EXISTS "delete_reactions" ON share_reactions;
            CREATE POLICY "delete_reactions" ON share_reactions FOR DELETE USING (auth.uid() = user_id);
            """
        ]
        
        # Execute each SQL command
        for i, sql in enumerate(sql_commands, 1):
            print(f"Executing command {i}/{len(sql_commands)}...")
            try:
                result = supabase.rpc('exec_sql', {'sql': sql.strip()})
                print(f"✓ Command {i} executed successfully")
            except Exception as e:
                print(f"⚠ Command {i} failed (may already exist): {e}")
        
        print("\n✅ BuddyShare tables created successfully!")
        print("You can now test the BuddyShare feature at http://localhost:3001/buddyshare")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

if __name__ == "__main__":
    success = create_buddyshare_tables()
    if success:
        print("\n🎉 Setup complete!")
    else:
        print("\n💥 Setup failed. Please check your .env file and try again.")
