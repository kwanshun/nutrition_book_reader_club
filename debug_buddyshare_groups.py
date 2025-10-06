#!/usr/bin/env python3
"""
Script to debug buddyshare group visibility issues
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

def debug_buddyshare_groups():
    print("=== DEBUGGING BUDDYSHARE GROUP VISIBILITY ===\n")
    
    # Test both users
    users = [
        {"email": "test55@andywong.me", "password": "123456"},
        {"email": "info@andywong.me", "password": "123456"}
    ]
    
    user_data = {}
    
    for user_info in users:
        email = user_info["email"]
        print(f"1. Authenticating as {email}...")
        try:
            auth_result = supabase.auth.sign_in_with_password({
                "email": email,
                "password": user_info["password"]
            })
            user_id = auth_result.user.id
            print(f"   ✅ Authentication successful")
            print(f"   User ID: {user_id}")
            
            # Get user's groups
            group_members = supabase.table('group_members').select('group_id').eq('user_id', user_id).execute()
            if group_members.data:
                group_ids = [member['group_id'] for member in group_members.data]
                print(f"   Groups: {group_ids}")
                user_data[email] = {
                    'user_id': user_id,
                    'group_ids': group_ids
                }
            else:
                print(f"   ❌ User is not in any group!")
                user_data[email] = {
                    'user_id': user_id,
                    'group_ids': []
                }
        except Exception as e:
            print(f"   ❌ Authentication failed: {e}")
            continue
    
    print(f"\n2. Analyzing group relationships:")
    
    # Check if users are in the same group
    test55_groups = user_data.get('test55@andywong.me', {}).get('group_ids', [])
    info_groups = user_data.get('info@andywong.me', {}).get('group_ids', [])
    
    common_groups = set(test55_groups) & set(info_groups)
    print(f"   test55@andywong.me groups: {test55_groups}")
    print(f"   info@andywong.me groups: {info_groups}")
    print(f"   Common groups: {list(common_groups)}")
    
    if not common_groups:
        print(f"   ❌ Users are NOT in the same group!")
        print(f"   This is why info@andywong.me cannot see test55@andywong.me's shares")
        return
    
    print(f"   ✅ Users are in the same group(s)")
    
    # Check what content each user has
    print(f"\n3. Checking content for each user:")
    
    for email, data in user_data.items():
        user_id = data['user_id']
        print(f"\n   {email}:")
        
        # Check text shares
        text_shares = supabase.table('text_shares').select('id, group_id, content').eq('user_id', user_id).execute()
        print(f"     Text shares: {len(text_shares.data)}")
        for share in text_shares.data:
            print(f"       - ID: {share['id']}, Group: {share['group_id']}, Content: {share['content'][:30]}...")
        
        # Check food logs
        food_logs = supabase.table('food_logs').select('id, group_id, user_input').eq('user_id', user_id).execute()
        print(f"     Food logs: {len(food_logs.data)}")
        for log in food_logs.data:
            print(f"       - ID: {log['id']}, Group: {log['group_id']}, Input: {log['user_input'][:30]}...")
    
    # Test the API logic for info@andywong.me
    print(f"\n4. Testing API logic for info@andywong.me:")
    try:
        info_user_id = user_data['info@andywong.me']['user_id']
        info_groups = user_data['info@andywong.me']['group_ids']
        
        if info_groups:
            group_id = info_groups[0]  # Use first group
            
            # Get all group members
            all_group_members = supabase.table('group_members').select('user_id').eq('group_id', group_id).execute()
            group_member_ids = [member['user_id'] for member in all_group_members.data]
            print(f"   Group member IDs: {group_member_ids}")
            
            # Check text_shares from group members
            text_shares_from_group = supabase.table('text_shares').select('id, user_id, content').in_('user_id', group_member_ids).execute()
            print(f"   Text shares from group members: {len(text_shares_from_group.data)}")
            
            # Check food_logs from group members
            food_logs_from_group = supabase.table('food_logs').select('id, user_id, user_input').in_('user_id', group_member_ids).execute()
            print(f"   Food logs from group members: {len(food_logs_from_group.data)}")
            
            if len(text_shares_from_group.data) > 0 or len(food_logs_from_group.data) > 0:
                print(f"   ✅ API should return data for info@andywong.me")
            else:
                print(f"   ❌ API will return empty results for info@andywong.me")
        else:
            print(f"   ❌ info@andywong.me is not in any group")
            
    except Exception as e:
        print(f"   ❌ Error testing API logic: {e}")
    
    print(f"\n5. Recommendations:")
    if not common_groups:
        print(f"   - Add info@andywong.me to the same group as test55@andywong.me")
        print(f"   - Or create content for info@andywong.me in their own group")
    else:
        print(f"   - Users are in the same group, check browser console for errors")
        print(f"   - Verify authentication is working properly")
        print(f"   - Check if API is returning data correctly")

if __name__ == "__main__":
    debug_buddyshare_groups()
