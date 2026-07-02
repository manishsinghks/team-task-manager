import { Router } from "express";
import { Role } from "@prisma/client";
import {
  authenticate,
  projectAdminGuard,
  projectMemberGuard,
  requireGlobalRole,
} from "../../middleware/auth.js";
import * as projectsController from "./projects.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", projectsController.list);
router.post("/", requireGlobalRole(Role.ADMIN), projectsController.create);
router.get("/:projectId", projectMemberGuard("projectId"), projectsController.getOne);
router.patch("/:projectId", projectAdminGuard("projectId"), projectsController.update);
router.delete("/:projectId", projectAdminGuard("projectId"), projectsController.remove);
router.post("/:projectId/members", projectAdminGuard("projectId"), projectsController.addMember);
router.delete(
  "/:projectId/members/:userId",
  projectAdminGuard("projectId"),
  projectsController.removeMember,
);

export default router;
