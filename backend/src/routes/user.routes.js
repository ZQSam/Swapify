import express from "express";
import * as userController from "../controllers/user.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", requireAuth, userController.getMe);
router.put("/me", requireAuth, userController.updateMe);
router.put("/me/password", requireAuth, userController.changePassword);
router.get("/:id", optionalAuth, userController.getProfile);

export default router;
