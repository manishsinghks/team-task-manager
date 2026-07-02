import { Role } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "./AppError.js";

export async function getProjectAccess(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { where: { userId }, take: 1 },
    },
  });

  if (!project) {
    throw new AppError(404, "Project not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  const isGlobalAdmin = user?.role === Role.ADMIN;

  const isOwner = project.ownerId === userId;
  const membership = project.members[0] ?? null;
  const isMember = isGlobalAdmin || isOwner || !!membership;
  const isAdmin =
    isGlobalAdmin || isOwner || membership?.role === Role.ADMIN || false;

  return { project, membership, isOwner, isMember, isAdmin };
}

export async function assertProjectMember(userId: string, projectId: string) {
  const access = await getProjectAccess(userId, projectId);
  if (!access.isMember) {
    throw new AppError(403, "Not a project member");
  }
  return access;
}

export async function assertProjectAdmin(userId: string, projectId: string) {
  const access = await getProjectAccess(userId, projectId);
  if (!access.isAdmin) {
    throw new AppError(403, "Project admin access required");
  }
  return access;
}
