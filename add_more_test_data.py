#!/usr/bin/env python3
"""
Script to add more test data for specific dates
"""

import os
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

# Initialize Supabase client
url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

def add_more_test_data(email="test55@andywong.me", password="123456"):
    print(f"=== ADDING MORE TEST DATA FOR {email} ===\n")
    
    # Authenticate as the specified user
    print(f"Authenticating as {email}...")
    try:
        auth_result = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        print(f"   ✅ Authentication successful")
        user_id = auth_result.user.id
        print(f"   User ID: {user_id}")
    except Exception as e:
        print(f"   ❌ Authentication failed: {e}")
        return
    
    # Create specific dates
    oct_7 = datetime(2025, 10, 7)
    oct_9 = datetime(2025, 10, 9)
    oct_12 = datetime(2025, 10, 12)
    oct_15 = datetime(2025, 10, 15)
    
    print("\n1. Adding TEXT SHARES for Oct 9 and Oct 15...")
    text_shares_data = [
        {
            "user_id": user_id,
            "day_number": 9,  # Oct 9 = Day 9
            "content": "第9天學習了B族維生素的重要性，對身體的能量代謝有了更深的認識。",
            "created_at": oct_9.isoformat() + "Z"
        },
        {
            "user_id": user_id,
            "day_number": 15,  # Oct 15 = Day 15
            "content": "第15天學習了礦物質的知識，特別是鐵質對身體的重要性。",
            "created_at": oct_15.isoformat() + "Z"
        }
    ]
    
    try:
        for i, share in enumerate(text_shares_data):
            result = supabase.table('text_shares').insert(share).execute()
            print(f"   Created text share {i+1}: Day {share['day_number']} - {share['created_at'][:10]}")
        print(f"   ✅ Created {len(text_shares_data)} additional text shares")
    except Exception as e:
        print(f"   ❌ Error creating text shares: {e}")
    
    print("\n2. Adding FOOD LOGS for Oct 7 and Oct 15...")
    food_logs_data = [
        {
            "user_id": user_id,
            "user_input": "晚餐：蒸蛋配青菜",
            "image_url": "https://example.com/food_oct7.jpg",
            "created_at": oct_7.isoformat() + "Z"
        },
        {
            "user_id": user_id,
            "user_input": "午餐：牛肉麵配小菜",
            "image_url": "https://example.com/food_oct15.jpg",
            "created_at": oct_15.isoformat() + "Z"
        }
    ]
    
    try:
        for i, log in enumerate(food_logs_data):
            result = supabase.table('food_logs').insert(log).execute()
            print(f"   Created food log {i+1}: {log['created_at'][:10]}")
        print(f"   ✅ Created {len(food_logs_data)} additional food logs")
    except Exception as e:
        print(f"   ❌ Error creating food logs: {e}")
    
    print("\n3. Adding QUIZ RESPONSES for Oct 12 and Oct 15...")
    quiz_responses_data = [
        {
            "user_id": user_id,
            "day_number": 12,  # Oct 12 = Day 12
            "score": 3,
            "total_questions": 3,
            "answered_at": oct_12.isoformat() + "Z"
        },
        {
            "user_id": user_id,
            "day_number": 15,  # Oct 15 = Day 15
            "score": 2,
            "total_questions": 3,
            "answered_at": oct_15.isoformat() + "Z"
        }
    ]
    
    try:
        for i, response in enumerate(quiz_responses_data):
            result = supabase.table('quiz_responses').insert(response).execute()
            print(f"   Created quiz response {i+1}: Day {response['day_number']} - {response['score']}/{response['total_questions']}")
        print(f"   ✅ Created {len(quiz_responses_data)} additional quiz responses")
    except Exception as e:
        print(f"   ❌ Error creating quiz responses: {e}")
    
    print(f"\n4. SUMMARY OF NEW DATA ADDED:")
    print(f"   Text Shares: 2 entries (Days 9, 15)")
    print(f"   Food Logs: 2 entries (Days 7, 15)")
    print(f"   Quiz Responses: 2 entries (Days 12, 15)")
    
    print(f"\n5. EXPECTED UPDATED /records PAGE DISPLAY:")
    print(f"   學習打咭: 5 天 (Days 1, 3, 6, 9, 15)")
    print(f"   記錄食物: 5 天 (Days 2, 4, 5, 7, 15)")
    print(f"   測一測: 5 天 (Days 1, 3, 6, 12, 15)")

if __name__ == "__main__":
    # You can modify these parameters for different users
    # Example users:
    # add_more_test_data("test55@andywong.me", "123456")
    # add_more_test_data("user2@example.com", "password123")
    # add_more_test_data("user3@example.com", "password123")
    
    add_more_test_data()  # Uses default test55@andywong.me
