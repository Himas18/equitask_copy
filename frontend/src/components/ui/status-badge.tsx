import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/lib/types";
import { Clock, CheckCircle, AlertTriangle, Pause } from "lucide-react";

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
  showIcon?: boolean;
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
    icon: Pause,
  },
  in_progress: {
    label: "In Progress",
    className: "bg-warning/10 text-warning border-warning/20",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    className: "bg-success/10 text-success border-success/20",
    icon: CheckCircle,
  },
  overdue: {
    label: "Overdue",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: AlertTriangle,
  },
};

export const StatusBadge = ({ status, className, showIcon = false }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium border transition-all duration-200",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
};