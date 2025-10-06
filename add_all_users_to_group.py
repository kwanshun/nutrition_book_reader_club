#!/usr/bin/env python3
"""
Script to add all existing users to the same group for buddyshare testing
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

def add_all_users_to_group():
    print("=== ADDING ALL USERS TO SAME GROUP ===\n")
    
    # List of users from the Supabase dashboard
    users = [
        {"email": "test55@andywong.me", "password": "123456"},
        {"email": "test77@andywong.me", "password": "123456"},
        {"email": "test63@andywong.me", "password": "123456"},
        {"email": "test44@andywong.me", "password": "123456"},
        {"email": "test88@andywong.me", "password": "123456"},
        {"email": "test99@andywong.me", "password": "123456"},
        {"email": "test5@andywong.me", "password": "123456"},
        {"email": "info8connect2@gmail.com", "password": "123456"},
        {"email": "test234@andywong.me", "password": "123456"},
        {"email": "info@andywong.me", "password": "123456"}
    ]
    
    # First, get the group ID from test55@andywong.me
    print("1. Getting group information from test55@andywong.me...")
    try:
        auth_result = supabase.auth.sign_in_with_password({
            "email": "test55@andywong.me",
            "password": "123456"
        })
        test55_user_id = auth_result.user.id
        print(f"   ✅ Authentication successful")
        print(f"   User ID: {test55_user_id}")
        
        # Get group info
        group_members = supabase.table('group_members').select('group_id').eq('user_id', test55_user_id).execute()
        if not group_members.data:
            print("   ❌ test55@andywong.me is not in any group!")
            return
        
        group_id = group_members.data[0]['group_id']
        print(f"   Group ID: {group_id}")
        
    except Exception as e:
        print(f"   ❌ Authentication failed: {e}")
        return
    
    # Process each user
    print(f"\n2. Processing all users...")
    successful_users = []
    failed_users = []
    
    for user_info in users:
        email = user_info["email"]
        password = user_info["password"]
        
        print(f"\n   Processing {email}...")
        try:
            # Authenticate user
            auth_result = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            user_id = auth_result.user.id
            print(f"     ✅ Authentication successful")
            print(f"     User ID: {user_id}")
            
            # Check if user is already in the group
            existing_membership = supabase.table('group_members').select('*').eq('user_id', user_id).eq('group_id', group_id).execute()
            if existing_membership.data:
                print(f"     ✅ Already in group")
                successful_users.append(email)
                continue
            
            # Add user to group
            group_member_result = supabase.table('group_members').insert({
                'user_id': user_id,
                'group_id': group_id,
                'role': 'member'
            }).execute()
            
            print(f"     ✅ Added to group successfully")
            successful_users.append(email)
            
            # Create profile if it doesn't exist
            try:
                profile_result = supabase.table('profiles').insert({
                    'user_id': user_id,
                    'email': email,
                    'display_name': email.split('@')[0].title(),
                    'created_at': 'now()'
                }).execute()
                print(f"     ✅ Profile created/updated")
            except Exception as profile_error:
                print(f"     ⚠️ Profile creation failed (might already exist): {profile_error}")
            
        except Exception as e:
            print(f"     ❌ Failed: {e}")
            failed_users.append(email)
    
    # Summary
    print(f"\n3. Summary:")
    print(f"   ✅ Successful: {len(successful_users)} users")
    for user in successful_users:
        print(f"     - {user}")
    
    if failed_users:
        print(f"   ❌ Failed: {len(failed_users)} users")
        for user in failed_users:
            print(f"     - {user}")
    
    print(f"\n4. Testing buddyshare access:")
    print(f"   Now all users should be able to see each other's shares on:")
    print(f"   http://localhost:3000/buddyshare")
    print(f"   ")
    print(f"   Test with any of these users:")
    for user in successful_users:
        print(f"   - {user} (password: 123456)")

if __name__ == "__main__":
    add_all_users_to_group()
