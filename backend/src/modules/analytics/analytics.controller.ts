import { asyncHandler } from "../../utils/asyncHandler.js";
import * as analyticsService from "./analytics.service.js";

export const dashboard = asyncHandler(async (req, res) => {
  const projectId = req.query.projectId as string | undefined;
  const data = await analyticsService.getDashboard(req.user!.userId, projectId);
  res.json({ success: true, data });
});
