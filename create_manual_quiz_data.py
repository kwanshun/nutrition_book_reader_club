#!/usr/bin/env python3
"""
Create Manual Quiz Data
======================
Since the AI generation failed due to quota limits, create basic quiz data manually
to fix the quiz page accessibility issue.
"""

import os
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

def create_quiz_data():
    """Create basic quiz data for all 21 days"""
    
    print("🔧 Creating Manual Quiz Data")
    print("=" * 50)
    
    # Sample quiz questions for each day
    quiz_templates = [
        {
            "question": "營養學的主要目的是什麼？",
            "options": ["A. 研究食物成分", "B. 促進健康", "C. 治療疾病", "D. 減肥"],
            "correct_answer": "B",
            "explanation": "營養學的主要目的是通過科學研究來促進人類健康。"
        },
        {
            "question": "哪種營養素對身體最重要？",
            "options": ["A. 蛋白質", "B. 碳水化合物", "C. 維生素", "D. 所有營養素都重要"],
            "correct_answer": "D",
            "explanation": "所有營養素都有其獨特的功能，缺一不可。"
        },
        {
            "question": "健康飲食的關鍵是什麼？",
            "options": ["A. 只吃蔬菜", "B. 均衡攝取", "C. 少吃肉類", "D. 多喝水"],
            "correct_answer": "B",
            "explanation": "均衡攝取各種營養素是健康飲食的關鍵。"
        }
    ]
    
    success_count = 0
    
    for day in range(1, 22):
        print(f"📝 Creating quiz for Day {day}...")
        
        # Create quiz data with 3 questions
        quiz_data = {
            "questions": quiz_templates
        }
        
        try:
            # Insert quiz data
            result = supabase.table('quizzes').upsert({
                "day_number": day,
                "questions": quiz_data
            }).execute()
            
            if result.data:
                print(f"    ✅ Day {day} quiz created")
                success_count += 1
            else:
                print(f"    ❌ Day {day} failed")
                
        except Exception as e:
            print(f"    ❌ Day {day} error: {e}")
    
    print("\n" + "=" * 50)
    print(f"✅ Manual quiz creation complete!")
    print(f"   Success: {success_count}/21 days")
    print("=" * 50)
    
    if success_count > 0:
        print("\n🎉 Quiz page should now be accessible!")
        print("   Go to http://localhost:3000/quiz to test")

if __name__ == "__main__":
    create_quiz_data()
