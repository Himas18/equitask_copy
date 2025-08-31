// Core types for EquiTask

export type UserRole = "employee" | "lead";
export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";
export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type UserStatus = "available" | "busy";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  skills: string[];
  status: UserStatus;
  weeklyCapacityHours: number;
  notificationPrefs: {
    inApp: boolean;
    email: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  estimatedHours: number;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: User;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface WorkloadSummary {
  currentHours: number;
  completedTasks: number;
  efficiency: number;
  activeTaskCount: number;
}

export interface AnalyticsSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  priorityDistribution: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface SuggestedAssignee {
  user: User;
  currentLoadHours: number;
  recommendation: "optimal" | "moderate" | "heavy" | "overloaded";
}