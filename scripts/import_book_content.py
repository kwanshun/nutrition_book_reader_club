"""
Import Book Content to Supabase
================================
This script reads all 21 markdown files from 'CKN book content' folder
and imports them into Supabase 'daily_content' table.

What it does:
1. Scans the folder for all Day files (第*天*.md)
2. Extracts the title from each file
3. Uploads content to Supabase with day number (1-21)

Time: ~3 minutes to run
"""

import os
import re
from pathlib import Path
from supabase import create_client, Client
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

# Path to book content folder
CONTENT_DIR = Path(__file__).parent.parent / "CKN book content"

# ====== MAIN SCRIPT ======

def extract_title(content: str) -> str:
    """
    Extract title from markdown content.
    Looks for lines starting with ### (markdown heading)
    """
    lines = content.split('\n')
    for line in lines:
        if line.strip().startswith('###'):
            return line.replace('###', '').strip()
    return "未命名"  # Fallback if no title found


def extract_day_number(filename: str) -> int:
    """
    Extract day number from filename like '第10天：降低血液膽固醇.md'
    Returns the lesson number from the filename
    """
    match = re.search(r'第(\d+)天', filename)
    if match:
        return int(match.group(1))
    return 1  # Fallback if no number found


def import_all_content():
    """Import all 21 markdown files to Supabase"""
    
    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Get all markdown files that match pattern
    files = sorted([f for f in CONTENT_DIR.glob("第*天*.md")])
    
    print(f"📁 Found {len(files)} files in '{CONTENT_DIR.name}' folder\n")
    
    if len(files) == 0:
        print("❌ No files found! Check the folder path.")
        return
    
    success_count = 0
    
    # First, clear existing content
    print("🗑️  Clearing existing daily_content...")
    try:
        # Delete all records from daily_content table
        supabase.table('daily_content').delete().gte('id', '00000000-0000-0000-0000-000000000000').execute()
        print("✓ Existing content cleared")
    except Exception as e:
        print(f"⚠️  Warning: Could not clear existing content - {e}")
    
    print()
    
    for filepath in files:
        try:
            # Read file content
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract title and day number
            title = extract_title(content)
            day_number = extract_day_number(filepath.name)
            
            # Prepare data for Supabase
            data = {
                "day_number": day_number,
                "title": title,
                "content": content
            }
            
            # Insert/Update in Supabase (upsert = insert or update if exists)
            result = supabase.table('daily_content').upsert(data).execute()
            
            print(f"✓ Day {day_number:2d}: {title}")
            success_count += 1
            
        except Exception as e:
            print(f"✗ {filepath.name}: Failed - {e}")
    
    print(f"\n{'='*50}")
    print(f"✅ Successfully imported {success_count}/{len(files)} files")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    print("=" * 50)
    print("  Import Book Content to Supabase")
    print("=" * 50)
    print()
    
    import_all_content()

