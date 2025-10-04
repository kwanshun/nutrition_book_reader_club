# Text Sharing Feature - Debugging Notes

## Current Status: ⚠️ Not Working

### Error Observed
- **Browser Error**: "分享失敗，請稍後再試" (Share failed, please try again later)
- **Terminal Error**: Row Level Security policy violation (code 42501)

### What We've Tried

1. ✅ **Created the text sharing feature**
   - Share page with form (`/share`)
   - API routes (`/api/shares`)
   - Custom hooks (`useTextShares`)
   - UI components (ShareForm, TextShareCard)

2. ✅ **Fixed Next.js 15 compatibility issues**
   - Made `cookies()` async in `server.ts`
   - Updated API routes to await `createClient()`

3. ✅ **Fixed database query issues**
   - Removed problematic `auth.users` join
   - Updated to use API routes instead of direct Supabase client

4. ⚠️ **Attempted to disable RLS** (Still not working)
   - Ran SQL command to disable RLS
   - Dropped all existing policies
   - But RLS is still being enforced

### Root Cause

The Row Level Security (RLS) on the `text_shares` table is still blocking inserts, even after running:
```sql
ALTER TABLE text_shares DISABLE ROW LEVEL SECURITY;
```

This suggests:
1. The SQL command might not have executed successfully
2. There might be cached policies
3. The Supabase service might need to restart
4. There might be table-level permissions issues

### Next Steps to Try

#### Option 1: Verify RLS Status in Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Database** → **Tables** → `text_shares`
4. Check if "Row Level Security" toggle is OFF
5. If it's ON, click to turn it OFF

#### Option 2: Check Server Logs
Look at the terminal where `npm run dev` is running and check for the exact error message when submitting a share.

#### Option 3: Use Service Role Key (Temporary Workaround)
For testing purposes, we could modify the API route to use the service role key which bypasses RLS:
- This would allow testing the feature
- BUT should NOT be used in production
- Would need to implement proper RLS policies later

#### Option 4: Implement Proper RLS Policies
Instead of disabling RLS, create proper policies that allow authenticated users to insert their own shares:
```sql
-- Allow authenticated users to insert their own shares
CREATE POLICY "Authenticated users can insert shares"
ON text_shares
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow anyone to read shares
CREATE POLICY "Anyone can read shares"
ON text_shares
FOR SELECT
TO authenticated
USING (true);
```

### Files Modified
- `frontend/app/(dashboard)/share/page.tsx` - Share page
- `frontend/app/api/shares/route.ts` - API endpoints
- `frontend/lib/hooks/useTextShares.ts` - Custom hook
- `frontend/lib/supabase/server.ts` - Server client (async cookies)
- `frontend/components/share/ShareForm.tsx` - Form component
- `frontend/components/share/TextShareCard.tsx` - Card component

### Commits
- `feat: Implement text sharing feature with once-per-day validation` (2b36dcf)
- `fix: Resolve Next.js 15 async cookies and database query issues` (e9f0c7c)

---

## Recommendation

**The fastest solution is Option 1 + Option 4:**
1. Verify RLS is actually disabled in the Supabase Dashboard UI
2. If it's still enabled, disable it using the dashboard toggle (not SQL)
3. Once working, re-enable RLS and implement proper policies (Option 4)

This will ensure the feature works for testing while maintaining security best practices for production.

