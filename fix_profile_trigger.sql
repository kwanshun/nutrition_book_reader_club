-- ================================================
-- Fix the profile creation trigger
-- ================================================
-- This updates the trigger to correctly populate user_id in the profiles table

-- Drop the old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with the correct logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table with user_id properly set
  INSERT INTO public.profiles (id, user_id, display_name)
  VALUES (NEW.id, NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail user registration
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- Fix existing profiles with NULL user_id
-- ================================================
UPDATE profiles
SET user_id = id
WHERE user_id IS NULL;

-- Verify the fix
SELECT id, user_id, display_name 
FROM profiles 
WHERE user_id IS NULL OR user_id = id
ORDER BY created_at DESC
LIMIT 10;

