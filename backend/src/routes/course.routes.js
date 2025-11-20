import express from "express";
import * as courseController from "../controllers/course.controller.js";

const router = express.Router();

router.get("/", courseController.listCourses);
router.get("/search", courseController.searchCourses);

export default router;
