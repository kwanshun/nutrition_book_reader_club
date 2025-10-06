#!/usr/bin/env python3
"""
Create Test Data for test77@andywong.me (Simple Version)
======================================================
This script creates test data using existing user IDs from the system.
Since we can't directly create auth users, we'll use existing user IDs.
"""

import os
import random
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

# Initialize Supabase client
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("❌ Missing environment variables!")
    exit(1)

supabase: Client = create_client(url, key)

def create_test_data_for_existing_user():
    """Create test data using a placeholder user ID"""
    print("🔧 Creating Test Data for test77@andywong.me")
    print("=" * 60)
    
    # Use a placeholder user ID (you'll need to replace this with actual user ID)
    # For now, let's create a test user ID
    test_user_id = "test77-user-id-placeholder"
    
    # Create a test group first
    print("📝 Creating test group...")
    try:
        group_result = supabase.table('groups').insert({
            "name": "Test Group",
            "description": "Test group for test77@andywong.me",
            "invite_code": "TEST77",
            "leader_id": test_user_id
        }).execute()
        
        if group_result.data:
            group_id = group_result.data[0]['id']
            print(f"✅ Test group created: {group_id}")
        else:
            print("❌ Failed to create test group")
            return
    except Exception as e:
        print(f"❌ Error creating group: {e}")
        return
    
    # Add user to group
    print("👥 Adding user to group...")
    try:
        member_result = supabase.table('group_members').insert({
            "group_id": group_id,
            "user_id": test_user_id,
            "role": "member"
        }).execute()
        print("✅ User added to group")
    except Exception as e:
        print(f"❌ Error adding user to group: {e}")
    
    # Create text shares
    print("📝 Creating text shares...")
    text_shares = [
        {
            "user_id": test_user_id,
            "group_id": group_id,
            "day_number": 1,
            "content": "今天學習了營養學的基礎概念，了解到營養素與人體健康的密切關係。營養學真的是一門令人著迷的科學！",
            "created_at": (datetime.now() - timedelta(days=5)).isoformat()
        },
        {
            "user_id": test_user_id,
            "group_id": group_id,
            "day_number": 2,
            "content": "早餐增加蛋白質的建議很實用！今天試了雞蛋配牛奶，確實更有飽足感，到中午都不會餓。",
            "created_at": (datetime.now() - timedelta(days=4)).isoformat()
        },
        {
            "user_id": test_user_id,
            "group_id": group_id,
            "day_number": 3,
            "content": "保持年輕的竅門原來和營養息息相關。抗氧化物質真的很重要，要多吃彩色蔬果！",
            "created_at": (datetime.now() - timedelta(days=3)).isoformat()
        },
        {
            "user_id": test_user_id,
            "group_id": group_id,
            "day_number": 4,
            "content": "常見營養素的價值被低估了。維生素C不只是預防感冒，對膠原蛋白合成也很重要。",
            "created_at": (datetime.now() - timedelta(days=2)).isoformat()
        },
        {
            "user_id": test_user_id,
            "group_id": group_id,
            "day_number": 5,
            "content": "糖的泛濫問題真的很嚴重。現在開始注意隱藏糖分，連調味料都要小心選擇。",
            "created_at": (datetime.now() - timedelta(days=1)).isoformat()
        },
        {
            "user_id": test_user_id,
            "group_id": group_id,
            "day_number": 6,
            "content": "杏子的營養價值很高，特別是維生素A含量豐富。不同品種的杏子各有特色，很有趣！",
            "created_at": datetime.now().isoformat()
        }
    ]
    
    text_count = 0
    for share in text_shares:
        try:
            result = supabase.table('text_shares').insert(share).execute()
            if result.data:
                print(f"  ✅ Day {share['day_number']} text share created")
                text_count += 1
        except Exception as e:
            print(f"  ❌ Day {share['day_number']} text share failed: {e}")
    
    # Create food logs
    print("🍽️ Creating food logs...")
    demo_images = [
        "/demo-images/breakfast-1.jpg",
        "/demo-images/breakfast-2.jpg", 
        "/demo-images/lunch-1.jpg",
        "/demo-images/lunch-2.jpg",
        "/demo-images/dinner-1.jpg",
        "/demo-images/dinner-2.jpg"
    ]
    
    food_count = 0
    for day in range(1, 7):
        try:
            food_log_data = {
                "user_id": test_user_id,
                "group_id": group_id,
                "day_number": day,
                "image_url": demo_images[day-1],
                "detected_foods": [
                    {"name": f"食物{day}", "description": f"第{day}天的食物", "portion": f"{day*100}g"}
                ],
                "user_input": f"第{day}天的食物記錄",
                "created_at": (datetime.now() - timedelta(days=6-day)).isoformat()
            }
            
            result = supabase.table('food_logs').insert(food_log_data).execute()
            if result.data:
                food_log_id = result.data[0]['id']
                
                # Insert food log items
                food_items = [{
                    "food_log_id": food_log_id,
                    "user_id": test_user_id,
                    "name": f"食物{day}",
                    "description": f"第{day}天的食物",
                    "portion": f"{day*100}g"
                }]
                
                supabase.table('food_log_items').insert(food_items).execute()
                print(f"  ✅ Day {day} food log created")
                food_count += 1
                
        except Exception as e:
            print(f"  ❌ Day {day} food log failed: {e}")
    
    # Create quiz responses
    print("🧠 Creating quiz responses...")
    quiz_count = 0
    for day in range(1, 7):
        try:
            quiz_data = {
                "user_id": test_user_id,
                "day_number": day,
                "score": random.randint(2, 3),
                "total_questions": 3,
                "answered_at": (datetime.now() - timedelta(days=6-day)).isoformat()
            }
            
            result = supabase.table('quiz_responses').insert(quiz_data).execute()
            if result.data:
                print(f"  ✅ Day {day} quiz response created (Score: {quiz_data['score']}/3)")
                quiz_count += 1
                
        except Exception as e:
            print(f"  ❌ Day {day} quiz response failed: {e}")
    
    # Summary
    print("=" * 60)
    print("✅ Test Data Creation Complete!")
    print(f"   Text Shares: {text_count}/6")
    print(f"   Food Logs: {food_count}/6")
    print(f"   Quiz Responses: {quiz_count}/6")
    print("=" * 60)
    print(f"📝 Note: Created with placeholder user ID: {test_user_id}")
    print("   You'll need to replace this with the actual user ID from auth.users")

if __name__ == "__main__":
    create_test_data_for_existing_user()
