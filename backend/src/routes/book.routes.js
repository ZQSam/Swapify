import express from "express";
import * as bookController from "../controllers/book.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, bookController.createBook);
router.get("/", optionalAuth, bookController.listBooks);
router.get("/my/listings", requireAuth, bookController.getMyBooks);
router.get("/:id", optionalAuth, bookController.getBook);
router.put("/:id", requireAuth, bookController.updateBook);
router.delete("/:id", requireAuth, bookController.closeBook);

export default router;
