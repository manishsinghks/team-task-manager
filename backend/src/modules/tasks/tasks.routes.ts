import { Router } from "express";
import { authenticate, projectMemberGuard } from "../../middleware/auth.js";
import * as tasksController from "./tasks.controller.js";

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(projectMemberGuard("projectId"));

router.get("/", tasksController.list);
router.post("/", tasksController.create);
router.patch("/:taskId", tasksController.update);
router.patch("/:taskId/status", tasksController.updateStatus);
router.delete("/:taskId", tasksController.remove);

export default router;
