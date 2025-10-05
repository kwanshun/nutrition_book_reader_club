#!/usr/bin/env python3
"""
Check Supabase Records
======================
This script checks if records exist in the Supabase database for BuddyShare:
- text_shares table
- food_logs table  
- group_members table
- user_profiles table
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Also try loading from frontend .env.local
if os.path.exists("frontend/.env.local"):
    load_dotenv("frontend/.env.local")

# Configuration - try both env files
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"SUPABASE_URL: {SUPABASE_URL}")
print(f"SUPABASE_SERVICE_KEY: {'Found' if SUPABASE_SERVICE_KEY else 'Missing'}")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file")

def check_records():
    """Check all relevant tables for BuddyShare"""
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    print("🔍 Checking Supabase Records for BuddyShare...\n")
    
    # Check user_profiles
    print("=" * 60)
    print("👤 USER PROFILES")
    print("=" * 60)
    try:
        # Try with service role key first
        result = supabase.table('user_profiles').select('user_id, display_name').execute()
        profiles = result.data
        print(f"Total profiles: {len(profiles)}")
        if profiles:
            print("\nSample profiles:")
            for profile in profiles[:5]:
                print(f"  {profile['user_id'][:8]}... -> {profile['display_name']}")
        else:
            print("❌ No user profiles found (might be RLS issue)")
            # Try to get all columns to debug
            try:
                debug_result = supabase.table('user_profiles').select('*').limit(1).execute()
                print(f"Debug: Raw result has {len(debug_result.data)} rows")
                if debug_result.data:
                    print(f"Debug: Sample row keys: {list(debug_result.data[0].keys())}")
            except Exception as debug_e:
                print(f"Debug error: {debug_e}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Check groups
    print("\n" + "=" * 60)
    print("👥 GROUPS")
    print("=" * 60)
    try:
        result = supabase.table('groups').select('id, name').execute()
        groups = result.data
        print(f"Total groups: {len(groups)}")
        if groups:
            print("\nGroups:")
            for group in groups:
                print(f"  {group['id']} -> {group['name']}")
        else:
            print("❌ No groups found")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Check group_members
    print("\n" + "=" * 60)
    print("👥 GROUP MEMBERS")
    print("=" * 60)
    try:
        result = supabase.table('group_members').select('user_id, group_id').execute()
        members = result.data
        print(f"Total group members: {len(members)}")
        if members:
            print("\nSample members:")
            for member in members[:5]:
                print(f"  User {member['user_id'][:8]}... in Group {member['group_id'][:8]}...")
        else:
            print("❌ No group members found")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Check text_shares
    print("\n" + "=" * 60)
    print("💭 TEXT SHARES")
    print("=" * 60)
    try:
        result = supabase.table('text_shares').select('id, user_id, group_id, content, day_number, created_at').execute()
        shares = result.data
        print(f"Total text shares: {len(shares)}")
        if shares:
            print("\nSample shares:")
            for share in shares:
                content_preview = share['content'][:50] + "..." if len(share['content']) > 50 else share['content']
                print(f"  Day {share['day_number']:2d}: {content_preview}")
                print(f"    User: {share['user_id'][:8]}... | Group: {share.get('group_id', 'N/A')[:8]}... | Created: {share['created_at']}")
        else:
            print("❌ No text shares found")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Check food_logs
    print("\n" + "=" * 60)
    print("🍴 FOOD LOGS")
    print("=" * 60)
    try:
        result = supabase.table('food_logs').select('id, user_id, group_id, food_name, created_at').execute()
        logs = result.data
        print(f"Total food logs: {len(logs)}")
        if logs:
            print("\nSample food logs:")
            for log in logs:
                food_name = log.get('food_name', 'Unknown')  # Use .get() with a default for safety
                user_id_display = log['user_id'][:8] + '...' if log['user_id'] else 'N/A'
                group_id_display = log.get('group_id', 'N/A')[:8] + '...' if log.get('group_id') else 'N/A'
                print(f"  {food_name} | User: {user_id_display} | Group: {group_id_display} | Created: {log['created_at']}")
        else:
            print("❌ No food logs found")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Check share_comments
    print("\n" + "=" * 60)
    print("💬 SHARE COMMENTS")
    print("=" * 60)
    try:
        result = supabase.table('share_comments').select('id, share_id, share_type, content').execute()
        comments = result.data
        print(f"Total comments: {len(comments)}")
        if comments:
            print("\nSample comments:")
            for comment in comments[:3]:
                content_preview = comment['content'][:30] + "..." if len(comment['content']) > 30 else comment['content']
                print(f"  {comment['share_type']}: {content_preview}")
        else:
            print("❌ No comments found")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Check share_reactions
    print("\n" + "=" * 60)
    print("👍 SHARE REACTIONS")
    print("=" * 60)
    try:
        result = supabase.table('share_reactions').select('id, share_id, share_type, user_id').execute()
        reactions = result.data
        print(f"Total reactions: {len(reactions)}")
        if reactions:
            print("\nSample reactions:")
            for reaction in reactions[:5]:
                print(f"  {reaction['share_type']} | User: {reaction['user_id'][:8]}...")
        else:
            print("❌ No reactions found")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Check group_id in text_shares
    print("\n" + "=" * 60)
    print("🔍 TEXT SHARES GROUP CHECK")
    print("=" * 60)
    try:
        result = supabase.table('text_shares').select('id, user_id, group_id, content').execute()
        shares = result.data
        print(f"Text shares with group_id check:")
        for share in shares:
            group_status = "✅ Has group_id" if share.get('group_id') else "❌ Missing group_id"
            print(f"  {share['content'][:30]}... -> {group_status}")
            
        # Check if any shares are missing group_id
        missing_group = [s for s in shares if not s.get('group_id')]
        if missing_group:
            print(f"\n⚠️ Found {len(missing_group)} shares missing group_id!")
            print("This is why BuddyShare shows no data.")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print("BuddyShare requires:")
    print("1. ✅ User profiles (display names)")
    print("2. ✅ Groups and group members")
    print("3. ✅ Text shares or food logs")
    print("4. ✅ Share comments and reactions (optional)")
    print("\nIf any of these are missing, BuddyShare will show no data.")

if __name__ == "__main__":
    check_records()
