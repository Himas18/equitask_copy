import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TaskPriority } from "@/lib/types";

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

const priorityConfig = {
  urgent: {
    label: "Urgent",
    className: "bg-priority-urgent/10 text-priority-urgent border-priority-urgent/20",
  },
  high: {
    label: "High",
    className: "bg-priority-high/10 text-priority-high border-priority-high/20",
  },
  medium: {
    label: "Medium",
    className: "bg-priority-medium/10 text-priority-medium border-priority-medium/20",
  },
  low: {
    label: "Low",
    className: "bg-priority-low/10 text-priority-low border-priority-low/20",
  },
};

export const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  const config = priorityConfig[priority];
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium border transition-all duration-200",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
};