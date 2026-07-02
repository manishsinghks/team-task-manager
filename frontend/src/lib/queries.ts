"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, DashboardAnalytics, Project } from "@/lib/types";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project[]>>("/projects");
      return res.data.data;
    },
  });
}

export function useDashboard(projectId?: string) {
  return useQuery({
    queryKey: ["dashboard", projectId ?? "all"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardAnalytics>>(
        "/analytics/dashboard",
        {
          params: projectId ? { projectId } : undefined,
        },
      );
      return res.data.data;
    },
  });
}

export function useProject(projectId?: string) {
  return useQuery({
    queryKey: ["project", projectId ?? "none"],
    enabled: !!projectId,
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project>>(`/projects/${projectId}`);
      return res.data.data;
    },
  });
}