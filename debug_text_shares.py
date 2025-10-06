#!/usr/bin/env python3
"""
Script to debug text shares data
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

def debug_text_shares():
    print("=== DEBUGGING TEXT SHARES DATA ===\n")
    
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
    
    # Check text shares data
    print(f"\n1. Checking text_shares table:")
    try:
        text_shares = supabase.table('text_shares').select('*').eq('user_id', user_id).execute()
        print(f"   Total text shares found: {len(text_shares.data)}")
        
        if text_shares.data:
            for i, share in enumerate(text_shares.data):
                print(f"   Share {i+1}:")
                print(f"     - ID: {share.get('id')}")
                print(f"     - Day Number: {share.get('day_number')}")
                print(f"     - Created At: {share.get('created_at')}")
                print(f"     - Content: {share.get('content', 'No content')[:50]}...")
        else:
            print("   ❌ No text shares found!")
            
    except Exception as e:
        print(f"   ❌ Error querying text_shares: {e}")
    
    # Check if the query the frontend uses works
    print(f"\n2. Testing frontend query (select created_at only):")
    try:
        text_shares_frontend = supabase.table('text_shares').select('created_at').eq('user_id', user_id).execute()
        print(f"   Frontend query result: {len(text_shares_frontend.data)} records")
        if text_shares_frontend.data:
            for share in text_shares_frontend.data:
                print(f"     - {share.get('created_at')}")
    except Exception as e:
        print(f"   ❌ Error with frontend query: {e}")

if __name__ == "__main__":
    debug_text_shares()
