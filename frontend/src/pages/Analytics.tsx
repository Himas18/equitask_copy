import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import { TrendingUp, Users, CheckSquare, Clock, AlertTriangle, Target } from "lucide-react";
import { getTasks, getTeam } from "@/api";   // ✅ use our API

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    priorityDistribution: { urgent: 0, high: 0, medium: 0, low: 0 }
  });
  const [workloadData, setWorkloadData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
    fetchTeamMembers();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await getTasks();

      const priorityDistribution = {
        urgent: data.filter((t: any) => t.priority === "urgent").length,
        high: data.filter((t: any) => t.priority === "high").length,
        medium: data.filter((t: any) => t.priority === "medium").length,
        low: data.filter((t: any) => t.priority === "low").length,
      };

      setAnalytics({
        totalTasks: data.length,
        completedTasks: data.filter((t: any) => t.completed).length,
        inProgressTasks: data.filter((t: any) => !t.completed).length,
        pendingTasks: data.filter((t: any) => !t.completed).length,
        overdueTasks: 0, // add dueDate check later if Task schema has deadlines
        priorityDistribution
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data } = await getTeam();
      const profiles = data.users;

      // Simulate workload stats
      const workload = profiles.map((member: any) => {
        const activeTasks = (data.stats[member.id]?.activeTasks) || 0;
        const completedTasks = (data.stats[member.id]?.completedTasks) || 0;
        const capacity = member.weekly_capacity_hours || 40;
        const percentage = Math.round((activeTasks / capacity) * 100);

        return {
          name: member.name.split(" ")[0],
          fullName: member.name,
          id: member.id,
          hours: activeTasks,
          capacity,
          percentage,
          efficiency: data.stats[member.id]?.efficiency || 0,
          tasks: activeTasks,
          completedTasks,
          skills: member.skills || []
        };
      });

      setWorkloadData(workload);
    } catch (err) {
      console.error("Error fetching team members:", err);
    }
  };

  // Chart data
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

  const totalTeamTasks = workloadData.reduce((sum, m) => sum + m.tasks, 0);
  const totalCompletedTasks = workloadData.reduce((sum, m) => sum + m.completedTasks, 0);
  const avgUtilization = workloadData.length > 0 
    ? Math.round(workloadData.reduce((s, m) => s + m.percentage, 0) / workloadData.length) 
    : 0;
  const avgEfficiency = workloadData.length > 0 ? Math.round(
    workloadData.reduce((s, m) => s + m.efficiency, 0) / workloadData.length
  ) : 0;

  const kpis = [
    { title: "Team Efficiency", value: `${avgEfficiency}%`, change: "+5%", icon: Target, color: "text-success", bgColor: "bg-success/10" },
    { title: "Active Tasks", value: totalTeamTasks, change: `+${analytics.pendingTasks}`, icon: Clock, color: "text-primary", bgColor: "bg-primary/10" },
    { title: "Team Utilization", value: `${avgUtilization}%`, change: "+12%", icon: Users, color: "text-warning", bgColor: "bg-warning/10" },
    { title: "Completed Tasks", value: totalCompletedTasks, change: `+${analytics.completedTasks}`, icon: CheckSquare, color: "text-success", bgColor: "bg-success/10" }
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
                      <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">{kpi.value}</p>
                        <Badge variant="secondary" className="text-xs">{kpi.change}</Badge>
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Task Status Distribution
              </CardTitle>
              <CardDescription>Overview of current task statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
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
              <CardDescription>Task breakdown by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                {priorityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
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
            <CardDescription>Current workload distribution across team members</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={workloadData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value, name) => [name === "hours" ? `${value}h` : `${value}%`, name === "hours" ? "Current Load" : "Efficiency"]} />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Analytics;
