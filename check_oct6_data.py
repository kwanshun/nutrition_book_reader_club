#!/usr/bin/env python3
"""
Script to check what activities should be on Oct 6
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

def check_oct6_data():
    print("=== CHECKING OCT 6 ACTIVITIES ===\n")
    
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
    
    # Check what activities exist for Oct 6, 2025
    oct_6_date = "2025-10-06"
    
    print(f"\nChecking activities for {oct_6_date}:")
    
    # Check text shares
    try:
        text_shares = supabase.table('text_shares').select('*').eq('user_id', user_id).eq('day_number', 6).execute()
        print(f"   Text Shares for Day 6: {len(text_shares.data)}")
        if text_shares.data:
            for share in text_shares.data:
                print(f"     - {share['created_at'][:10]}: {share['content'][:50]}...")
    except Exception as e:
        print(f"   Error checking text shares: {e}")
    
    # Check food logs
    try:
        food_logs = supabase.table('food_logs').select('*').eq('user_id', user_id).execute()
        oct_6_food_logs = [log for log in food_logs.data if log['created_at'].startswith(oct_6_date)]
        print(f"   Food Logs for Oct 6: {len(oct_6_food_logs)}")
        if oct_6_food_logs:
            for log in oct_6_food_logs:
                print(f"     - {log['created_at'][:10]}: {log.get('user_input', 'No input')[:50]}...")
    except Exception as e:
        print(f"   Error checking food logs: {e}")
    
    # Check quiz responses
    try:
        quiz_responses = supabase.table('quiz_responses').select('*').eq('user_id', user_id).eq('day_number', 6).execute()
        print(f"   Quiz Responses for Day 6: {len(quiz_responses.data)}")
        if quiz_responses.data:
            for response in quiz_responses.data:
                print(f"     - {response['answered_at'][:10]}: {response['score']}/{response['total_questions']}")
    except Exception as e:
        print(f"   Error checking quiz responses: {e}")
    
    print(f"\nExpected calendar icons for Oct 6:")
    print(f"   - Text Share (empty circle): {'YES' if text_shares.data else 'NO'}")
    print(f"   - Food Log (gray circle): {'YES' if oct_6_food_logs else 'NO'}")
    print(f"   - Quiz (monitor icon): {'YES' if quiz_responses.data else 'NO'}")

if __name__ == "__main__":
    check_oct6_data()
