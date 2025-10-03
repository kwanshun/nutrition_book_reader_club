"""
Verify Data in Supabase
========================
This script checks that all data was imported correctly:
- 21 days of book content
- 21 quizzes with questions
- Shows a sample quiz for quality check

Time: ~30 seconds to run
"""

import os
from supabase import create_client, Client
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ====== CONFIGURATION ======
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Validate that environment variables are set
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "Missing environment variables! "
        "Make sure SUPABASE_URL and SUPABASE_KEY are set in .env file"
    )

# ====== MAIN SCRIPT ======

def verify_all_data():
    """Check that all data is properly imported"""
    
    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print("🔍 Checking data in Supabase...\n")
    
    # ===== Check Daily Content =====
    try:
        content_result = supabase.table('daily_content').select('day_number, title').execute()
        content_data = content_result.data
        
        print("=" * 60)
        print("📚 DAILY CONTENT")
        print("=" * 60)
        print(f"Total entries: {len(content_data)}/21")
        
        if len(content_data) < 21:
            existing_days = {c['day_number'] for c in content_data}
            missing = sorted(set(range(1, 22)) - existing_days)
            print(f"❌ Missing days: {missing}")
        else:
            print(f"✅ All 21 days present")
        
        # Show first 5 entries
        print("\nSample entries:")
        for item in content_data[:5]:
            print(f"  Day {item['day_number']:2d}: {item['title']}")
        if len(content_data) > 5:
            print(f"  ... and {len(content_data) - 5} more")
            
    except Exception as e:
        print(f"❌ Error checking content: {e}")
        content_data = []
    
    print()
    
    # ===== Check Quizzes =====
    try:
        quiz_result = supabase.table('quizzes').select('day_number, questions').execute()
        quiz_data = quiz_result.data
        
        print("=" * 60)
        print("❓ QUIZZES")
        print("=" * 60)
        print(f"Total quizzes: {len(quiz_data)}/21")
        
        if len(quiz_data) < 21:
            existing_days = {q['day_number'] for q in quiz_data}
            missing = sorted(set(range(1, 22)) - existing_days)
            print(f"❌ Missing quizzes for days: {missing}")
        else:
            print(f"✅ All 21 quizzes present")
        
        # Count total questions
        total_questions = sum(
            len(q['questions'].get('questions', [])) 
            for q in quiz_data
        )
        print(f"\nTotal questions: {total_questions} (expected: ~63)")
        
    except Exception as e:
        print(f"❌ Error checking quizzes: {e}")
        quiz_data = []
    
    print()
    
    # ===== Show Sample Quiz =====
    if quiz_data:
        print("=" * 60)
        print("📝 SAMPLE QUIZ (Day 3)")
        print("=" * 60)
        
        sample = next((q for q in quiz_data if q['day_number'] == 3), quiz_data[0])
        questions = sample['questions'].get('questions', [])
        
        if questions:
            q1 = questions[0]
            print(f"\nQuestion: {q1.get('question', 'N/A')}")
            print(f"\nOptions:")
            for option in q1.get('options', []):
                print(f"  {option}")
            print(f"\nCorrect Answer: {q1.get('correct_answer', 'N/A')}")
            print(f"Explanation: {q1.get('explanation', 'N/A')}")
            
            if len(questions) > 1:
                print(f"\n(Quiz has {len(questions)} questions total)")
        else:
            print("⚠️  No questions found in this quiz")
    
    print()
    print("=" * 60)
    print("✅ VERIFICATION COMPLETE")
    print("=" * 60)
    
    # Summary
    print("\nSummary:")
    print(f"  📚 Book Content: {len(content_data)}/21 days")
    print(f"  ❓ Quizzes: {len(quiz_data)}/21 days")
    
    if len(content_data) == 21 and len(quiz_data) == 21:
        print("\n🎉 All data imported successfully!")
        print("   You're ready to start building the frontend!")
    else:
        print("\n⚠️  Some data is missing. Re-run the import scripts.")


if __name__ == "__main__":
    print("=" * 60)
    print("  Data Verification Tool")
    print("=" * 60)
    print()
    
    verify_all_data()

