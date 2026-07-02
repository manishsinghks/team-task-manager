import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import * as analyticsController from "./analytics.controller.js";

const router = Router();

router.use(authenticate);
router.get("/dashboard", analyticsController.dashboard);

export default router;
