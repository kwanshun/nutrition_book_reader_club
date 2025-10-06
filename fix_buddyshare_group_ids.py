#!/usr/bin/env python3
"""
Script to fix group_id values for buddyshare access
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

# Initialize Supabase client
url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

def fix_buddyshare_group_ids():
    print("=== FIXING BUDDYSHARE GROUP IDS ===\n")
    
    # Authenticate as the test user
    print("Authenticating as test55@andywong.me...")
    try:
        auth_result = supabase.auth.sign_in_with_password({
            "email": "test55@andywong.me",
            "password": "123456"
        })
        user_id = auth_result.user.id
        print(f"   ✅ Authentication successful")
        print(f"   User ID: {user_id}")
    except Exception as e:
        print(f"   ❌ Authentication failed: {e}")
        return
    
    # Get user's group_id
    print(f"\n1. Getting user's group:")
    try:
        group_members = supabase.table('group_members').select('group_id').eq('user_id', user_id).execute()
        if not group_members.data:
            print("   ❌ User is not in any group!")
            return
        
        group_id = group_members.data[0]['group_id']
        print(f"   ✅ User's group ID: {group_id}")
    except Exception as e:
        print(f"   ❌ Error getting group: {e}")
        return
    
    # Update text_shares with correct group_id
    print(f"\n2. Updating text_shares with group_id:")
    try:
        text_shares_result = supabase.table('text_shares').update({'group_id': group_id}).eq('user_id', user_id).is_('group_id', 'null').execute()
        print(f"   ✅ Updated {len(text_shares_result.data)} text_shares records")
    except Exception as e:
        print(f"   ❌ Error updating text_shares: {e}")
    
    # Update food_logs with correct group_id
    print(f"\n3. Updating food_logs with group_id:")
    try:
        food_logs_result = supabase.table('food_logs').update({'group_id': group_id}).eq('user_id', user_id).is_('group_id', 'null').execute()
        print(f"   ✅ Updated {len(food_logs_result.data)} food_logs records")
    except Exception as e:
        print(f"   ❌ Error updating food_logs: {e}")
    
    # Verify the updates
    print(f"\n4. Verifying updates:")
    try:
        # Check text_shares
        text_shares = supabase.table('text_shares').select('id, group_id').eq('user_id', user_id).execute()
        updated_text_shares = [s for s in text_shares.data if s['group_id'] == group_id]
        print(f"   Text shares with correct group_id: {len(updated_text_shares)}/{len(text_shares.data)}")
        
        # Check food_logs
        food_logs = supabase.table('food_logs').select('id, group_id').eq('user_id', user_id).execute()
        updated_food_logs = [f for f in food_logs.data if f['group_id'] == group_id]
        print(f"   Food logs with correct group_id: {len(updated_food_logs)}/{len(food_logs.data)}")
        
        if len(updated_text_shares) > 0 and len(updated_food_logs) > 0:
            print(f"   ✅ Buddyshare should now be accessible!")
        else:
            print(f"   ❌ Some records still don't have group_id")
            
    except Exception as e:
        print(f"   ❌ Error verifying updates: {e}")

if __name__ == "__main__":
    fix_buddyshare_group_ids()
