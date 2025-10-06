#!/usr/bin/env python3
"""
Script to debug Day 15 food log data
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

def debug_day15():
    print("=== DEBUGGING DAY 15 FOOD LOG DATA ===\n")
    
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
    
    # Check food logs data
    print(f"\n1. Checking food_logs table:")
    try:
        food_logs = supabase.table('food_logs').select('*').eq('user_id', user_id).execute()
        print(f"   Total food logs found: {len(food_logs.data)}")
        
        if food_logs.data:
            for i, log in enumerate(food_logs.data):
                print(f"   Food log {i+1}:")
                print(f"     - ID: {log.get('id')}")
                print(f"     - Created At: {log.get('created_at')}")
                print(f"     - User Input: {log.get('user_input', 'No input')[:50]}...")
                
                # Calculate Program Day from created_at
                from datetime import datetime
                log_date = datetime.fromisoformat(log['created_at'].replace('Z', '+00:00'))
                current_month = log_date.month
                current_year = log_date.year
                first_day_of_month = datetime(current_year, current_month, 1)
                days_since_start = (log_date - first_day_of_month).days
                program_day = min(days_since_start + 1, 21)
                
                print(f"     - Calculated Program Day: {program_day}")
                print(f"     - Calendar Date: {current_year}-{current_month:02d}-{program_day:02d}")
                
    except Exception as e:
        print(f"   ❌ Error querying food_logs: {e}")
    
    # Check if Day 15 has food log
    print(f"\n2. Checking for Day 15 food log:")
    try:
        oct_15_logs = [log for log in food_logs.data if '2025-10-15' in log['created_at']]
        print(f"   Food logs on Oct 15: {len(oct_15_logs)}")
        if oct_15_logs:
            for log in oct_15_logs:
                print(f"     - {log['created_at']}: {log.get('user_input', 'No input')[:50]}...")
    except Exception as e:
        print(f"   ❌ Error checking Oct 15 logs: {e}")

if __name__ == "__main__":
    debug_day15()
