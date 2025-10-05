#!/usr/bin/env python3
"""
Debug BuddyShare Issue
======================
Check specific user group membership and shares
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Also try loading from frontend .env.local
if os.path.exists("frontend/.env.local"):
    load_dotenv("frontend/.env.local")

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file")

def debug_buddyshare():
    """Debug BuddyShare for specific users"""
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    print("🔍 Debugging BuddyShare Issue...\n")
    
    # Check specific users
    test_users = ["info@andywong.me", "test55@andywong.me"]
    
    for email in test_users:
        print(f"=" * 60)
        print(f"👤 CHECKING USER: {email}")
        print(f"=" * 60)
        
        # Get user from auth.users
        try:
            user_result = supabase.auth.admin.list_users()
            user = None
            for u in user_result:
                if u.email == email:
                    user = u
                    break
            
            if not user:
                print(f"❌ User {email} not found in auth.users")
                continue
                
            print(f"✅ User found: {user.id}")
            
            # Check group membership
            group_result = supabase.table('group_members').select('group_id').eq('user_id', user.id).execute()
            group_members = group_result.data
            
            if not group_members:
                print(f"❌ User {email} not in any group")
                continue
                
            print(f"✅ User is in group: {group_members[0]['group_id']}")
            
            # Check text shares for this group
            group_id = group_members[0]['group_id']
            print(f"🔍 Looking for shares in group_id: {group_id}")
            
            shares_result = supabase.table('text_shares').select('*').eq('group_id', group_id).execute()
            shares = shares_result.data
            
            print(f"✅ Found {len(shares)} text shares in group {group_id}")
            for share in shares[:3]:
                print(f"  - {share['content'][:50]}... by {share['user_id'][:8]}... (group: {share.get('group_id', 'MISSING')[:8]}...)")
                
            # Check if user has their own shares
            user_shares = [s for s in shares if s['user_id'] == user.id]
            print(f"✅ User has {len(user_shares)} of their own shares")
            
            # Also check ALL text shares to see the actual group_id values
            all_shares_result = supabase.table('text_shares').select('*').execute()
            all_shares = all_shares_result.data
            print(f"🔍 Total text shares in database: {len(all_shares)}")
            for share in all_shares[:3]:
                print(f"  - Group: {share.get('group_id', 'MISSING')[:8]}... User: {share['user_id'][:8]}...")
            
        except Exception as e:
            print(f"❌ Error checking user {email}: {e}")

if __name__ == "__main__":
    debug_buddyshare()
