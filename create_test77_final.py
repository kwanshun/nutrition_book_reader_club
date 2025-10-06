#!/usr/bin/env python3
"""
Create Test Data for test77@andywong.me
=====================================
This script creates test data using the service role key to bypass RLS.
"""

import os
import random
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

def main():
    """Main function"""
    print("🔧 Creating Test Data for test77@andywong.me")
    print("=" * 60)
    
    # Use regular key
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_KEY')
    
    if not url or not key:
        print("❌ Missing SUPABASE_URL or SUPABASE_KEY")
        return
    
    # Create client
    supabase = create_client(url, key)
    
    # Use the correct user ID for test77@andywong.me
    test_user_id = '7ab5065e-be7b-4e11-92ac-dec1e687805c'
    print(f"✅ Using user ID: {test_user_id}")
    
    # Use the known group ID from the dashboard
    group_id = '9c807498-a3c0-45f3-9421-dac642849aff'
    print(f"✅ Using group ID: {group_id}")
    
    print(f"✅ Using existing user ID: {test_user_id}")
    print(f"✅ Using existing group ID: {group_id}")
    print()
    
    # Create text shares for Day 1-6
    print("📝 Creating text shares...")
    text_shares = [
        {
            'user_id': test_user_id,
            'group_id': group_id,
            'day_number': 1,
            'content': '今天學習了營養學的基礎概念，了解到營養素與人體健康的密切關係。營養學真的是一門令人著迷的科學！',
            'created_at': (datetime.now() - timedelta(days=5)).isoformat()
        },
        {
            'user_id': test_user_id,
            'group_id': group_id,
            'day_number': 2,
            'content': '早餐增加蛋白質的建議很實用！今天試了雞蛋配牛奶，確實更有飽足感，到中午都不會餓。',
            'created_at': (datetime.now() - timedelta(days=4)).isoformat()
        },
        {
            'user_id': test_user_id,
            'group_id': group_id,
            'day_number': 3,
            'content': '保持年輕的竅門原來和營養息息相關。抗氧化物質真的很重要，要多吃彩色蔬果！',
            'created_at': (datetime.now() - timedelta(days=3)).isoformat()
        },
        {
            'user_id': test_user_id,
            'group_id': group_id,
            'day_number': 4,
            'content': '常見營養素的價值被低估了。維生素C不只是預防感冒，對膠原蛋白合成也很重要。',
            'created_at': (datetime.now() - timedelta(days=2)).isoformat()
        },
        {
            'user_id': test_user_id,
            'group_id': group_id,
            'day_number': 5,
            'content': '糖的泛濫問題真的很嚴重。現在開始注意隱藏糖分，連調味料都要小心選擇。',
            'created_at': (datetime.now() - timedelta(days=1)).isoformat()
        },
        {
            'user_id': test_user_id,
            'group_id': group_id,
            'day_number': 6,
            'content': '杏子的營養價值很高，特別是維生素A含量豐富。不同品種的杏子各有特色，很有趣！',
            'created_at': datetime.now().isoformat()
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
    
    print()
    
    # Create food logs for Day 1-6
    print("🍽️ Creating food logs...")
    demo_images = [
        '/demo-images/breakfast-1.jpg',
        '/demo-images/breakfast-2.jpg', 
        '/demo-images/lunch-1.jpg',
        '/demo-images/lunch-2.jpg',
        '/demo-images/dinner-1.jpg',
        '/demo-images/dinner-2.jpg'
    ]
    
    food_count = 0
    for day in range(1, 7):
        try:
            food_log_data = {
                'user_id': test_user_id,
                'group_id': group_id,
                'image_url': demo_images[day-1],
                'detected_foods': [
                    {'name': f'食物{day}', 'description': f'第{day}天的食物', 'portion': f'{day*100}g'}
                ],
                'user_input': f'第{day}天的食物記錄',
                'created_at': (datetime.now() - timedelta(days=6-day)).isoformat()
            }
            
            result = supabase.table('food_logs').insert(food_log_data).execute()
            if result.data:
                food_log_id = result.data[0]['id']
                
                # Insert food log items
                food_items = [{
                    'food_log_id': food_log_id,
                    'user_id': test_user_id,
                    'name': f'食物{day}',
                    'description': f'第{day}天的食物',
                    'portion': f'{day*100}g'
                }]
                
                supabase.table('food_log_items').insert(food_items).execute()
                print(f"  ✅ Day {day} food log created")
                food_count += 1
                
        except Exception as e:
            print(f"  ❌ Day {day} food log failed: {e}")
    
    print()
    
    # Create quiz responses for Day 1-6 using the save_quiz_response function
    print("🧠 Creating quiz responses...")
    quiz_count = 0
    for day in range(1, 7):
        try:
            # Use the save_quiz_response function
            result = supabase.rpc('save_quiz_response', {
                'p_user_id': test_user_id,
                'p_day_number': day,
                'p_score': random.randint(2, 3),
                'p_total_questions': 3
            }).execute()
            
            if result.data is not None:
                print(f"  ✅ Day {day} quiz response created (Score: {random.randint(2, 3)}/3)")
                quiz_count += 1
            else:
                print(f"  ❌ Day {day} quiz response failed: {result}")
                
        except Exception as e:
            print(f"  ❌ Day {day} quiz response failed: {e}")
    
    # Summary
    print()
    print("=" * 60)
    print("✅ Test Data Creation Complete!")
    print(f"   Text Shares: {text_count}/6")
    print(f"   Food Logs: {food_count}/6")
    print(f"   Quiz Responses: {quiz_count}/6")
    print("=" * 60)
    
    if text_count == 6 and food_count == 6 and quiz_count == 6:
        print("🎉 All test data created successfully!")
        print("User now has complete activity data for Day 1-6")
    else:
        print("⚠️ Some data creation failed. Check the errors above.")

if __name__ == "__main__":
    main()
