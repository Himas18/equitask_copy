import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckSquare, 
  Users, 
  BarChart3, 
  Zap, 
  Shield, 
  Clock,
  TrendingUp,
  Target,
  ArrowRight,
  Star
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Target,
      title: "Smart Workload Balancing",
      description: "Min-heap algorithm automatically suggests the least-loaded team member for optimal task distribution.",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Live dashboards with workload charts, priority distribution, and team performance metrics.",
    },
    {
      icon: Clock,
      title: "Priority-Based Management",
      description: "Urgent, High, Medium, Low priority system with visual indicators and smart filtering.",
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Team Lead and Employee roles with appropriate permissions and personalized experiences.",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Socket.IO powered instant updates across all connected clients for seamless collaboration.",
    },
    {
      icon: Shield,
      title: "Secure & Scalable",
      description: "JWT authentication, RBAC permissions, and enterprise-grade security features.",
    },
  ];

  const stats = [
    { label: "Task Completion Rate", value: "94%", icon: CheckSquare },
    { label: "Team Efficiency", value: "87%", icon: TrendingUp },
    { label: "Average Response Time", value: "2.3s", icon: Clock },
    { label: "User Satisfaction", value: "4.9/5", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                EquiTask
              </span>
            </div>
            <Link to="/login">
              <Button className="bg-gradient-primary hover:shadow-primary transition-all duration-300">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4 animate-fade-in">
            <Badge className="bg-gradient-primary text-white">
              ⚡ Smart Task Management
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
              Keep Workloads{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Fair
              </span>{" "}
              and Teams{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Fast
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              EquiTask uses intelligent workload balancing to automatically distribute tasks fairly across your team. 
              Real-time analytics ensure no one gets overloaded and deadlines are never missed.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Link to="/login">
              <Button size="lg" className="bg-gradient-primary hover:shadow-primary transition-all duration-300">
                Start Free Demo
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/app/analytics">
              <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/10">
                View Analytics Demo
                <BarChart3 className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center space-y-2">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage tasks efficiently and keep your team balanced
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Transform Your Team's Productivity?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of teams already using EquiTask to achieve better work-life balance and faster delivery
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-gradient-primary hover:shadow-primary transition-all duration-300">
                Get Started Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/app/tasks">
              <Button size="lg" variant="outline">
                Explore Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-6 w-6 bg-gradient-primary rounded flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">EquiTask</span>
          </div>
          <p className="text-sm">
            Built with React, TypeScript, and Tailwind CSS. Powered by intelligent workload balancing.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
