-- Disable email confirmation requirement
-- This allows users to login immediately without email verification

-- Update auth settings to disable email confirmation
UPDATE auth.config 
SET 
  enable_signup = true,
  email_confirm_required = false
WHERE TRUE;