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
  DialogTrigger,
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
import { Plus, Lightbulb, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import UserSuggestionDialog from "./UserSuggestionDialog";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
  status: string;
  weekly_capacity_hours: number;
  current_workload_hours: number;
  notification_prefs: any;
  created_at: string;
  updated_at: string;
}

const CreateTaskDialog = ({ onTaskCreated }: { onTaskCreated: () => void }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
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
    if (open) {
      fetchEmployees();
    }
  }, [open]);

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

  const addSkill = () => {
    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim())) {
      setRequiredSkills([...requiredSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter(skill => skill !== skillToRemove));
  };

  const handleUserSelect = (userId: string, userName: string) => {
    setFormData({ ...formData, assigneeId: userId });
    toast({
      title: "User selected",
      description: `${userName} has been selected for this task`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);

    try {
      const { error } = await supabase.from("tasks").insert({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        estimated_hours: parseFloat(formData.estimatedHours),
        assignee_id: formData.assigneeId || null,
        created_by_id: user.id,
        due_date: formData.dueDate || null,
      });

      if (error) throw error;

      toast({
        title: "Task created successfully!",
        description: "The task has been assigned to the team member.",
      });

      setFormData({
        title: "",
        description: "",
        priority: "medium",
        estimatedHours: "",
        assigneeId: "",
        dueDate: "",
      });
      setOpen(false);
      onTaskCreated();
    } catch (error: any) {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:shadow-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Create a new task and assign it to a team member.
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
            <Label>Required Skills (Optional)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {requiredSkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => removeSkill(skill)}
                >
                  {skill} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add required skill"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="assignee">Assign To</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSuggestions(true)}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                Suggest User
              </Button>
            </div>
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
                    <div className="flex items-center justify-between w-full">
                      <span>{employee.name}</span>
                      <div className="text-xs text-muted-foreground ml-2">
                        {employee.current_workload_hours || 0}h / {employee.weekly_capacity_hours}h
                      </div>
                    </div>
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>

        <UserSuggestionDialog
          open={showSuggestions}
          onOpenChange={setShowSuggestions}
          requiredSkills={requiredSkills}
          estimatedHours={parseFloat(formData.estimatedHours) || 0}
          onUserSelect={handleUserSelect}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;