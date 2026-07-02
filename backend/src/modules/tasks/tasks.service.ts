import { TaskStatus, type TaskPriority, type Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { logActivity } from "../../utils/activity.js";
import { assertProjectAdmin, getProjectAccess } from "../../utils/projectAccess.js";

type TaskInput = {
  title: string;
  description?: string;
  dueDate?: Date | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigneeId?: string | null;
};

export async function listTasks(
  userId: string,
  projectId: string,
  filters: { status?: TaskStatus; priority?: TaskPriority; assigneeId?: string },
) {
  const access = await getProjectAccess(userId, projectId);
  if (!access.isMember) {
    throw new AppError(403, "Not a project member");
  }

  const where: Prisma.TaskWhereInput = { projectId };
  if (!access.isAdmin) {
    // Members only see tasks assigned to them.
    where.assigneeId = userId;
  }
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (access.isAdmin && filters.assigneeId) where.assigneeId = filters.assigneeId;

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
  });

  const now = new Date();
  return tasks.map((t) => ({
    ...t,
    isOverdue: t.dueDate ? t.dueDate < now && t.status !== TaskStatus.DONE : false,
  }));
}

export async function createTask(userId: string, projectId: string, data: TaskInput) {
  await assertProjectAdmin(userId, projectId);

  if (data.assigneeId) {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: data.assigneeId } },
    });
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!member && project?.ownerId !== data.assigneeId) {
      throw new AppError(400, "Assignee must be a project member");
    }
  }

  const task = await prisma.task.create({
    data: {
      ...data,
      projectId,
      createdById: userId,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  await logActivity({
    userId,
    action: "TASK_CREATED",
    entity: "task",
    entityId: task.id,
    projectId,
    metadata: { title: task.title },
  });

  return task;
}

export async function updateTask(
  userId: string,
  projectId: string,
  taskId: string,
  data: Partial<TaskInput>,
) {
  const access = await getProjectAccess(userId, projectId);
  if (!access.isMember) {
    throw new AppError(403, "Not a project member");
  }

  const task = await prisma.task.findFirst({ where: { id: taskId, projectId } });
  if (!task) {
    throw new AppError(404, "Task not found");
  }

  if (!access.isAdmin) {
    throw new AppError(403, "Only project admins can edit tasks");
  }

  if (data.assigneeId) {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: data.assigneeId } },
    });
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!member && project?.ownerId !== data.assigneeId) {
      throw new AppError(400, "Assignee must be a project member");
    }
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data,
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  await logActivity({
    userId,
    action: "TASK_UPDATED",
    entity: "task",
    entityId: taskId,
    projectId,
  });

  return updated;
}

export async function updateTaskStatus(
  userId: string,
  projectId: string,
  taskId: string,
  status: TaskStatus,
) {
  const access = await getProjectAccess(userId, projectId);
  if (!access.isMember) throw new AppError(403, "Not a project member");

  const task = await prisma.task.findFirst({ where: { id: taskId, projectId } });
  if (!task) {
    throw new AppError(404, "Task not found");
  }

  const isAssignee = task.assigneeId === userId;
  const isAdmin = access.isAdmin;

  if (!isAdmin && !isAssignee) {
    throw new AppError(403, "You can only update status on tasks assigned to you");
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  await logActivity({
    userId,
    action: "TASK_STATUS_CHANGED",
    entity: "task",
    entityId: taskId,
    projectId,
    metadata: { status },
  });

  return updated;
}

export async function deleteTask(userId: string, projectId: string, taskId: string) {
  await assertProjectAdmin(userId, projectId);
  const task = await prisma.task.findFirst({ where: { id: taskId, projectId } });
  if (!task) {
    throw new AppError(404, "Task not found");
  }
  await prisma.task.delete({ where: { id: taskId } });
  await logActivity({
    userId,
    action: "TASK_DELETED",
    entity: "task",
    entityId: taskId,
    projectId,
  });
}
