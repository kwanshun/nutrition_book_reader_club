"""
Fix Day 20 Quiz
================
Regenerate quiz for Day 20 that failed during initial generation
"""

import os
import google.generativeai as genai
from supabase import create_client, Client
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize clients
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-exp')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fix_day_20():
    """Regenerate quiz for Day 20"""
    
    print("🔧 Fixing Day 20 Quiz\n")
    
    # Get Day 20 content
    result = supabase.table('daily_content').select('*').eq('day_number', 20).single().execute()
    content_item = result.data
    
    title = content_item['title']
    content = content_item['content']
    
    print(f"📖 Content: {title}")
    print(f"📝 Generating quiz...\n")
    
    # Generate quiz with more explicit JSON formatting
    prompt = f"""
根據以下營養書籍內容，生成3道繁體中文的多項選擇題。

標題：{title}

書籍內容：
{content}

要求：
1. 每題有4個選項（A、B、C、D）
2. 清楚標註正確答案
3. 題目要測試對核心概念的理解
4. 難度適中，適合一般讀者
5. 提供簡短的答案解釋
6. **重要**: 返回純JSON格式，不要有任何markdown語法或額外文字

JSON格式（嚴格遵守）：
{{
  "questions": [
    {{
      "question": "問題內容？",
      "options": [
        "A. 選項1",
        "B. 選項2",
        "C. 選項3",
        "D. 選項4"
      ],
      "correct_answer": "A",
      "explanation": "為什麼這個答案正確的簡短解釋"
    }}
  ]
}}

確保options是一個陣列，每個元素是完整的字串。
"""
    
    try:
        # Try multiple times if needed
        for attempt in range(3):
            response = model.generate_content(prompt)
            text = response.text.strip()
            
            # Clean up response
            if text.startswith('```'):
                parts = text.split('```')
                if len(parts) >= 2:
                    text = parts[1]
                    if text.startswith('json') or text.startswith('JSON'):
                        text = text[4:].strip()
            
            text = text.strip()
            
            try:
                # Try to parse
                quiz_data = json.loads(text)
                
                # Validate structure
                if 'questions' in quiz_data and len(quiz_data['questions']) >= 3:
                    # Success! Save to database
                    db_data = {
                        "day_number": 20,
                        "questions": quiz_data
                    }
                    
                    supabase.table('quizzes').upsert(db_data).execute()
                    
                    print(f"✅ Successfully generated and saved Day 20 quiz!")
                    print(f"   {len(quiz_data['questions'])} questions created\n")
                    
                    # Show sample question
                    q1 = quiz_data['questions'][0]
                    print("📝 Sample Question:")
                    print(f"   {q1['question']}")
                    print(f"\n   Options:")
                    for opt in q1['options']:
                        print(f"   {opt}")
                    print(f"\n   Answer: {q1['correct_answer']}")
                    
                    return True
                else:
                    print(f"   Attempt {attempt + 1}: Invalid structure, retrying...")
                    
            except json.JSONDecodeError as e:
                print(f"   Attempt {attempt + 1}: JSON error, retrying...")
                if attempt == 2:
                    print(f"\n❌ Failed after 3 attempts")
                    print(f"   Last response: {text[:200]}...")
                    return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("  Fix Day 20 Quiz")
    print("="*60)
    print()
    
    success = fix_day_20()
    
    print()
    print("="*60)
    if success:
        print("🎉 Day 20 quiz fixed successfully!")
    else:
        print("⚠️  Could not fix Day 20 quiz automatically")
        print("   You may need to create it manually or try again later")
    print("="*60)

