import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, Search, Filter, MoreHorizontal, User, Calendar, Clock, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TaskStatus, TaskPriority } from "@/lib/types";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import EditTaskDialog from "@/components/EditTaskDialog";

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<any>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const isTeamLead = profile?.role === "lead";

  const fetchTasks = async () => {
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey(id, name, email, role),
          created_by:profiles!tasks_created_by_id_fkey(id, name, email, role)
        `);

      // Employees only see their assigned tasks
      if (!isTeamLead && profile?.user_id) {
        query = query.eq('assignee_id', profile.user_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [profile]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      toast({
        title: "Task Updated",
        description: `Task status changed to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const getStatusActions = (status: TaskStatus) => {
    const statusMap: Record<TaskStatus, { next: TaskStatus; label: string; variant: "default" | "destructive" | "secondary" }> = {
      pending: { next: "in_progress" as TaskStatus, label: "Start Task", variant: "default" },
      in_progress: { next: "completed" as TaskStatus, label: "Complete", variant: "default" },
      completed: { next: "pending" as TaskStatus, label: "Reopen", variant: "secondary" },
      overdue: { next: "in_progress" as TaskStatus, label: "Resume", variant: "destructive" },
    };
    return statusMap[status];
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Manage and track your team's tasks
            </p>
          </div>
          {isTeamLead && (
            <div className="flex gap-2">
              <CreateTaskDialog onTaskCreated={fetchTasks} />
            </div>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "all")}
                  className="px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as TaskPriority | "all")}
                  className="px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTasks.map((task) => {
              const statusAction = getStatusActions(task.status);
              const canUpdateStatus = !isTeamLead || task.assignee_id === profile?.user_id;
              
              return (
                <Card key={task.id} className="group hover:shadow-md transition-all duration-200 animate-fade-in">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {task.title}
                      </CardTitle>
                      {isTeamLead && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setEditingTask(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {task.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={task.status} showIcon />
                      <PriorityBadge priority={task.priority} />
                    </div>

                    {/* Task Details */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{task.assignee?.name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{task.estimated_hours}h estimated</span>
                      </div>
                      {task.due_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {canUpdateStatus && (
                        <Button
                          size="sm"
                          variant={statusAction.variant}
                          className="flex-1"
                          onClick={() => updateTaskStatus(task.id, statusAction.next)}
                        >
                          {statusAction.label}
                        </Button>
                      )}
                      {isTeamLead && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingTask(task)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== "all" || filterPriority !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first task to get started"}
              </p>
              {isTeamLead && (
                <div className="mt-4">
                  <CreateTaskDialog onTaskCreated={fetchTasks} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Task Dialog */}
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onTaskUpdated={fetchTasks}
        />
      </div>
    </AppLayout>
  );
};

export default Tasks;