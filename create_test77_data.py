#!/usr/bin/env python3
"""
Create Test Data for test77@andywong.me
=====================================
Create comprehensive test data including:
- Text shares for Day 1-6
- Food logs for Day 1-6  
- Quiz responses for Day 1-6
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

def get_user_id(email):
    """Get user ID by email"""
    try:
        result = supabase.table('profiles').select('id').eq('email', email).execute()
        if result.data:
            return result.data[0]['id']
        return None
    except Exception as e:
        print(f"❌ Error fetching user: {e}")
        return None

def get_user_group_id(user_id):
    """Get user's group ID"""
    try:
        result = supabase.table('group_members').select('group_id').eq('user_id', user_id).execute()
        if result.data:
            return result.data[0]['group_id']
        return None
    except Exception as e:
        print(f"❌ Error fetching group: {e}")
        return None

def create_text_shares(user_id, group_id):
    """Create text shares for Day 1-6"""
    print("📝 Creating text shares...")
    
    text_shares = [
        {
            "user_id": user_id,
            "group_id": group_id,
            "day_number": 1,
            "content": "今天學習了營養學的基礎概念，了解到營養素與人體健康的密切關係。營養學真的是一門令人著迷的科學！",
            "created_at": (datetime.now() - timedelta(days=5)).isoformat()
        },
        {
            "user_id": user_id,
            "group_id": group_id,
            "day_number": 2,
            "content": "早餐增加蛋白質的建議很實用！今天試了雞蛋配牛奶，確實更有飽足感，到中午都不會餓。",
            "created_at": (datetime.now() - timedelta(days=4)).isoformat()
        },
        {
            "user_id": user_id,
            "group_id": group_id,
            "day_number": 3,
            "content": "保持年輕的竅門原來和營養息息相關。抗氧化物質真的很重要，要多吃彩色蔬果！",
            "created_at": (datetime.now() - timedelta(days=3)).isoformat()
        },
        {
            "user_id": user_id,
            "group_id": group_id,
            "day_number": 4,
            "content": "常見營養素的價值被低估了。維生素C不只是預防感冒，對膠原蛋白合成也很重要。",
            "created_at": (datetime.now() - timedelta(days=2)).isoformat()
        },
        {
            "user_id": user_id,
            "group_id": group_id,
            "day_number": 5,
            "content": "糖的泛濫問題真的很嚴重。現在開始注意隱藏糖分，連調味料都要小心選擇。",
            "created_at": (datetime.now() - timedelta(days=1)).isoformat()
        },
        {
            "user_id": user_id,
            "group_id": group_id,
            "day_number": 6,
            "content": "杏子的營養價值很高，特別是維生素A含量豐富。不同品種的杏子各有特色，很有趣！",
            "created_at": datetime.now().isoformat()
        }
    ]
    
    success_count = 0
    for share in text_shares:
        try:
            result = supabase.table('text_shares').insert(share).execute()
            if result.data:
                print(f"  ✅ Day {share['day_number']} text share created")
                success_count += 1
        except Exception as e:
            print(f"  ❌ Day {share['day_number']} text share failed: {e}")
    
    return success_count

def create_food_logs(user_id, group_id):
    """Create food logs for Day 1-6"""
    print("🍽️ Creating food logs...")
    
    # Demo food images from the demo-images folder
    demo_images = [
        "/demo-images/breakfast-1.jpg",
        "/demo-images/breakfast-2.jpg", 
        "/demo-images/lunch-1.jpg",
        "/demo-images/lunch-2.jpg",
        "/demo-images/dinner-1.jpg",
        "/demo-images/dinner-2.jpg"
    ]
    
    food_logs = [
        {
            "user_id": user_id,
            "group_id": group_id,
            "day_number": 1,
            "image_url": demo_images[0],
            "detected_foods": [
                {"name": "燕麥粥", "description": "營養豐富的早餐燕麥", "portion": "1碗 (約200g)"},
                {"name": "香蕉", "description": "新鮮香蕉", "portion": "1根 (約120g)"}
            ],
            "user_input": "今天的營養早餐",
            "created_at": (datetime.now() - timedelta(days=5)).isoformat()
        },
        {
            "user_id": user_id,
            "group_id": group_id,
            "day_number": 2,
            "image_url": demo_images[1],
            "detected_foods": [
                {"name": "雞蛋", "description": "水煮蛋", "portion": "2顆 (約100g)"},
                {"name": "全麥吐司", "description": "全麥麵包", "portion": "2片 (約60g)"}
            ],
            "user_input": "高蛋白早餐",
            "created_at": (datetime.now() - timedelta(days=4)).isoformat()
        },
        {
            "user_id": user_id,
            "group_id": group_id,
            "day_number": 3,
            "image_url": demo_images[2],
            "detected_foods": [
                {"name": "鮭魚", "description": "烤鮭魚", "portion": "1片 (約150g)"},
                {"name": "蔬菜沙拉", "description": "混合蔬菜", "portion": "1份 (約100g)"}
            ],
            "user_input": "健康午餐",
            "created_at": (datetime.now() - timedelta(days=3)).isoformat()
        },
        {
            "user_id": user_id,
            "group_id": group_id,
            "day_number": 4,
            "image_url": demo_images[3],
            "detected_foods": [
                {"name": "雞胸肉", "description": "烤雞胸肉", "portion": "1塊 (約120g)"},
                {"name": "糙米飯", "description": "糙米", "portion": "1碗 (約150g)"}
            ],
            "user_input": "均衡營養餐",
            "created_at": (datetime.now() - timedelta(days=2)).isoformat()
        },
        {
            "user_id": user_id,
            "group_id": group_id,
            "day_number": 5,
            "image_url": demo_images[4],
            "detected_foods": [
                {"name": "蔬菜湯", "description": "多種蔬菜湯", "portion": "1碗 (約250g)"},
                {"name": "全麥麵包", "description": "全麥麵包", "portion": "1片 (約30g)"}
            ],
            "user_input": "清淡晚餐",
            "created_at": (datetime.now() - timedelta(days=1)).isoformat()
        },
        {
            "user_id": user_id,
            "group_id": group_id,
            "day_number": 6,
            "image_url": demo_images[5],
            "detected_foods": [
                {"name": "水果拼盤", "description": "多種水果", "portion": "1份 (約200g)"},
                {"name": "優格", "description": "希臘優格", "portion": "1杯 (約150g)"}
            ],
            "user_input": "健康點心",
            "created_at": datetime.now().isoformat()
        }
    ]
    
    success_count = 0
    for log in food_logs:
        try:
            # Insert food log
            log_data = {
                "user_id": log["user_id"],
                "group_id": log["group_id"],
                "day_number": log["day_number"],
                "image_url": log["image_url"],
                "detected_foods": log["detected_foods"],
                "user_input": log["user_input"],
                "created_at": log["created_at"]
            }
            
            result = supabase.table('food_logs').insert(log_data).execute()
            if result.data:
                food_log_id = result.data[0]['id']
                
                # Insert food log items
                food_items = []
                for food in log["detected_foods"]:
                    food_items.append({
                        "food_log_id": food_log_id,
                        "user_id": user_id,
                        "name": food["name"],
                        "description": food["description"],
                        "portion": food["portion"]
                    })
                
                supabase.table('food_log_items').insert(food_items).execute()
                print(f"  ✅ Day {log['day_number']} food log created")
                success_count += 1
                
        except Exception as e:
            print(f"  ❌ Day {log['day_number']} food log failed: {e}")
    
    return success_count

def create_quiz_responses(user_id):
    """Create quiz responses for Day 1-6"""
    print("🧠 Creating quiz responses...")
    
    quiz_responses = [
        {
            "user_id": user_id,
            "day_number": 1,
            "score": 3,
            "total_questions": 3,
            "answered_at": (datetime.now() - timedelta(days=5)).isoformat()
        },
        {
            "user_id": user_id,
            "day_number": 2,
            "score": 2,
            "total_questions": 3,
            "answered_at": (datetime.now() - timedelta(days=4)).isoformat()
        },
        {
            "user_id": user_id,
            "day_number": 3,
            "score": 3,
            "total_questions": 3,
            "answered_at": (datetime.now() - timedelta(days=3)).isoformat()
        },
        {
            "user_id": user_id,
            "day_number": 4,
            "score": 2,
            "total_questions": 3,
            "answered_at": (datetime.now() - timedelta(days=2)).isoformat()
        },
        {
            "user_id": user_id,
            "day_number": 5,
            "score": 3,
            "total_questions": 3,
            "answered_at": (datetime.now() - timedelta(days=1)).isoformat()
        },
        {
            "user_id": user_id,
            "day_number": 6,
            "score": 2,
            "total_questions": 3,
            "answered_at": datetime.now().isoformat()
        }
    ]
    
    success_count = 0
    for response in quiz_responses:
        try:
            result = supabase.table('quiz_responses').insert(response).execute()
            if result.data:
                print(f"  ✅ Day {response['day_number']} quiz response created (Score: {response['score']}/3)")
                success_count += 1
        except Exception as e:
            print(f"  ❌ Day {response['day_number']} quiz response failed: {e}")
    
    return success_count

def main():
    """Main function to create all test data"""
    print("🔧 Creating Test Data for test77@andywong.me")
    print("=" * 60)
    
    # Get user ID
    user_id = get_user_id('test77@andywong.me')
    if not user_id:
        print("❌ User test77@andywong.me not found!")
        print("Please make sure the user exists in the profiles table.")
        return
    
    print(f"✅ Found user: test77@andywong.me (ID: {user_id})")
    
    # Get user's group ID
    group_id = get_user_group_id(user_id)
    if not group_id:
        print("❌ User is not in any group!")
        print("Please add the user to a group first.")
        return
    
    print(f"✅ Found group ID: {group_id}")
    print()
    
    # Create all test data
    text_count = create_text_shares(user_id, group_id)
    print()
    
    food_count = create_food_logs(user_id, group_id)
    print()
    
    quiz_count = create_quiz_responses(user_id)
    print()
    
    # Summary
    print("=" * 60)
    print("✅ Test Data Creation Complete!")
    print(f"   Text Shares: {text_count}/6")
    print(f"   Food Logs: {food_count}/6")
    print(f"   Quiz Responses: {quiz_count}/6")
    print("=" * 60)
    
    if text_count == 6 and food_count == 6 and quiz_count == 6:
        print("🎉 All test data created successfully!")
        print("User test77@andywong.me now has complete activity data for Day 1-6")
    else:
        print("⚠️ Some data creation failed. Check the errors above.")

if __name__ == "__main__":
    main()
