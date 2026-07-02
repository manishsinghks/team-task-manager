import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { assertProjectAdmin, assertProjectMember } from "../utils/projectAccess.js";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError(401, "Authentication required"));
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
}

export function requireGlobalRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, "Authentication required"));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, "Insufficient permissions"));
      return;
    }
    next();
  };
}

export function projectMemberGuard(paramKey = "projectId") {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = req.params[paramKey] ?? req.params.id;
      const projectId = Array.isArray(raw) ? raw[0] : raw;
      if (!req.user || !projectId) {
        throw new AppError(400, "Project context required");
      }
      await assertProjectMember(req.user.userId, projectId);
      next();
    } catch (e) {
      next(e);
    }
  };
}

export function projectAdminGuard(paramKey = "projectId") {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = req.params[paramKey] ?? req.params.id;
      const projectId = Array.isArray(raw) ? raw[0] : raw;
      if (!req.user || !projectId) {
        throw new AppError(400, "Project context required");
      }
      await assertProjectAdmin(req.user.userId, projectId);
      next();
    } catch (e) {
      next(e);
    }
  };
}
