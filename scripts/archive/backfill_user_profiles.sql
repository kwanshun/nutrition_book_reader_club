-- Backfill user profiles for existing users who don't have them
-- This will fix the "用戶6340" display name issue for existing users

INSERT INTO public.user_profiles (user_id, display_name)
SELECT 
    au.id,
    split_part(au.email, '@', 1) as display_name
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL;

-- Verify the backfill worked
SELECT 
    au.email,
    up.display_name,
    up.created_at
FROM auth.users au
JOIN user_profiles up ON au.id = up.user_id
ORDER BY up.created_at DESC
LIMIT 10;
