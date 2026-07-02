import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from "../../validators/project.schema.js";
import * as projectsService from "./projects.service.js";

export const list = asyncHandler(async (req, res) => {
  const projects = await projectsService.listProjects(req.user!.userId);
  res.json({ success: true, data: projects });
});

export const getOne = asyncHandler(async (req, res) => {
  const project = await projectsService.getProject(
    req.user!.userId,
    req.params.projectId as string,
  );
  res.json({ success: true, data: project });
});

export const create = asyncHandler(async (req, res) => {
  const body = createProjectSchema.parse(req.body);
  const project = await projectsService.createProject(req.user!.userId, body);
  res.status(201).json({ success: true, data: project });
});

export const update = asyncHandler(async (req, res) => {
  const body = updateProjectSchema.parse(req.body);
  const project = await projectsService.updateProject(
    req.user!.userId,
    req.params.projectId as string,
    body,
  );
  res.json({ success: true, data: project });
});

export const remove = asyncHandler(async (req, res) => {
  await projectsService.deleteProject(req.user!.userId, req.params.projectId as string);
  res.json({ success: true, message: "Project deleted" });
});

export const addMember = asyncHandler(async (req, res) => {
  const body = addMemberSchema.parse(req.body);
  const member = await projectsService.addMember(
    req.user!.userId,
    req.params.projectId as string,
    body,
  );
  res.status(201).json({ success: true, data: member });
});

export const removeMember = asyncHandler(async (req, res) => {
  await projectsService.removeMember(
    req.user!.userId,
    req.params.projectId as string,
    req.params.userId as string,
  );
  res.json({ success: true, message: "Member removed" });
});
