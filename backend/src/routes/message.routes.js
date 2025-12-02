import express from "express";
import * as messageController from "../controllers/message.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/unread-count", messageController.getUnreadCount);

router.get("/conversations", messageController.getConversations);

router.get("/with/:userId", messageController.getMessagesWith);

router.patch("/:messageId/read", messageController.markAsRead);

router.post("/", messageController.sendMessage);

router.post("/purchase-request", messageController.sendPurchaseRequestMessage);

export default router;
