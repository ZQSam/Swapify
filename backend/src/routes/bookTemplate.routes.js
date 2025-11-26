import express from "express";
import * as bookTemplateController from "../controllers/bookTemplate.controller.js";

const router = express.Router();

router.get("/search", bookTemplateController.searchTemplates);
router.get("/terms", bookTemplateController.getAvailableTerms);
router.get("/:id", bookTemplateController.getTemplate);

export default router;
