#!/usr/bin/env python3
"""
Script to execute the RLS policy fix for group_members table
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

def execute_rls_fix():
    print("=== EXECUTING RLS POLICY FIX ===\n")
    
    # Read the SQL file
    try:
        with open('fix_group_members_rls.sql', 'r') as f:
            sql_commands = f.read()
        print("✅ SQL file loaded successfully")
    except Exception as e:
        print(f"❌ Error loading SQL file: {e}")
        return
    
    # Execute the SQL commands
    print("\n1. Executing RLS policy fix...")
    try:
        # Split SQL commands by semicolon and execute each one
        commands = [cmd.strip() for cmd in sql_commands.split(';') if cmd.strip()]
        
        for i, command in enumerate(commands):
            if command and not command.startswith('--'):
                print(f"   Executing command {i+1}...")
                result = supabase.rpc('exec_sql', {'sql': command}).execute()
                print(f"   ✅ Command {i+1} executed successfully")
        
        print("✅ All SQL commands executed successfully")
        
    except Exception as e:
        print(f"❌ Error executing SQL: {e}")
        return
    
    # Test the fix
    print("\n2. Testing the fix...")
    try:
        # Test with test77@andywong.me
        auth_result = supabase.auth.sign_in_with_password({
            "email": "test77@andywong.me",
            "password": "123456"
        })
        user_id = auth_result.user.id
        print(f"   ✅ Authentication successful")
        print(f"   User ID: {user_id}")
        
        # Test the group_members query that was failing
        group_members = supabase.table('group_members').select('group_id').eq('user_id', user_id).execute()
        print(f"   ✅ Group members query successful!")
        print(f"   Found {len(group_members.data)} group memberships")
        
        if group_members.data:
            group_id = group_members.data[0]['group_id']
            print(f"   Group ID: {group_id}")
            
            # Test getting all group members
            all_members = supabase.table('group_members').select('user_id').eq('group_id', group_id).execute()
            print(f"   ✅ All group members query successful!")
            print(f"   Found {len(all_members.data)} total group members")
        
        print("\n🎉 RLS policy fix successful!")
        print("   The buddyshare page should now work correctly.")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        print("   The RLS policy might still need manual fixing in the Supabase dashboard.")

if __name__ == "__main__":
    execute_rls_fix()
