import { Role, TaskStatus } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { assertProjectMember } from "../../utils/projectAccess.js";

export async function getDashboard(userId: string, projectId?: string) {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  const isGlobalAdmin = me?.role === Role.ADMIN;

  const projectFilter = projectId
    ? { id: projectId }
    : isGlobalAdmin
      ? {}
      : { OR: [{ ownerId: userId }, { members: { some: { userId } } }] };

  const projects = await prisma.project.findMany({
    where: projectFilter,
    select: { id: true },
  });
  const projectIds = projects.map((p) => p.id);

  if (projectId) {
    await assertProjectMember(userId, projectId);
  }

  const now = new Date();

  const [totalTasks, tasksByStatus, tasksPerUser, overdueCount, recentActivity] =
    await Promise.all([
      prisma.task.count({
        where: {
          projectId: { in: projectIds },
          ...(isGlobalAdmin ? {} : { assigneeId: userId }),
        },
      }),
      prisma.task.groupBy({
        by: ["status"],
        where: {
          projectId: { in: projectIds },
          ...(isGlobalAdmin ? {} : { assigneeId: userId }),
        },
        _count: true,
      }),
      prisma.task.groupBy({
        by: ["assigneeId"],
        where: {
          projectId: { in: projectIds },
          assigneeId: { not: null },
          ...(isGlobalAdmin ? {} : { assigneeId: userId }),
        },
        _count: true,
      }),
      prisma.task.count({
        where: {
          projectId: { in: projectIds },
          ...(isGlobalAdmin ? {} : { assigneeId: userId }),
          dueDate: { lt: now },
          status: { not: TaskStatus.DONE },
        },
      }),
      prisma.activity.findMany({
        where: { projectId: { in: projectIds } },
        include: {
          user: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
    ]);

  const assigneeIds = tasksPerUser
    .map((t) => t.assigneeId)
    .filter((id): id is string => id !== null);

  const users = await prisma.user.findMany({
    where: { id: { in: assigneeIds } },
    select: { id: true, name: true },
  });

  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

  return {
    totalTasks,
    tasksByStatus: tasksByStatus.map((s) => ({
      status: s.status,
      count: s._count,
    })),
    tasksPerUser: tasksPerUser.map((t) => ({
      userId: t.assigneeId,
      userName: t.assigneeId ? userMap[t.assigneeId] ?? "Unknown" : "Unassigned",
      count: t._count,
    })),
    overdueCount,
    recentActivity,
  };
}
