"""
Generate Quizzes Using Gemini AI
=================================
This script generates 3 multiple-choice questions for each of the 21 days
using Google's Gemini AI model, based on the book content.

What it does:
1. Fetches all daily content from Supabase
2. For each day, sends content to Gemini API
3. Gemini generates 3 quiz questions in Chinese
4. Saves the questions to Supabase 'quizzes' table

Time: ~5-7 minutes (due to API rate limiting)
Cost: ~$1-2 one-time
"""

import os
import google.generativeai as genai
from supabase import create_client, Client
import json
import time
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ====== CONFIGURATION ======
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Validate that environment variables are set
if not GEMINI_API_KEY or not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "Missing environment variables! "
        "Make sure GEMINI_API_KEY, SUPABASE_URL, and SUPABASE_KEY are set in .env file"
    )

# Gemini model to use (flash is faster and cheaper)
MODEL_NAME = 'gemini-2.0-flash-exp'

# ====== MAIN SCRIPT ======

def generate_quiz_for_day(day_number: int, content: str, title: str):
    """
    Generate quiz questions using Gemini AI.
    
    Args:
        day_number: Day number (1-21)
        content: Full book content for that day
        title: Title of the day's content
    
    Returns:
        Dictionary with quiz questions, or None if failed
    """
    
    # Prompt for Gemini - instructs it how to generate quizzes
    prompt = f"""
根據以下營養書籍的第{day_number}天內容，生成3道繁體中文的多項選擇題。

標題：{title}

書籍內容：
{content}

要求：
1. 每題有4個選項（A、B、C、D）
2. 清楚標註正確答案
3. 題目要測試對核心概念的理解，不只是文字記憶
4. 難度適中，適合一般讀者
5. 提供簡短的答案解釋
6. 嚴格返回JSON格式，不要有markdown代碼塊或其他文字

JSON格式範例：
{{
  "questions": [
    {{
      "question": "問題內容？",
      "options": ["A. 選項1", "B. 選項2", "C. 選項3", "D. 選項4"],
      "correct_answer": "A",
      "explanation": "為什麼這個答案正確的簡短解釋"
    }}
  ]
}}
"""
    
    try:
        # Call Gemini API
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        
        # Parse JSON from response
        text = response.text.strip()
        
        # Remove markdown code blocks if Gemini added them
        if text.startswith('```'):
            # Extract content between ``` markers
            parts = text.split('```')
            if len(parts) >= 2:
                text = parts[1]
                # Remove language identifier (json, JSON, etc)
                if text.startswith('json') or text.startswith('JSON'):
                    text = text[4:].strip()
        
        text = text.strip()
        
        # Parse JSON
        quiz_data = json.loads(text)
        
        # Validate structure
        if 'questions' not in quiz_data:
            print(f"    ⚠️  Warning: No 'questions' key in response")
            return None
        
        if len(quiz_data['questions']) < 3:
            print(f"    ⚠️  Warning: Only {len(quiz_data['questions'])} questions generated")
        
        return quiz_data
        
    except json.JSONDecodeError as e:
        print(f"    ✗ JSON parsing error: {e}")
        print(f"    Response: {text[:200]}...")
        return None
    except Exception as e:
        print(f"    ✗ Error: {e}")
        return None


def generate_all_quizzes():
    """Generate quizzes for all 21 days"""
    
    # Initialize clients
    genai.configure(api_key=GEMINI_API_KEY)
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print("📚 Fetching book content from Supabase...\n")
    
    # Get all content from Supabase
    try:
        result = supabase.table('daily_content').select('*').order('day_number').execute()
        contents = result.data
    except Exception as e:
        print(f"❌ Error fetching content: {e}")
        print("Make sure you've run 'import_book_content.py' first!")
        return
    
    if len(contents) == 0:
        print("❌ No content found in database!")
        print("Run 'import_book_content.py' first to import the book content.")
        return
    
    print(f"Found {len(contents)} days of content")
    print(f"Generating quizzes (this takes ~5 minutes)...\n")
    
    success_count = 0
    failed_days = []
    
    for content_item in contents:
        day = content_item['day_number']
        title = content_item['title']
        content_text = content_item['content']
        
        print(f"📝 Day {day:2d}: {title[:40]}...")
        
        # Generate quiz
        quiz_data = generate_quiz_for_day(day, content_text, title)
        
        if quiz_data:
            # Save to Supabase
            db_data = {
                "day_number": day,
                "questions": quiz_data
            }
            
            try:
                supabase.table('quizzes').upsert(db_data).execute()
                num_questions = len(quiz_data.get('questions', []))
                print(f"    ✓ Saved {num_questions} questions\n")
                success_count += 1
            except Exception as e:
                print(f"    ✗ Database error: {e}\n")
                failed_days.append(day)
        else:
            print(f"    ✗ Failed to generate quiz\n")
            failed_days.append(day)
        
        # Rate limiting: wait 2 seconds between API calls
        # This prevents hitting Gemini API rate limits
        time.sleep(2)
    
    print("=" * 50)
    print(f"✅ Quiz generation complete!")
    print(f"   Success: {success_count}/{len(contents)} days")
    if failed_days:
        print(f"   Failed days: {failed_days}")
    print("=" * 50)


if __name__ == "__main__":
    print("=" * 50)
    print("  Generate Quizzes with Gemini AI")
    print("=" * 50)
    print()
    
    generate_all_quizzes()

