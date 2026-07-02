import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { logActivity } from "../../utils/activity.js";
import { assertProjectAdmin, getProjectAccess } from "../../utils/projectAccess.js";

export async function listProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProject(userId: string, projectId: string) {
  const access = await getProjectAccess(userId, projectId);
  if (!access.isMember) {
    throw new AppError(403, "Not a project member");
  }

  const tasksArgs = access.isAdmin
    ? {
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" as const },
      }
    : {
        where: { assigneeId: userId },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" as const },
      };

  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      },
      tasks: tasksArgs,
    },
  });
}

export async function createProject(
  userId: string,
  data: { name: string; description?: string },
) {
  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      ownerId: userId,
      members: {
        create: { userId, role: Role.ADMIN },
      },
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });

  await logActivity({
    userId,
    action: "PROJECT_CREATED",
    entity: "project",
    entityId: project.id,
    projectId: project.id,
    metadata: { name: project.name },
  });

  return project;
}

export async function updateProject(
  userId: string,
  projectId: string,
  data: { name?: string; description?: string },
) {
  await assertProjectAdmin(userId, projectId);
  return prisma.project.update({
    where: { id: projectId },
    data,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });
}

export async function deleteProject(userId: string, projectId: string) {
  await assertProjectAdmin(userId, projectId);
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (project?.ownerId !== userId) {
    throw new AppError(403, "Only the project owner can delete the project");
  }
  await prisma.project.delete({ where: { id: projectId } });
}

export async function addMember(
  userId: string,
  projectId: string,
  data: { email: string; role: Role },
) {
  await assertProjectAdmin(userId, projectId);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new AppError(404, "User not found with that email");
  }

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (existing) {
    throw new AppError(409, "User is already a project member");
  }

  const member = await prisma.projectMember.create({
    data: { projectId, userId: user.id, role: data.role },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  await logActivity({
    userId,
    action: "MEMBER_ADDED",
    entity: "project_member",
    entityId: member.id,
    projectId,
    metadata: { email: user.email, role: data.role },
  });

  return member;
}

export async function removeMember(
  userId: string,
  projectId: string,
  memberUserId: string,
) {
  await assertProjectAdmin(userId, projectId);

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (project?.ownerId === memberUserId) {
    throw new AppError(400, "Cannot remove the project owner");
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: memberUserId } },
  });

  await logActivity({
    userId,
    action: "MEMBER_REMOVED",
    entity: "project_member",
    entityId: memberUserId,
    projectId,
  });
}
