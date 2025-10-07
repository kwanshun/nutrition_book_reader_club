#!/usr/bin/env python3
import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

def add_user_to_group(user_id, invite_code='TEST001'):
    # Load environment variables
    load_dotenv('.env')
    load_dotenv('frontend/.env.local')
    
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not service_role_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        return
    
    try:
        supabase: Client = create_client(supabase_url, service_role_key)
        print("✅ Connected to Supabase\n")
        
        # Find the group by invite code
        group_response = supabase.table('groups').select('*').eq('invite_code', invite_code).single().execute()
        
        if not group_response.data:
            print(f"❌ Group with invite code {invite_code} not found")
            return
        
        group = group_response.data
        print(f"✅ Found group: {group['name']} (ID: {group['id']})")
        
        # Check if user is already in the group
        existing_member = supabase.table('group_members').select('*').eq('user_id', user_id).eq('group_id', group['id']).execute()
        
        if existing_member.data:
            print(f"⚠️  User is already a member of this group")
            return
        
        # Add user to group
        insert_response = supabase.table('group_members').insert({
            'group_id': group['id'],
            'user_id': user_id,
            'role': 'member'
        }).execute()
        
        if insert_response.data:
            print(f"✅ Successfully added user {user_id} to group: {group['name']}")
        else:
            print(f"❌ Failed to add user to group")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 add_user_to_group.py <user_id> [invite_code]")
        print("Example: python3 add_user_to_group.py da462655-f578-454b-89c5-51be2d8c1d96")
        sys.exit(1)
    
    user_id = sys.argv[1]
    invite_code = sys.argv[2] if len(sys.argv) > 2 else 'TEST001'
    
    add_user_to_group(user_id, invite_code)




