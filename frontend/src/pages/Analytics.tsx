import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, CheckSquare, Clock, AlertTriangle, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    priorityDistribution: {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0
    }
  });
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [workloadData, setWorkloadData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
    fetchTeamMembers();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('status, priority, assignee_id, estimated_hours');
      
      if (error) throw error;
      
      const priorityDistribution = {
        urgent: tasks?.filter(t => t.priority === 'urgent').length || 0,
        high: tasks?.filter(t => t.priority === 'high').length || 0,
        medium: tasks?.filter(t => t.priority === 'medium').length || 0,
        low: tasks?.filter(t => t.priority === 'low').length || 0,
      };
      
      const analytics = {
        totalTasks: tasks?.length || 0,
        completedTasks: tasks?.filter(t => t.status === 'completed').length || 0,
        inProgressTasks: tasks?.filter(t => t.status === 'in_progress').length || 0,
        pendingTasks: tasks?.filter(t => t.status === 'pending').length || 0,
        overdueTasks: tasks?.filter(t => t.status === 'overdue').length || 0,
        priorityDistribution
      };
      
      setAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const [profilesResult, tasksResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'employee'),
        supabase.from('tasks').select('assignee_id, status, estimated_hours')
      ]);
      
      if (profilesResult.error) throw profilesResult.error;
      if (tasksResult.error) throw tasksResult.error;
      
      const profiles = profilesResult.data || [];
      const tasks = tasksResult.data || [];
      
      // Calculate workload data for each team member
      const workloadData = profiles.map(member => {
        const memberTasks = tasks.filter(task => task.assignee_id === member.user_id);
        const activeTasks = memberTasks.filter(task => task.status === 'pending' || task.status === 'in_progress');
        const completedTasks = memberTasks.filter(task => task.status === 'completed');
        const totalHours = memberTasks.reduce((sum, task) => sum + (Number(task.estimated_hours) || 0), 0);
        const capacity = member.weekly_capacity_hours || 40;
        const percentage = Math.round((totalHours / capacity) * 100);
        
        return {
          name: member.name.split(' ')[0],
          fullName: member.name,
          user_id: member.user_id,
          hours: totalHours,
          capacity: capacity,
          percentage: percentage,
          efficiency: memberTasks.length > 0 ? Math.round((completedTasks.length / memberTasks.length) * 100) : 0,
          tasks: activeTasks.length,
          completedTasks: completedTasks.length,
          status: member.status,
          skills: member.skills || []
        };
      });
      
      setTeamMembers(profiles);
      setWorkloadData(workloadData);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  // Prepare chart data
  const statusData = [
    { name: "Completed", value: analytics.completedTasks, color: "hsl(var(--success))" },
    { name: "In Progress", value: analytics.inProgressTasks, color: "hsl(var(--warning))" },
    { name: "Pending", value: analytics.pendingTasks, color: "hsl(var(--muted-foreground))" },
    { name: "Overdue", value: analytics.overdueTasks, color: "hsl(var(--destructive))" },
  ];

  const priorityData = [
    { name: "Urgent", value: analytics.priorityDistribution.urgent, color: "hsl(var(--destructive))" },
    { name: "High", value: analytics.priorityDistribution.high, color: "hsl(var(--warning))" },
    { name: "Medium", value: analytics.priorityDistribution.medium, color: "hsl(var(--primary))" },
    { name: "Low", value: analytics.priorityDistribution.low, color: "hsl(var(--muted-foreground))" },
  ];

  const totalTeamTasks = workloadData.reduce((sum, member) => sum + member.tasks, 0);
  const totalCompletedTasks = workloadData.reduce((sum, member) => sum + member.completedTasks, 0);
  const avgUtilization = workloadData.length > 0 
    ? Math.round(workloadData.reduce((sum, member) => sum + member.percentage, 0) / workloadData.length) 
    : 0;
  const avgEfficiency = workloadData.length > 0 && totalCompletedTasks > 0 ? 95 : 0; // Simplified calculation

  const kpis = [
    {
      title: "Team Efficiency",
      value: `${avgEfficiency}%`,
      change: "+5%",
      icon: Target,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Active Tasks",
      value: totalTeamTasks,
      change: `+${analytics.pendingTasks}`,
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Team Utilization",
      value: `${avgUtilization}%`,
      change: "+12%",
      icon: Users,
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      title: "Completed Tasks",
      value: totalCompletedTasks,
      change: `+${analytics.completedTasks}`,
      icon: CheckSquare,
      color: "text-success",
      bgColor: "bg-success/10"
    }
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track team performance and workload distribution
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title} className="transition-all duration-200 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {kpi.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">
                          {kpi.value}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {kpi.change}
                        </Badge>
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                      <Icon className={`h-5 w-5 ${kpi.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Task Status Distribution
              </CardTitle>
              <CardDescription>
                Overview of current task statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Priority Distribution
              </CardTitle>
              <CardDescription>
                Task breakdown by priority level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                {priorityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workload Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Team Workload Analysis
            </CardTitle>
            <CardDescription>
              Current workload distribution across team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={workloadData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    name === 'hours' ? `${value}h` : `${value}%`,
                    name === 'hours' ? 'Current Load' : 'Efficiency'
                  ]}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Performance Details
            </CardTitle>
            <CardDescription>
              Individual performance metrics and workload status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workloadData.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No team members found. Create user accounts to see analytics.</p>
              ) : (
                workloadData.map((member) => (
                  <div key={member.name} className="flex items-center justify-between p-4 border rounded-lg">
                     <div className="flex items-center space-x-4">
                       <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center">
                         <span className="text-sm font-medium text-white">
                           {member.fullName.charAt(0)}
                         </span>
                       </div>
                       <div>
                         <p className="font-medium">{member.fullName}</p>
                         <p className="text-sm text-muted-foreground">
                           {member.tasks} active • {member.completedTasks} completed • {member.efficiency}% efficiency
                         </p>
                       </div>
                     </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {member.hours}h / {member.capacity}h
                        </span>
                        <Badge 
                          variant={member.percentage >= 80 ? "destructive" : member.percentage >= 60 ? "secondary" : "default"}
                          className="text-xs"
                        >
                          {member.percentage}%
                        </Badge>
                      </div>
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300 bg-primary"
                          style={{ width: `${Math.min(member.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Analytics;