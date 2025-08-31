-- Add workload tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_workload_hours DECIMAL DEFAULT 0;

-- Create a function to calculate and update workload
CREATE OR REPLACE FUNCTION public.update_user_workload(user_profile_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET current_workload_hours = (
    SELECT COALESCE(SUM(estimated_hours), 0)
    FROM public.tasks 
    WHERE assignee_id = user_profile_id 
    AND status IN ('pending', 'in_progress')
  )
  WHERE user_id = user_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;