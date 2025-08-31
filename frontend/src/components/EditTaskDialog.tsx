import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
  status: string;
  weekly_capacity_hours: number;
  notification_prefs: any;
  created_at: string;
  updated_at: string;
}

interface EditTaskDialogProps {
  task: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: () => void;
}

const EditTaskDialog = ({ task, open, onOpenChange, onTaskUpdated }: EditTaskDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "urgent" | "high" | "medium" | "low",
    estimatedHours: "",
    assigneeId: "",
    dueDate: "",
  });

  useEffect(() => {
    if (open && task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        estimatedHours: task.estimated_hours?.toString() || "",
        assigneeId: task.assignee_id || "",
        dueDate: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : "",
      });
      fetchEmployees();
    }
  }, [open, task]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "employee");

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !task) return;
    
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          estimated_hours: parseFloat(formData.estimatedHours),
          assignee_id: formData.assigneeId || null,
          due_date: formData.dueDate || null,
        })
        .eq('id', task.id);

      if (error) throw error;

      toast({
        title: "Task updated successfully!",
        description: "The task has been updated with the new information.",
      });

      onOpenChange(false);
      onTaskUpdated();
    } catch (error: any) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      toast({
        title: "Task deleted successfully!",
        description: "The task has been permanently removed.",
      });

      onOpenChange(false);
      onTaskUpdated();
    } catch (error: any) {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Make changes to the task details and assignment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "urgent" | "high" | "medium" | "low") =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.5"
                min="0"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assign To</Label>
            <Select
              value={formData.assigneeId}
              onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.user_id}>
                    {employee.name} ({employee.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date (Optional)</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div className="flex justify-between space-x-2 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              Delete Task
            </Button>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Task"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;