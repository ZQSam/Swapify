import express from "express";
import * as requestController from "../controllers/request.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, requestController.createRequest);
router.get("/received", requireAuth, requestController.getReceivedRequests);
router.get("/sent", requireAuth, requestController.getSentRequests);
router.post("/:id/complete", requireAuth, requestController.completeRequest);
router.post("/:id/reject", requireAuth, requestController.rejectRequest);
router.post("/:id/cancel", requireAuth, requestController.cancelRequest);

export default router;
