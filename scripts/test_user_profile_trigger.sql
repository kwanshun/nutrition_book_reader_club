-- Test script to verify the user profile trigger works
-- This simulates what happens when a new user registers

-- First, let's check if the trigger exists
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if the function exists
SELECT 
    routine_name, 
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Check current user_profiles count
SELECT COUNT(*) as current_profiles FROM user_profiles;

-- Check for users without profiles (this should be empty after trigger is working)
SELECT 
    au.id,
    au.email,
    up.display_name
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL;

-- Test the function manually (optional - for debugging)
-- DO $$
-- DECLARE
--     test_user_id uuid := gen_random_uuid();
-- BEGIN
--     -- This would simulate a new user creation
--     -- INSERT INTO auth.users (id, email, created_at) VALUES (test_user_id, 'test@example.com', now());
--     -- The trigger should automatically create a profile
-- END $$;
