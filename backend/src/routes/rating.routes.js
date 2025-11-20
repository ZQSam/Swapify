import express from "express";
import * as ratingController from "../controllers/rating.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, ratingController.createRating);
router.get("/users/:id", optionalAuth, ratingController.getUserRatings);

export default router;
