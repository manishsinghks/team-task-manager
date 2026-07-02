import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export async function logActivity(params: {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  projectId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.activity.create({ data: params });
}
