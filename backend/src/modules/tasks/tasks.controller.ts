import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskFilterSchema,
} from "../../validators/task.schema.js";
import * as tasksService from "./tasks.service.js";

export const list = asyncHandler(async (req, res) => {
  const filters = taskFilterSchema.parse(req.query);
  const tasks = await tasksService.listTasks(
    req.user!.userId,
    req.params.projectId as string,
    filters,
  );
  res.json({ success: true, data: tasks });
});

export const create = asyncHandler(async (req, res) => {
  const body = createTaskSchema.parse(req.body);
  const task = await tasksService.createTask(
    req.user!.userId,
    req.params.projectId as string,
    body,
  );
  res.status(201).json({ success: true, data: task });
});

export const update = asyncHandler(async (req, res) => {
  const body = updateTaskSchema.parse(req.body);
  const task = await tasksService.updateTask(
    req.user!.userId,
    req.params.projectId as string,
    req.params.taskId as string,
    body,
  );
  res.json({ success: true, data: task });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = updateTaskStatusSchema.parse(req.body);
  const task = await tasksService.updateTaskStatus(
    req.user!.userId,
    req.params.projectId as string,
    req.params.taskId as string,
    status,
  );
  res.json({ success: true, data: task });
});

export const remove = asyncHandler(async (req, res) => {
  await tasksService.deleteTask(
    req.user!.userId,
    req.params.projectId as string,
    req.params.taskId as string,
  );
  res.json({ success: true, message: "Task deleted" });
});
