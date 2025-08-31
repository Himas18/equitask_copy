-- Manual workload update for all users
UPDATE public.profiles 
SET current_workload_hours = (
  SELECT COALESCE(SUM(estimated_hours), 0)
  FROM public.tasks 
  WHERE assignee_id = profiles.user_id 
  AND status IN ('pending', 'in_progress')
);

-- Ensure the trigger is properly set up for automatic updates
DROP TRIGGER IF EXISTS task_workload_trigger ON public.tasks;
CREATE TRIGGER task_workload_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_task_workload_update();