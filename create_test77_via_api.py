#!/usr/bin/env python3
"""
Create Test Data for test77@andywong.me via API
==============================================
This script creates test data by calling the existing API endpoints,
which will handle authentication and RLS properly.
"""

import os
import requests
import json
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

# Configuration
BASE_URL = "http://localhost:3001"  # Your Next.js server
USER_EMAIL = "test77@andywong.me"
USER_PASSWORD = "123456"

def login_user():
    """Login user and get session"""
    print("🔐 Logging in user...")
    
    login_data = {
        "email": USER_EMAIL,
        "password": USER_PASSWORD
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        if response.status_code == 200:
            print("✅ User logged in successfully")
            return response.cookies
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def create_text_shares(session_cookies):
    """Create text shares via API"""
    print("📝 Creating text shares...")
    
    text_shares = [
        {
            "day_number": 1,
            "content": "今天學習了營養學的基礎概念，了解到營養素與人體健康的密切關係。營養學真的是一門令人著迷的科學！"
        },
        {
            "day_number": 2,
            "content": "早餐增加蛋白質的建議很實用！今天試了雞蛋配牛奶，確實更有飽足感，到中午都不會餓。"
        },
        {
            "day_number": 3,
            "content": "保持年輕的竅門原來和營養息息相關。抗氧化物質真的很重要，要多吃彩色蔬果！"
        },
        {
            "day_number": 4,
            "content": "常見營養素的價值被低估了。維生素C不只是預防感冒，對膠原蛋白合成也很重要。"
        },
        {
            "day_number": 5,
            "content": "糖的泛濫問題真的很嚴重。現在開始注意隱藏糖分，連調味料都要小心選擇。"
        },
        {
            "day_number": 6,
            "content": "杏子的營養價值很高，特別是維生素A含量豐富。不同品種的杏子各有特色，很有趣！"
        }
    ]
    
    success_count = 0
    for share in text_shares:
        try:
            response = requests.post(
                f"{BASE_URL}/api/shares",
                json=share,
                cookies=session_cookies
            )
            if response.status_code == 201:
                print(f"  ✅ Day {share['day_number']} text share created")
                success_count += 1
            else:
                print(f"  ❌ Day {share['day_number']} text share failed: {response.status_code}")
                print(f"    Response: {response.text}")
        except Exception as e:
            print(f"  ❌ Day {share['day_number']} text share error: {e}")
    
    return success_count

def create_food_logs(session_cookies):
    """Create food logs via API"""
    print("🍽️ Creating food logs...")
    
    # Demo food data
    food_logs = [
        {
            "detected_foods": [
                {"name": "燕麥粥", "description": "營養豐富的早餐燕麥", "portion": "1碗 (約200g)"},
                {"name": "香蕉", "description": "新鮮香蕉", "portion": "1根 (約120g)"}
            ],
            "image_url": "/demo-images/breakfast-1.jpg",
            "user_input": "今天的營養早餐"
        },
        {
            "detected_foods": [
                {"name": "雞蛋", "description": "水煮蛋", "portion": "2顆 (約100g)"},
                {"name": "全麥吐司", "description": "全麥麵包", "portion": "2片 (約60g)"}
            ],
            "image_url": "/demo-images/breakfast-2.jpg",
            "user_input": "高蛋白早餐"
        },
        {
            "detected_foods": [
                {"name": "鮭魚", "description": "烤鮭魚", "portion": "1片 (約150g)"},
                {"name": "蔬菜沙拉", "description": "混合蔬菜", "portion": "1份 (約100g)"}
            ],
            "image_url": "/demo-images/lunch-1.jpg",
            "user_input": "健康午餐"
        },
        {
            "detected_foods": [
                {"name": "雞胸肉", "description": "烤雞胸肉", "portion": "1塊 (約120g)"},
                {"name": "糙米飯", "description": "糙米", "portion": "1碗 (約150g)"}
            ],
            "image_url": "/demo-images/lunch-2.jpg",
            "user_input": "均衡營養餐"
        },
        {
            "detected_foods": [
                {"name": "蔬菜湯", "description": "多種蔬菜湯", "portion": "1碗 (約250g)"},
                {"name": "全麥麵包", "description": "全麥麵包", "portion": "1片 (約30g)"}
            ],
            "image_url": "/demo-images/dinner-1.jpg",
            "user_input": "清淡晚餐"
        },
        {
            "detected_foods": [
                {"name": "水果拼盤", "description": "多種水果", "portion": "1份 (約200g)"},
                {"name": "優格", "description": "希臘優格", "portion": "1杯 (約150g)"}
            ],
            "image_url": "/demo-images/dinner-2.jpg",
            "user_input": "健康點心"
        }
    ]
    
    success_count = 0
    for i, food_log in enumerate(food_logs, 1):
        try:
            response = requests.post(
                f"{BASE_URL}/api/food/save",
                json=food_log,
                cookies=session_cookies
            )
            if response.status_code == 201:
                print(f"  ✅ Day {i} food log created")
                success_count += 1
            else:
                print(f"  ❌ Day {i} food log failed: {response.status_code}")
                print(f"    Response: {response.text}")
        except Exception as e:
            print(f"  ❌ Day {i} food log error: {e}")
    
    return success_count

def create_quiz_responses(session_cookies):
    """Create quiz responses via API"""
    print("🧠 Creating quiz responses...")
    
    success_count = 0
    for day in range(1, 7):
        try:
            # Simulate quiz response data
            quiz_data = {
                "day_number": day,
                "score": random.randint(2, 3),
                "total_questions": 3
            }
            
            # Use the save_quiz_response function
            response = requests.post(
                f"{BASE_URL}/api/quiz/save",
                json=quiz_data,
                cookies=session_cookies
            )
            if response.status_code == 200:
                print(f"  ✅ Day {day} quiz response created (Score: {quiz_data['score']}/3)")
                success_count += 1
            else:
                print(f"  ❌ Day {day} quiz response failed: {response.status_code}")
                print(f"    Response: {response.text}")
        except Exception as e:
            print(f"  ❌ Day {day} quiz response error: {e}")
    
    return success_count

def main():
    """Main function"""
    print("🔧 Creating Test Data for test77@andywong.me via API")
    print("=" * 60)
    
    # Login user
    session_cookies = login_user()
    if not session_cookies:
        print("❌ Cannot proceed without login")
        return
    
    print()
    
    # Create all test data
    text_count = create_text_shares(session_cookies)
    print()
    
    food_count = create_food_logs(session_cookies)
    print()
    
    quiz_count = create_quiz_responses(session_cookies)
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
