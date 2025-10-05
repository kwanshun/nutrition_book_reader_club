# Quick Start Guide

**Use this file to quickly resume development in your next session.**

---

## 🎯 Current Status

✅ **Phase 0 Complete** - Database ready with all content and quizzes  
✅ **Phase 1 In Progress** - Next.js frontend with core features  
✅ **Latest**: Group Chat with Real-time messaging implemented  
🚀 **Next**: Test chat feature and implement announcements

---

## 📋 What's Already Done

- ✅ 21 days of book content in Supabase
- ✅ 63 AI-generated quizzes
- ✅ Database tables created with security
- ✅ API credentials secured in `.env`
- ✅ Python scripts working
- ✅ **NEW**: Next.js frontend with TypeScript + Tailwind CSS
- ✅ **NEW**: Authentication system (login/register/logout)
- ✅ **NEW**: Daily content display with navigation
- ✅ **NEW**: Interactive quiz system with scoring
- ✅ **NEW**: Text sharing feature (daily learning reflections)
- ✅ **NEW**: Food photo upload with AI recognition (Gemini Vision)
- ✅ **NEW**: 21-day progress dashboard with activity tracking
- ✅ **NEW**: Group chat with real-time messaging (Supabase Realtime)
- ✅ **NEW**: Mobile-responsive dashboard
- ✅ **NEW**: Chinese language interface

---

## 🚀 Resume Development (2 minutes)

### Step 1: Navigate to Project
```bash
cd /Users/andywong/Library/CloudStorage/SynologyDrive-home/1_Project/nutrition_book_reader_club
```

### Step 2: Start Frontend Development Server
```bash
cd frontend
npm run dev
```

**Expected Output**: 
- Server running on http://localhost:3000 (or 3001/3002 if 3000 is busy)
- Ready in ~2-4 seconds

### Step 3: Test the App
1. Open browser to http://localhost:3000
2. Register a new account or login
3. Navigate through the dashboard
4. Test content reading and quiz features

---

## 🔑 API Credentials Location

All credentials are in `.env` file:
- Supabase URL & Key
- Gemini API Key

**Never commit this file to git!** (protected by `.gitignore`)

---

## 📊 Database Access

**Supabase Dashboard**: https://app.supabase.com
- Project: nutrition_book_reader_club
- Database password: `cknbooka70$`

**Quick checks:**
- Table Editor → See all tables
- SQL Editor → Run queries
- Authentication → Manage users (when frontend is ready)

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `PROGRESS.md` | Detailed progress report |
| `MVP.md` | 3-week MVP plan |
| `docs/group_chat_guide.md` | Chat feature setup and usage |
| `docs/food_image_recognition_guide.md` | Food recognition setup |
| `background_info.txt` | Original requirements (Chinese) |
| `scripts/verify_data.py` | Check database status |
| `scripts/setup_test_group.sql` | Create test group for chat |
| `.env` | API credentials (DO NOT COMMIT) |

---

## 🎯 Next Steps

### Option 1: Start Frontend Now
```bash
# Create Next.js app
npx create-next-app@latest frontend --typescript --tailwind --app

# Tell AI assistant: "Let's start building the Next.js frontend"
```

### Option 2: Plan First
Tell AI assistant:
> "Create a detailed plan for the Next.js frontend structure"

### Option 3: Review & Adjust
Tell AI assistant:
> "Let's review the MVP features and adjust priorities"

---

## 💡 Helpful Commands

```bash
# Check Python packages
pip list

# View database tables (in Python)
python
>>> from supabase import create_client
>>> import os
>>> from dotenv import load_dotenv
>>> load_dotenv()
>>> supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
>>> result = supabase.table('daily_content').select('day_number, title').execute()
>>> print(result.data)
```

---

## 🐛 Troubleshooting

### "Module not found" error
```bash
source venv/bin/activate
pip install -r scripts/requirements.txt
```

### "No .env file" error
Check that `.env` exists in project root with your credentials

### Supabase connection error
- Check `.env` has correct URL and key
- Verify internet connection
- Check Supabase dashboard is accessible

### Authentication issues
- **"Email not confirmed" error**: User needs to check email and click confirmation link
- **"Invalid login credentials"**: Check email/password spelling
- **Registration fails**: Check if email already exists in Supabase dashboard
- **Callback route 404**: Ensure `/app/auth/callback/route.ts` exists

### Chat issues
- **"尚未加入群組"**: Run `scripts/setup_test_group.sql` in Supabase SQL Editor
- **Messages not real-time**: Enable Realtime for `chat_messages` table in Supabase Dashboard → Database → Replication
- **Cannot send messages**: Verify user is in `group_members` table
- **See detailed guide**: `docs/group_chat_guide.md`

---

## 📞 Contact & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Auth Guide**: https://supabase.com/docs/guides/auth (Essential for email confirmation)
- **Next.js Docs**: https://nextjs.org/docs
- **Gemini API Docs**: https://ai.google.dev/docs

### 🔐 Authentication Notes (Important!)
- **Email confirmation is required** by default in Supabase
- **Users must confirm email** before they can login
- **Callback route needed**: `/auth/callback` for email confirmation
- **Error handling**: "Email not confirmed" means user needs to check email

---

## ⏰ Time Estimates

- **Review current progress**: 10 minutes
- **Set up Next.js project**: 15 minutes
- **Build authentication pages**: 2-3 hours
- **Complete MVP frontend**: 3 weeks

---

**Ready to continue? Start with: "Let's build the frontend!"** 🚀

