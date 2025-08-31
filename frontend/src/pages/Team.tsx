import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Mail, MapPin, Calendar, Award, Clock, CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamLead, setTeamLead] = useState<any>(null);
  const [memberStats, setMemberStats] = useState<{[key: string]: any}>({});

  useEffect(() => {
    fetchTeamData();
    
    // Set up real-time subscription for profile updates
    const channel = supabase
      .channel('profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchTeamData(); // Refresh team data when profiles change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTeamData = async () => {
    try {
      const [profilesResult, tasksResult] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('tasks').select('assignee_id, status, estimated_hours')
      ]);
      
      if (profilesResult.error) throw profilesResult.error;
      if (tasksResult.error) throw tasksResult.error;
      
      const allProfiles = profilesResult.data || [];
      const allTasks = tasksResult.data || [];
      
      // Calculate stats for each member
      const stats: {[key: string]: any} = {};
      allProfiles.forEach(profile => {
        const memberTasks = allTasks.filter(task => task.assignee_id === profile.user_id);
        const activeTasks = memberTasks.filter(task => task.status === 'pending' || task.status === 'in_progress');
        const completedTasks = memberTasks.filter(task => task.status === 'completed');
        
        stats[profile.user_id] = {
          activeTasks: activeTasks.length,
          completedTasks: completedTasks.length,
          efficiency: memberTasks.length > 0 ? Math.round((completedTasks.length / memberTasks.length) * 100) : 0
        };
      });
      
      setMemberStats(stats);
      setTeamMembers(allProfiles?.filter(user => user.role === 'employee') || []);
      setTeamLead(allProfiles?.find(user => user.role === 'lead'));
    } catch (error) {
      console.error('Error fetching team data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'available' ? 'bg-success' : 'bg-warning';
  };

  const getStatusText = (status: string) => {
    return status === 'available' ? 'Available' : 'Busy';
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Team Overview</h1>
          <p className="text-muted-foreground">
            Manage your team members and track their workload distribution
          </p>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{teamMembers.length + (teamLead ? 1 : 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">
                    {teamMembers.filter(u => u.status === 'available').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-warning" />
                <div>
                   <p className="text-2xl font-bold">0%</p>
                  <p className="text-sm text-muted-foreground">Avg. Utilization</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-primary" />
                <div>
                   <p className="text-2xl font-bold">100%</p>
                  <p className="text-sm text-muted-foreground">Avg. Efficiency</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Lead Section */}
        {teamLead && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Team Lead
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-transparent">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-primary text-white text-lg font-semibold">
                    {teamLead.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{teamLead.name}</h3>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {teamLead.email}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {teamLead.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-gradient-primary">Team Lead</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Members Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Team Members ({teamMembers.length})</h2>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teamMembers.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-muted-foreground">No team members found. Create user accounts with employee role to see team members.</p>
              </div>
            ) : (
              teamMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <Badge 
                            variant={member.status === 'available' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {getStatusText(member.status)}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground text-sm flex items-center gap-1 mb-3">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {member.skills?.map((skill: string) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        {/* Workload Info */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Weekly Capacity</span>
                            <span className="font-medium">
                              {member.current_workload_hours || 0}h / {member.weekly_capacity_hours || 40}h
                            </span>
                          </div>
                          
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                (member.current_workload_hours || 0) / (member.weekly_capacity_hours || 40) > 0.8 
                                  ? 'bg-destructive' 
                                  : (member.current_workload_hours || 0) / (member.weekly_capacity_hours || 40) > 0.6 
                                  ? 'bg-warning' 
                                  : 'bg-primary'
                              }`}
                              style={{ 
                                width: `${Math.min(((member.current_workload_hours || 0) / (member.weekly_capacity_hours || 40) * 100), 100)}%` 
                              }}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {(member.current_workload_hours || 0) >= (member.weekly_capacity_hours || 40) 
                                ? 'Overloaded' 
                                : 'Available'
                              }
                            </span>
                            <span>
                              {((member.current_workload_hours || 0) / (member.weekly_capacity_hours || 40) * 100).toFixed(0)}% utilized
                            </span>
                          </div>
                        </div>

                        {/* Performance Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                          <div className="text-center">
                            <p className="text-lg font-semibold">{memberStats[member.user_id]?.activeTasks || 0}</p>
                            <p className="text-xs text-muted-foreground">Active Tasks</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold">{memberStats[member.user_id]?.completedTasks || 0}</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold">{memberStats[member.user_id]?.efficiency || 0}%</p>
                            <p className="text-xs text-muted-foreground">Efficiency</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Team;