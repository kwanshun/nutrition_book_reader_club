# Deployment Guide - Vercel

This guide will help you deploy your Nutrition Book Reader Club app to Vercel.

## Prerequisites

1. GitHub account (you already have this ✅)
2. Vercel account (free) - Sign up at https://vercel.com
3. Your code is already pushed to GitHub ✅

## Step-by-Step Deployment

### 1. Sign Up / Login to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub repositories

### 2. Import Your Project

1. On Vercel Dashboard, click "Add New..." → "Project"
2. Find `nutrition_book_reader_club` in your repository list
3. Click "Import"

### 3. Configure Project Settings

**Root Directory:**
- Set to `frontend` (since your Next.js app is in the frontend folder)

**Framework Preset:**
- Should auto-detect as "Next.js" ✅

**Build Command:**
- `npm run build` (default, should be auto-filled)

**Output Directory:**
- `.next` (default, should be auto-filled)

**Install Command:**
- `npm install` (default, should be auto-filled)

### 4. Add Environment Variables

Click "Environment Variables" and add these (from your `frontend/.env.local`):

**Required Variables:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://bnkgdcbwkcervkmpuhqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJua2dkY2J3a2NlcnZrbXB1aHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Nzc2ODksImV4cCI6MjA3NTA1MzY4OX0.iwQmc37bIY8Fi8jiBsscLbbMeiLxUV6Pos_1kR7KVms
SUPABASE_SERVICE_ROLE_KEY=[your service role key from .env.local]
GEMINI_API_KEY=[your Gemini API key from .env.local]
```

⚠️ **IMPORTANT:** Make sure to copy these values exactly from your local `.env.local` file!

### 5. Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes for the build to complete
3. You'll get a URL like: `https://nutrition-book-reader-club.vercel.app`

### 6. Configure Supabase for Production

After deployment, you need to update Supabase settings:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to "Redirect URLs":
   ```
   https://your-app-name.vercel.app/auth/callback
   ```
3. Add to "Site URL":
   ```
   https://your-app-name.vercel.app
   ```

### 7. Enable Realtime (if not already enabled)

1. Go to Supabase Dashboard → Database → Replication
2. Click on "supabase_realtime" publication
3. Make sure `chat_messages` table is toggled ON

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Can register new user
- [ ] Can login
- [ ] Can take quiz
- [ ] Can share text
- [ ] Can upload food photo
- [ ] Can view records
- [ ] Can send chat messages
- [ ] Real-time chat works (test with 2 users)

## Custom Domain (Optional)

If you want to use your own domain:

1. In Vercel Project → Settings → Domains
2. Add your domain (e.g., `nutrition.yourdomain.com`)
3. Follow DNS setup instructions
4. Update Supabase redirect URLs to use your custom domain

## Troubleshooting

### Build Fails
- Check Vercel build logs for errors
- Make sure all environment variables are set
- Ensure `frontend` is set as root directory

### Environment Variables Not Working
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Variables without this prefix are server-side only
- You may need to redeploy after adding/changing variables

### Authentication Callback Issues
- Double-check Supabase redirect URLs include your Vercel domain
- Clear browser cache and try again

### Real-time Chat Not Working
- Ensure Supabase Realtime is enabled for `chat_messages` table
- Check browser console for WebSocket errors

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment
- Each PR gets its own preview URL

## Environment Variables Per Environment

You can set different variables for:
- **Production** (main branch)
- **Preview** (all other branches)
- **Development** (local only)

This is useful if you want separate test/production databases.

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

