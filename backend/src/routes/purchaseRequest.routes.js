import { Router } from "express";
import * as purchaseRequestController from "../controllers/purchaseRequest.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/", purchaseRequestController.createPurchaseRequest);
router.get("/check/:bookId", purchaseRequestController.checkExistingRequest);
router.patch("/:id/complete", purchaseRequestController.completePurchaseRequest);
router.patch("/:id/reject", purchaseRequestController.rejectPurchaseRequest);
router.patch("/:id/cancel", purchaseRequestController.cancelPurchaseRequest);

export default router;
