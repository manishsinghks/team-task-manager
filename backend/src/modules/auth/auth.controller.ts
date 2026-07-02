import type { Request, Response } from "express";
import * as authService from "./auth.service.js";
import { signupSchema, loginSchema } from "../../validators/auth.schema.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const signup = asyncHandler(async (req, res) => {
  const body = signupSchema.parse(req.body);
  const result = await authService.signup(body);
  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const result = await authService.login(body.email, body.password);
  res.json({ success: true, data: result });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user!.userId);
  res.json({ success: true, data: user });
});
