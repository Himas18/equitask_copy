import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Clock, AlertTriangle, TrendingUp, Plus, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import WeeklyReportDialog from "@/components/WeeklyReportDialog";
import { getTasks, getTeam } from "@/api";   // ✅ replaced supabase

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  });
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      fetchAnalytics();
      fetchTeamMembers();
    }
  }, [profile]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await getTasks();

      // Filter tasks for employees
      const tasks = profile?.role === "employee"
        ? data.filter((t: any) => t.userId === profile.id)
        : data;

      const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t: any) => t.completed).length,
        inProgressTasks: tasks.filter((t: any) => !t.completed).length, // simplified
        pendingTasks: tasks.filter((t: any) => !t.completed).length,   // same as inProgress for now
        overdueTasks: 0, // add dueDate check later if schema supports
      };

      setAnalytics(stats);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data } = await getTeam();
      setTeamMembers(data.users.filter((u: any) => u.role === "employee"));
    } catch (err) {
      console.error("Error fetching team members:", err);
    }
  };

  const quickStats = [
    { title: "Total Tasks", value: analytics.totalTasks, icon: CheckSquare, color: "text-primary", bgColor: "bg-primary/10" },
    { title: "In Progress", value: analytics.inProgressTasks, icon: Clock, color: "text-warning", bgColor: "bg-warning/10" },
    { title: "Overdue", value: analytics.overdueTasks, icon: AlertTriangle, color: "text-destructive", bgColor: "bg-destructive/10" },
    { title: "Completed", value: analytics.completedTasks, icon: TrendingUp, color: "text-success", bgColor: "bg-success/10" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {profile?.role === "lead"
                ? `Welcome back, ${profile?.name || "Team Lead"}! 👋`
                : `Welcome, ${profile?.name || "Team Member"}!`}
            </h1>
            {profile?.role === "lead" && (
              <p className="text-muted-foreground">
                Here's what's happening with your team today.
              </p>
            )}
          </div>
          {profile?.role === "lead" && (
            <div className="flex gap-2">
              <WeeklyReportDialog />
              <Button onClick={() => navigate("/app/tasks")} className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="transition-all duration-200 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions - Only for Team Leads */}
        {profile?.role === "lead" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks to get you started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => navigate("/app/tasks")} className="w-full justify-start" variant="secondary">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Create New Task
                </Button>
                <Button onClick={() => navigate("/app/team")} className="w-full justify-start" variant="secondary">
                  <Users className="h-4 w-4 mr-2" />
                  View Team Status
                </Button>
                <Button onClick={() => navigate("/app/analytics")} className="w-full justify-start" variant="secondary">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Check Analytics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Overview</CardTitle>
                <CardDescription>Current workload distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamMembers.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No team members found. Create user accounts and assign tasks to see team overview.
                  </p>
                ) : (
                  teamMembers.slice(0, 3).map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.status}</p>
                        </div>
                      </div>
                      <Badge variant="default" className="text-xs">Active</Badge>
                    </div>
                  ))
                )}
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => navigate("/app/team")}>
                  View Full Team
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
