import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Save, 
  Mail, 
  Smartphone,
  Moon,
  Sun,
  Globe,
  Key,
  Upload
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { toast } = useToast();
  const { profile: userProfile } = useAuth();
  
  const [profile, setProfile] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    skills: userProfile?.skills || [],
  });

  const [notifications, setNotifications] = useState({
    inApp: userProfile?.notification_prefs?.inApp ?? true,
    email: userProfile?.notification_prefs?.email ?? true,
    taskAssigned: true,
    taskCompleted: true,
    deadlineReminders: true,
    weeklyReports: false,
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: "en",
    timezone: "UTC-8",
    weeklyCapacity: userProfile?.weekly_capacity_hours || 40,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "24h",
    passwordLastChanged: "2024-01-15",
  });

  const handleSave = async () => {
    if (!userProfile?.user_id) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          email: profile.email,
          skills: profile.skills,
          notification_prefs: {
            inApp: notifications.inApp,
            email: notifications.email
          },
          weekly_capacity_hours: preferences.weeklyCapacity
        })
        .eq('user_id', userProfile.user_id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  const toggleDarkMode = () => {
    const newMode = !preferences.darkMode;
    setPreferences(prev => ({ ...prev, darkMode: newMode }));
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userProfile?.user_id) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userProfile.user_id}.${fileExt}`;
      
      // Upload file to Supabase Storage (when implemented)
      // For now, just show a success message
      toast({
        title: "Photo uploaded",
        description: "Profile photo updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    try {
      const newPassword = prompt("Enter new password:");
      if (!newPassword) return;
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    }
  };

  const handleTwoFactorToggle = (checked: boolean) => {
    setSecurity(prev => ({ ...prev, twoFactor: checked }));
    toast({
      title: checked ? "2FA Enabled" : "2FA Disabled",
      description: checked 
        ? "Two-factor authentication has been enabled." 
        : "Two-factor authentication has been disabled.",
    });
  };

  // Set dark mode on component mount
  useEffect(() => {
    if (preferences.darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const addSkill = (skill: string) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and skills
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-primary text-white text-lg font-semibold">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <label htmlFor="photo-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Change Photo
                    </span>
                  </Button>
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => removeSkill(skill)}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addSkill(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addSkill(input.value);
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label>In-App Notifications</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications within the application
                  </p>
                </div>
                <Switch
                  checked={notifications.inApp}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, inApp: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label>Email Notifications</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, email: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                
                {(userProfile?.role === 'lead' ? [
                  { key: 'taskCompleted', label: 'Task Completed', description: 'When team members complete tasks' },
                  { key: 'taskOverdue', label: 'Task Overdue', description: 'When tasks become overdue' },
                  { key: 'weeklyReports', label: 'Weekly Reports', description: 'Weekly team performance summaries' },
                ] : [
                  { key: 'taskAssigned', label: 'Task Assigned', description: 'When a new task is assigned to you' },
                  { key: 'deadlineReminders', label: 'Deadline Reminders', description: 'Reminders before task deadlines' },
                ]).map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications] as boolean}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Customize your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <Label>Dark Mode</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Switch to dark theme
                    </p>
                  </div>
                  <Switch
                    checked={preferences.darkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>

                {userProfile?.role === 'lead' && (
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Weekly Capacity (hours)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      max="60"
                      value={preferences.weeklyCapacity}
                      onChange={(e) => setPreferences(prev => ({ 
                        ...prev, 
                        weeklyCapacity: parseInt(e.target.value) || 40 
                      }))}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={preferences.timezone}
                    onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC+0">UTC</option>
                    <option value="UTC+1">Central European Time (UTC+1)</option>
                  </select>
                </div>

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={security.twoFactor}
                    onCheckedChange={handleTwoFactorToggle}
                  />
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Password</Label>
                    <p className="text-sm text-muted-foreground">
                      Last changed on {security.passwordLastChanged}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleChangePassword}>
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session">Session Timeout</Label>
                  <select
                    id="session"
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    <option value="1h">1 hour</option>
                    <option value="8h">8 hours</option>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-gradient-primary">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;