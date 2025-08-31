-- Fix search path security warning for functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create user suggestion function
CREATE OR REPLACE FUNCTION public.suggest_user_for_task(
  required_skills TEXT[],
  estimated_hours DECIMAL
)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  current_workload DECIMAL,
  available_capacity DECIMAL,
  skill_match_count INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.name,
    p.current_workload_hours,
    (p.weekly_capacity_hours - p.current_workload_hours) as available_capacity,
    (
      SELECT COUNT(*)
      FROM unnest(p.skills) AS skill
      WHERE skill = ANY(required_skills)
    )::INTEGER as skill_match_count,
    p.status
  FROM public.profiles p
  WHERE p.role = 'employee'
    AND p.status = 'available'
    AND (p.weekly_capacity_hours - p.current_workload_hours) >= estimated_hours
  ORDER BY 
    skill_match_count DESC,
    available_capacity DESC,
    current_workload_hours ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;