-- ================================================
-- Add RLS policy to allow users to update their own shares
-- ================================================

-- Drop existing UPDATE policy if it exists (to prevent conflicts)
DROP POLICY IF EXISTS "Users can update their shares" ON text_shares;

-- Create policy: Users can update their own shares
CREATE POLICY "Users can update their shares" ON text_shares
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Verify the policy was created
SELECT 
    policyname, 
    permissive, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'text_shares' 
AND policyname = 'Users can update their shares';
