import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Users, Settings, CheckSquare, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import NotificationDropdown from "@/components/NotificationDropdown";
import StatusToggle from "@/components/StatusToggle";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const navigation = [
    { name: "Tasks", href: "/app/tasks", icon: CheckSquare },
    ...(profile?.role === 'lead' ? [
      { name: "Analytics", href: "/app/analytics", icon: BarChart3 },
      { name: "Team", href: "/app/team", icon: Users },
    ] : []),
    { name: "Settings", href: "/app/settings", icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-16 items-center px-6 gap-4">
          <Link to="/app" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
              EquiTask
            </span>
          </Link>

          <nav className="hidden md:flex ml-8 space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center space-x-4">
            <NotificationDropdown />
            
            <div className="flex items-center space-x-2">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{profile?.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
                  {profile?.role === 'employee' && <StatusToggle />}
                </div>
              </div>
              <div className="h-8 w-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {profile?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;