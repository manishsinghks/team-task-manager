import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.me);

export default router;
