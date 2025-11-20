import express from "express";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/request-code", authController.requestCode);
router.post("/verify-code", authController.verifyCode);
router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
