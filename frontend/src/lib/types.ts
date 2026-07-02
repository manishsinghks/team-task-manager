export type Role = "ADMIN" | "MEMBER";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; name: string; email: string };
  members?: ProjectMember[];
  tasks?: Task[];
  _count?: { tasks: number; members: number };
}

export interface ProjectMember {
  id: string;
  role: Role;
  user: { id: string; name: string; email: string; role: Role };
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  projectId: string;
  assigneeId: string | null;
  assignee?: { id: string; name: string; email: string } | null;
  createdBy?: { id: string; name: string };
  isOverdue?: boolean;
}

export interface DashboardAnalytics {
  totalTasks: number;
  tasksByStatus: { status: TaskStatus; count: number }[];
  tasksPerUser: { userId: string | null; userName: string; count: number }[];
  overdueCount: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  action: string;
  entity: string;
  createdAt: string;
  user: { id: string; name: string };
  project?: { id: string; name: string } | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
