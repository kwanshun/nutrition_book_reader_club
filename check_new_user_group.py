#!/usr/bin/env python3
import os
from supabase import create_client, Client
from dotenv import load_dotenv

def check_user_group():
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
        
        # Get the email of the new user (you need to provide this)
        email = input("Enter the new user's email: ").strip()
        
        # Find user by email
        response = supabase.auth.admin.list_users()
        user = None
        for u in response:
            if u.email == email:
                user = u
                break
        
        if not user:
            print(f"❌ User with email {email} not found")
            return
        
        print(f"✅ Found user: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Email confirmed: {user.email_confirmed_at is not None}")
        print(f"   Created at: {user.created_at}\n")
        
        # Check group membership
        group_response = supabase.table('group_members').select('*').eq('user_id', user.id).execute()
        
        if group_response.data:
            print(f"✅ User is in {len(group_response.data)} group(s):")
            for membership in group_response.data:
                # Get group name
                group_data = supabase.table('groups').select('name').eq('id', membership['group_id']).single().execute()
                print(f"   - Group: {group_data.data['name']}")
                print(f"     Role: {membership['role']}")
                print(f"     Joined at: {membership['joined_at']}")
        else:
            print("❌ User is NOT in any group")
            print("\n🔧 Fix: Run the join group API manually or add user to TEST001 group")
            
            # Ask if user wants to add them to TEST001
            fix = input("\nDo you want to add this user to group TEST001? (y/n): ").strip().lower()
            if fix == 'y':
                # Find TEST001 group
                test_group = supabase.table('groups').select('*').eq('invite_code', 'TEST001').single().execute()
                if test_group.data:
                    # Add user to group
                    insert_response = supabase.table('group_members').insert({
                        'group_id': test_group.data['id'],
                        'user_id': user.id,
                        'role': 'member'
                    }).execute()
                    
                    if insert_response.data:
                        print(f"✅ Successfully added user to group: {test_group.data['name']}")
                    else:
                        print(f"❌ Failed to add user to group")
                else:
                    print("❌ TEST001 group not found")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_user_group()




