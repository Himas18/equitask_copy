-- Create triggers to automatically update workload when tasks change
CREATE OR REPLACE FUNCTION public.handle_task_workload_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update workload for the old assignee (on update/delete)
  IF TG_OP = 'UPDATE' AND OLD.assignee_id IS NOT NULL THEN
    PERFORM public.update_user_workload(OLD.assignee_id);
  END IF;
  
  IF TG_OP = 'DELETE' AND OLD.assignee_id IS NOT NULL THEN
    PERFORM public.update_user_workload(OLD.assignee_id);
    RETURN OLD;
  END IF;
  
  -- Update workload for the new assignee (on insert/update)
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.assignee_id IS NOT NULL THEN
    PERFORM public.update_user_workload(NEW.assignee_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS task_workload_update_trigger ON public.tasks;
CREATE TRIGGER task_workload_update_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_task_workload_update();