# Data Import Scripts

These scripts prepare your Supabase database with book content and AI-generated quizzes.

## 📋 Prerequisites

1. **Supabase Project Setup**
   - Create tables using the SQL provided
   - Get your project URL and anon key

2. **Python Environment**
   ```bash
   cd /Users/andywong/Library/CloudStorage/SynologyDrive-home/1_Project/nutrition_book_reader_club
   python3 -m venv venv
   source venv/bin/activate
   pip install -r scripts/requirements.txt
   ```

3. **API Keys Ready**
   - Supabase URL
   - Supabase Anon Key
   - Google Gemini API Key

## 🚀 Usage

### Step 1: Configure Environment Variables

All credentials are stored in `.env` file (already created with your keys).

**Security Note:** The `.env` file contains sensitive keys and is excluded from git via `.gitignore`.

If you need to update credentials, edit the `.env` file:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

### Step 2: Run Scripts in Order

```bash
# 1. Import book content (30 seconds)
python scripts/import_book_content.py

# 2. Generate quizzes (5-7 minutes)
python scripts/generate_all_quizzes.py

# 3. Verify everything (30 seconds)
python scripts/verify_data.py
```

## 📁 Script Details

### 1. `import_book_content.py`
- **Purpose**: Import 21 markdown files to Supabase
- **Time**: ~30 seconds
- **Output**: 21 entries in `daily_content` table

### 2. `generate_all_quizzes.py`
- **Purpose**: Generate quizzes using Gemini AI
- **Time**: ~5-7 minutes (2-second delay between API calls)
- **Cost**: ~$1-2 one-time
- **Output**: 21 quizzes in `quizzes` table (~3 questions each)

### 3. `verify_data.py`
- **Purpose**: Check data quality and completeness
- **Time**: ~30 seconds
- **Output**: Summary report + sample quiz

## ✅ Expected Results

After running all scripts:
```
📚 Book Content: 21/21 days ✓
❓ Quizzes: 21/21 days ✓
📝 Total Questions: ~63 questions
```

## 🔧 Troubleshooting

### "No files found"
- Check the `CKN book content` folder exists
- Verify markdown files are named: `第*天*.md`

### "Error fetching content"
- Verify Supabase credentials are correct
- Check that tables exist in your database

### "JSON parsing error"
- Gemini sometimes adds extra text
- Script handles most cases automatically
- Re-run for failed days

### "Rate limit error"
- Increase `time.sleep(2)` to `time.sleep(5)` in generate_all_quizzes.py
- Or run script multiple times for failed days

## 💡 Tips

- Run scripts from project root directory
- Keep terminal output for reference
- Check Supabase dashboard to see data appear
- Sample quiz in verify output shows quality

## 🎯 Next Steps

After successful verification:
1. ✅ Data is ready in Supabase
2. 🚀 Start building the Next.js frontend
3. 📱 Begin with authentication page
4. 📚 Then daily content display
5. ❓ Then quiz interface

