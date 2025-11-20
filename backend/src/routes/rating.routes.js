import express from "express";
import * as ratingController from "../controllers/rating.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, ratingController.createRating);

export default router;
