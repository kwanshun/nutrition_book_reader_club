#!/usr/bin/env python3
"""
Generate Quizzes Using DeepSeek AI
==================================
This script generates 3 multiple-choice questions for each of the 21 days
using DeepSeek's API, based on the book content.

What it does:
1. Fetches all daily content from Supabase
2. For each day, sends content to DeepSeek API
3. DeepSeek generates 3 quiz questions in Chinese
4. Saves the questions to Supabase 'quizzes' table

Time: ~3-5 minutes (due to API rate limiting)
Cost: ~$0.50-1.00 one-time
"""

import os
import requests
import json
import time
from supabase import create_client, Client
from dotenv import load_dotenv
import re

# Load environment variables from .env file
load_dotenv()

# ====== CONFIGURATION ======
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Validate that environment variables are set
if not DEEPSEEK_API_KEY or not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "Missing environment variables! "
        "Make sure DEEPSEEK_API_KEY, SUPABASE_URL, and SUPABASE_KEY are set in .env file"
    )

# DeepSeek API configuration
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
MODEL_NAME = "deepseek-chat"

# ====== MAIN SCRIPT ======

def generate_quiz_for_day(day_number: int, content: str, title: str):
    """
    Generate quiz questions using DeepSeek AI.
    
    Args:
        day_number: Day number (1-21)
        content: Full book content for that day
        title: Title of the day's content
    
    Returns:
        Dictionary with quiz questions, or None if failed
    """
    
    # Prompt for DeepSeek - instructs it how to generate quizzes
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
5. 提供詳細的答案解釋，說明為什麼這個答案是正確的
6. 嚴格返回JSON格式，不要有markdown代碼塊或其他文字

JSON格式範例：
{{
  "questions": [
    {{
      "question": "為什麼作者強調蔬菜需要經過切割、烹飪或咀嚼才能更好地吸收胡蘿蔔素？",
      "options": [
        "A. 為了讓蔬菜更好吃",
        "B. 因為胡蘿蔔素被鎖在纖維素構成的細胞壁中，需要破壞細胞壁才能釋放",
        "C. 為了殺死蔬菜上的細菌",
        "D. 因為生吃蔬菜會導致維生素A中毒"
      ],
      "correct_answer": "B",
      "explanation": "胡蘿蔔素存儲在纖維素構成的細胞壁中，人體無法消化纖維素，只有通過切割、烹飪或咀嚼破壞細胞壁後，胡蘿蔔素才能被釋放和吸收。"
    }},
    {{
      "question": "根據文章，為什麼飲食中脂肪含量過低會影響維生素A的吸收？",
      "options": [
        "A. 脂肪會直接破壞維生素A",
        "B. 維生素A和胡蘿蔔素需要與膽鹽結合才能吸收，而膽汁分泌需要脂肪刺激",
        "C. 脂肪會阻礙維生素A的運輸",
        "D. 脂肪會讓維生素A變質"
      ],
      "correct_answer": "B",
      "explanation": "在小腸內，維生素A和胡蘿蔔素必須與膽鹽結合後才能進入血液，如果飲食脂肪含量很低，膽汁分泌不足，就會導致大部分維生素A和胡蘿蔔素無法被吸收而流失。"
    }}
  ]
}}
"""
    
    try:
        # Prepare request headers
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Prepare request payload
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 2000,
            "stream": False
        }
        
        # Call DeepSeek API
        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        
        # Parse response
        response_data = response.json()
        response_text = response_data['choices'][0]['message']['content']
        
        # Extract the correct answer key and ensure it's a single letter
        match = re.search(r'"correct_answer":\s*"([A-D])"', response_text)
        if not match:
            print(f"Error: Could not find a valid correct_answer (A-D) in response for day {day_number}.")
            return None
        
        try:
            quiz_data = json.loads(response_text)
        except json.JSONDecodeError:
            print(f"Error: Failed to decode JSON for day {day_number}.")
            print(f"Response: {response_text[:200]}...")
            return None

        # Ensure correct_answer is just the single letter
        for question in quiz_data.get('questions', []):
            if 'correct_answer' in question:
                question['correct_answer'] = match.group(1)

        return quiz_data['questions']
        
    except requests.exceptions.RequestException as e:
        print(f"    ✗ API request error: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"    ✗ JSON parsing error: {e}")
        print(f"    Response: {response_text[:200]}...")
        return None
    except Exception as e:
        print(f"    ✗ Error: {e}")
        return None


def generate_all_quizzes():
    """Generate quizzes for all 21 days using DeepSeek"""
    
    # Initialize Supabase client
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
    print(f"Generating quizzes using DeepSeek (this takes ~3-5 minutes)...\n")
    
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
                "questions": {"questions": quiz_data}
            }
            
            try:
                supabase.table('quizzes').upsert(db_data).execute()
                num_questions = len(quiz_data)
                print(f"    ✓ Saved {num_questions} questions\n")
                success_count += 1
            except Exception as e:
                print(f"    ✗ Database error: {e}\n")
                failed_days.append(day)
        else:
            print(f"    ✗ Failed to generate quiz\n")
            failed_days.append(day)
        
        # Rate limiting: wait 1 second between API calls
        # DeepSeek has more generous rate limits than Gemini
        time.sleep(1)
    
    print("=" * 50)
    print(f"✅ Quiz generation complete!")
    print(f"   Success: {success_count}/{len(contents)} days")
    if failed_days:
        print(f"   Failed days: {failed_days}")
    print("=" * 50)


if __name__ == "__main__":
    print("=" * 50)
    print("  Generate Quizzes with DeepSeek AI")
    print("=" * 50)
    print()
    
    generate_all_quizzes()
