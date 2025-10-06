#!/usr/bin/env python3

import os
from supabase import create_client, Client

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Initialize Supabase client
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

def debug_quiz_data():
    print("🔍 Debugging Day 6 Quiz Data Structure")
    print("=" * 50)
    
    # Fetch Day 6 quiz data
    result = supabase.table('quizzes').select('*').eq('day_number', 6).single().execute()
    
    if result.data:
        quiz = result.data
        print(f"Quiz ID: {quiz['id']}")
        print(f"Day Number: {quiz['day_number']}")
        print(f"Questions Type: {type(quiz['questions'])}")
        
        # Parse questions if it's a string
        questions = quiz['questions']
        if isinstance(questions, str):
            import json
            questions = json.loads(questions)
        
        print(f"Parsed Questions Type: {type(questions)}")
        print(f"Number of Questions: {len(questions) if isinstance(questions, list) else 'Not a list'}")
        
        if isinstance(questions, list):
            for i, question in enumerate(questions):
                print(f"\n--- Question {i+1} ---")
                print(f"Question: {question.get('question', 'N/A')}")
                print(f"Options: {question.get('options', 'N/A')}")
                print(f"Correct Answer: {question.get('correct_answer', 'N/A')}")
                print(f"Correct Answer Type: {type(question.get('correct_answer', 'N/A'))}")
                
                # Check if options is a dict
                options = question.get('options', {})
                if isinstance(options, dict):
                    print("Options breakdown:")
                    for key, value in options.items():
                        print(f"  {key}: {value}")
    else:
        print("No quiz data found for Day 6")

if __name__ == "__main__":
    debug_quiz_data()
