import express from "express";
import * as messageController from "../controllers/message.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// All message routes require authentication
router.use(requireAuth);

// Get unread count (specific route first)
router.get("/unread-count", messageController.getUnreadCount);

// Get all conversations
router.get("/conversations", messageController.getConversations);

// Get messages with a specific user
router.get("/with/:userId", messageController.getMessagesWith);

// Mark message as read
router.patch("/:messageId/read", messageController.markAsRead);

// Send text message
router.post("/", messageController.sendMessage);

// Send purchase request message
router.post("/purchase-request", messageController.sendPurchaseRequestMessage);

export default router;
